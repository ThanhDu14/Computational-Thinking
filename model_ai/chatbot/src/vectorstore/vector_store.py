# ============================================================
# vector_store.py
# [THAY ĐỔI] HF repo, file names, local dir lấy từ config
# ============================================================

from model_ai.chatbot.utils.download_dataset import download_from_hf
from model_ai.chatbot.src.vectorstore.vectordb import VectorDB

# [THAY ĐỔI] Import từ config
from model_ai.chatbot.src.config.config import HF_REPO_ID, HF_FAISS_FILE, HF_DOCS_FILE, VECTOR_DB_DIR


class VectorStore:
    def __init__(self):
        self.db = None

    def load(self):
        # [THAY ĐỔI] Dùng biến từ config thay vì string cứng
        index_path = download_from_hf(
            repo_id=HF_REPO_ID,
            file_name=HF_FAISS_FILE,
            local_dir=VECTOR_DB_DIR
        )

        docs_path = download_from_hf(
            repo_id=HF_REPO_ID,
            file_name=HF_DOCS_FILE,
            local_dir=VECTOR_DB_DIR
        )

        self.db = VectorDB(index_path, docs_path)
        print("✅ VectorDB ready!")

    def search(self, query_vector, top_k=5):
        return self.db.search(query_vector, top_k)

    def get_db(self):
        if self.db is None:
            raise ValueError("VectorStore chưa được load!")
        return self.db


# Singleton
vector_store = VectorStore()