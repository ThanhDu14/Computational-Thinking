from src.vectorstore.vectordb import VectorDB
from src.retriever.retriever import Retriever
from src.retriever.reranker import Reranker
from src.prompt.prompt_template import PromptTemplate
from src.llm.groq_client import GroqClient
from src.embeddings.embedding_model import EmbeddingModel
from src.memory.chat_memory import ChatMemory


class RAGPipeline:
    """
    End-to-end RAG pipeline
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

        # Chat memory
        self.memory = ChatMemory()

    def ask(self, query: str):

        # 1 retrieve documents
        docs = self.retriever.retrieve(query)

        # 2 rerank documents
        docs = self.reranker.rerank(query, docs)

        # 3 build prompt
        prompt = self.prompt_builder.build_prompt(
            query=query,
            contexts=docs,
            history=self.memory.get_history()
        )

        # 4 generate answer
        answer = self.llm.generate(prompt)

        # 5 save history
        self.memory.add_user_message(query)
        self.memory.add_assistant_message(answer)

        return answer