from src.vectorstore.vectordb import VectorDB
from src.retriever.retriever import Retriever
from src.retriever.reranker import Reranker
from src.prompt.prompt_template import PromptTemplate
from src.llm.groq_client import GroqClient
from src.embeddings.embedding_model import EmbeddingModel
from src.memory.chat_memory import ChatMemory


class RAGPipeline:
    """
    End-to-end RAG pipeline with session management and summarization
    """

    def __init__(
        self,
        index_path="embeddings/vector_db/faiss.index",
        texts_path="embeddings/vector_db/docs.json"
    ):

        # Embedding model
        self.embedding_model = EmbeddingModel()

        # Vector database
        self.vectordb = VectorDB(index_path, texts_path)

        # Retriever
        self.retriever = Retriever(self.embedding_model, self.vectordb)

        # Reranker
        self.reranker = Reranker()

        # Prompt builder
        self.prompt_builder = PromptTemplate()

        # LLM client
        self.llm = GroqClient()

        # Chat memory (shared for all sessions)
        self.memory = ChatMemory()

    def ask(self, query: str, session_id: str = None):
        # 1. Get history and summary
        history = []
        summary = ""
        if session_id:
            history = self.memory.get_session_history(session_id)
            summary = self.memory.get_summary(session_id)

        # 2. Retrieve documents
        docs = self.retriever.retrieve(query)

        # 3. Rerank documents
        docs = self.reranker.rerank(query, docs)

        # 4. Build prompt (including summary and recent history)
        # Only take last 10 messages for current context if summary exists
        recent_history = history[-10:] if summary else history
        
        full_query = f"[Summary of previous conversation: {summary}]\n\nUser: {query}" if summary else query

        prompt = self.prompt_builder.build_prompt(
            query=full_query,
            contexts=docs,
            history=recent_history
        )

        # 5. Generate answer
        answer = self.llm.generate(prompt)

        # 6. Save history
        if session_id:
            self.memory.add_message(session_id, "user", query)
            self.memory.add_message(session_id, "assistant", answer)
            
            # Check for title generation (after 2 user messages)
            updated_history = self.memory.get_session_history(session_id)
            user_msgs = [m for m in updated_history if m["role"] == "user"]
            
            if len(user_msgs) == 2:
                self.auto_generate_title(session_id, updated_history)
                
            # Check for summarization (if history > 20 messages)
            if len(updated_history) > 20:
                self.auto_summarize(session_id, updated_history)

        return answer

    def auto_generate_title(self, session_id, history):
        """
        Generate a short title based on the first 2 messages
        """
        content = "\n".join([f"{m['role']}: {m['content']}" for m in history[:4]])
        prompt = f"Dựa vào nội dung hội thoại sau, hãy đặt một tiêu đề cực ngắn (dưới 5 từ) cho cuộc hội thoại này. Chỉ trả về tiêu đề, không thêm gì khác.\n\nNội dung:\n{content}"
        
        try:
            title = self.llm.generate(prompt).strip().replace('"', '')
            self.memory.update_title(session_id, title)
        except Exception as e:
            print(f"Failed to generate title: {e}")

    def auto_summarize(self, session_id, history):
        """
        Summarize the conversation so far
        """
        content = "\n".join([f"{m['role']}: {m['content']}" for m in history])
        old_summary = self.memory.get_summary(session_id)
        
        prompt = f"Hãy tóm tắt nội dung chính của cuộc hội thoại sau đây để lưu trữ bộ nhớ. "
        if old_summary:
            prompt += f"Đây là tóm tắt trước đó: {old_summary}. "
        prompt += f"\n\nNội dung mới:\n{content}\n\nTóm tắt mới (ngắn gọn, súc tích):"
        
        try:
            new_summary = self.llm.generate(prompt).strip()
            self.memory.update_summary(session_id, new_summary)
        except Exception as e:
            print(f"Failed to summarize: {e}")