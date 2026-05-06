from model_ai.chatbot.utils.download_dataset import download_from_hf
from model_ai.chatbot.src.vectorstore.vectordb import VectorDB 

class VectorStore:
    def __init__(self):
        self.db = None

    def load(self):
        # 🔥 1. Download nếu chưa có
        index_path = download_from_hf(
            repo_id="vngyyn/vector-db",
            file_name="index.faiss",
            local_dir="model_ai/chatbot/embeddings/vector_db"
        )

        docs_path = download_from_hf(
            repo_id="vngyyn/vector-db",
            file_name="docs.json",
            local_dir="model_ai/chatbot/embeddings/vector_db"
        )

        # 🔥 2. Khởi tạo VectorDB của bạn
        self.db = VectorDB(index_path, docs_path)

        print("✅ VectorDB ready!")

    def search(self, query_vector, top_k=5):
        return self.db.search(query_vector, top_k)
    
    def get_db(self):
        if self.db is None:
            raise ValueError("VectorStore chưa được load!")
        return self.db


# 🔥 Singleton (rất quan trọng)
vector_store = VectorStore()