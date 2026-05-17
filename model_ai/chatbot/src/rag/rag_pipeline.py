from model_ai.chatbot.src.retriever.retriever import Retriever
from model_ai.chatbot.src.retriever.reranker import Reranker
from model_ai.chatbot.src.prompt.prompt_template import PromptTemplate
from model_ai.chatbot.src.memory.chat_memory import ChatMemory
from model_ai.chatbot.src.vectorstore.vector_store import vector_store

class RAGPipeline:
    def __init__(self, embedding_model, llm, user_id="guest", session_id=None):
        # [FIXED] Nhận embedding_model và llm từ ngoài vào để không tốn RAM khởi tạo lại
        self.embedding_model = embedding_model
        self.llm = llm
        
        self.vectordb = vector_store.get_db()
        self.retriever = Retriever(self.embedding_model, self.vectordb)
        self.reranker = Reranker()
        self.prompt_builder = PromptTemplate()

        self.memory = ChatMemory(
            session_id=session_id,
            user_id=user_id
        )

    def ask(self, query: str, user_message_override: str = None):
        docs = self.retriever.retrieve(query)
        docs = self.reranker.rerank(query, docs)
        history_data = self.memory.get_context()
        
        prompt = self.prompt_builder.build_prompt(
            query=query,
            contexts=docs,
            history=history_data
        )
 
        answer = self.llm.generate(prompt)
 
        self.memory.add_chat(
            user_message=user_message_override if user_message_override is not None else query,
            assistant_message=answer,
            llm=self.llm
        )
 
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