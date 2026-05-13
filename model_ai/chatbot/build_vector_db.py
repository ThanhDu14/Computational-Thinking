# ============================================================
# vector_db_pipeline.py
# [THAY ĐỔI] RAW_DATA_FOLDER và CHUNKS_PATH lấy từ config
#            thay vì hardcode string
# ============================================================

import os
import json

from model_ai.chatbot.src.data_pipeline.loader import Loader
from model_ai.chatbot.src.data_pipeline.chunker import TextSplitter
from model_ai.chatbot.src.embeddings.embedder import Embedder

# [THAY ĐỔI] Import từ config
from model_ai.chatbot.src.config.config import DATA_DIR, CHUNKS_FILE


class VectorDBPipeline:

    def __init__(self):
        # [THAY ĐỔI] Dùng biến từ config
        self.loader = Loader(DATA_DIR)
        self.splitter = TextSplitter()
        self.embedder = Embedder()

    # -----------------------------
    # Step 1: Load + Split
    # -----------------------------
    def load_and_prepare_documents(self):
        print("Loading JSON documents...")

        raw_data = self.loader.load_documents()

        docs = []
        for item in raw_data:
            chunks = self.splitter.split(item)
            docs.extend(chunks)

        print(f"Loaded {len(docs)} documents")
        return docs

    # -----------------------------
    # Step 2: Save chunks.json
    # -----------------------------
    def save_chunks(self, docs):
        # [THAY ĐỔI] Dùng CHUNKS_FILE từ config
        os.makedirs(os.path.dirname(CHUNKS_FILE), exist_ok=True)

        data = []
        for doc in docs:
            data.append({
                "content": doc.page_content,
                "metadata": doc.metadata
            })

        with open(CHUNKS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        print(f"Chunks saved → {CHUNKS_FILE}")

    # -----------------------------
    # Step 3: Build Vector DB
    # -----------------------------
    def build_vector_db(self):
        print("Building vector database...")
        # [THAY ĐỔI] Truyền CHUNKS_FILE từ config
        self.embedder.build_vector_db(CHUNKS_FILE)

    # -----------------------------
    # Pipeline
    # -----------------------------
    def run(self):
        docs = self.load_and_prepare_documents()

        if len(docs) == 0:
            raise ValueError("❌ No documents found. Check your raw data!")

        self.save_chunks(docs)
        self.build_vector_db()


def main():
    pipeline = VectorDBPipeline()
    pipeline.run()


if __name__ == "__main__":
    main()