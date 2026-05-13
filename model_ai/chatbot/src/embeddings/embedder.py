# ============================================================
# embedder.py
# [THAY ĐỔI] Import paths từ config thay vì hard-code
# ============================================================

import json
import os
import faiss
import numpy as np

from model_ai.chatbot.src.embeddings.embedding_model import EmbeddingModel

# [THAY ĐỔI] Import từ config
from model_ai.chatbot.src.config.config import DATA_DIR, VECTOR_DB_DIR


class Embedder:
    def __init__(self):
        # [THAY ĐỔI] Dùng biến từ config thay vì string cứng
        self.data_path = DATA_DIR
        self.vector_db_path = VECTOR_DB_DIR

        os.makedirs(self.vector_db_path, exist_ok=True)

        print("Loading embedding model...")
        self.embedding_model = EmbeddingModel()
        print("Embedding model loaded!")

    def load_chunks(self, path=None):
        """
        Load cả content + metadata từ chunks.json
        """
        if path is None:
            # [THAY ĐỔI] Dùng DATA_DIR từ config
            path = os.path.join(self.data_path, "chunks.json")

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        contents = []
        metadatas = []

        for item in data:
            contents.append(item.get("content", ""))
            metadatas.append(item.get("metadata", {}))

        return contents, metadatas

    def build_vector_db(self, chunks_path=None):
        contents, metadatas = self.load_chunks(chunks_path)

        print(f"Loaded {len(contents)} chunks")

        embeddings = self.embedding_model.embed_docs(contents)
        embeddings = np.array(embeddings).astype("float32")

        faiss.normalize_L2(embeddings)

        dim = embeddings.shape[1]
        print(f"Embedding dim: {dim}")

        index = faiss.IndexFlatIP(dim)
        index.add(embeddings)

        # [THAY ĐỔI] Dùng VECTOR_DB_DIR từ config
        faiss.write_index(
            index,
            os.path.join(self.vector_db_path, "index.faiss")
        )

        combined_data = []
        for content, metadata in zip(contents, metadatas):
            combined_data.append({
                "content": content,
                "metadata": metadata
            })

        with open(
            os.path.join(self.vector_db_path, "docs.json"),
            "w",
            encoding="utf-8"
        ) as f:
            json.dump(combined_data, f, ensure_ascii=False, indent=4)

        print("✅ Vector DB rebuilt successfully!")