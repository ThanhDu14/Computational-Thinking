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

    def ask(self, query: str):
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
            user_message=query,
            assistant_message=answer,
            llm=self.llm
        )

        return answer