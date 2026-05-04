import os
import json

from src.data_pipeline.loader import Loader
from src.data_pipeline.chunker import TextSplitter
from src.embeddings.embedder import Embedder


RAW_DATA_FOLDER = "data/raw"
CHUNKS_PATH = "data/processed/chunks.json"


class VectorDBPipeline:

    def __init__(self):
        self.loader = Loader(RAW_DATA_FOLDER)
        self.splitter = TextSplitter()
        self.embedder = Embedder()

    # -----------------------------
    # Step 1: Load + Split (DUY NHẤT 1 LẦN)
    # -----------------------------
    def load_and_prepare_documents(self):
        print("Loading JSON documents...")

        raw_data = self.loader.load_documents()

        docs = []

        for item in raw_data:
            # 🔥 split trực tiếp từ JSON → Document
            chunks = self.splitter.split(item)
            docs.extend(chunks)

        print(f"Loaded {len(docs)} documents")

        return docs

    # -----------------------------
    # Step 2: Save chunks.json
    # -----------------------------
    def save_chunks(self, docs):
        os.makedirs(os.path.dirname(CHUNKS_PATH), exist_ok=True)

        data = []

        for doc in docs:
            data.append({
                "content": doc.page_content,   # 👉 text để embed
                "metadata": doc.metadata      # 👉 full info (đã bỏ review)
            })

        with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        print(f"Chunks saved → {CHUNKS_PATH}")

    # -----------------------------
    # Step 3: Build Vector DB
    # -----------------------------
    def build_vector_db(self):
        print("Building vector database...")
        self.embedder.build_vector_db(CHUNKS_PATH)

    # -----------------------------
    # Pipeline
    # -----------------------------
    def run(self):
        # ✅ 1. load + split
        docs = self.load_and_prepare_documents()

        if len(docs) == 0:
            raise ValueError("❌ No documents found. Check your raw data!")

        # ✅ 2. save chunks
        self.save_chunks(docs)

        # ✅ 3. build vector DB
        self.build_vector_db()


def main():
    pipeline = VectorDBPipeline()
    pipeline.run()


if __name__ == "__main__":
    main()