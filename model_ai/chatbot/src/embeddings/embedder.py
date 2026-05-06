import json
import os
import faiss
import numpy as np

from src.embeddings.embedding_model import EmbeddingModel


class Embedder:
    def __init__(self):
        self.data_path = "data"
        self.vector_db_path = "embeddings/vector_db"

        os.makedirs(self.vector_db_path, exist_ok=True)

        print("Loading embedding model...")
        self.embedding_model = EmbeddingModel()
        print("Embedding model loaded!")

    def load_chunks(self, path=None):
        """
        👉 Load cả content + metadata
        """
        if path is None:
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

        # 🔥 embed content (name + address + category)
        embeddings = self.embedding_model.embed_docs(contents)
        embeddings = np.array(embeddings).astype("float32")

        # 🔥 normalize để dùng cosine similarity
        faiss.normalize_L2(embeddings)

        dim = embeddings.shape[1]
        print(dim)

        index = faiss.IndexFlatIP(dim)
        index.add(embeddings)

        # 🔥 save index
        faiss.write_index(
            index,
            os.path.join(self.vector_db_path, "faiss.index")
        )

        # 🔥 save metadata + content (quan trọng)
        combined_data = []

        for content, metadata in zip(contents, metadatas):
            combined_data.append({
                "content": content,    # embedding text
                "metadata": metadata  # full info (no reviews)
            })

        with open(
            os.path.join(self.vector_db_path, "docs.json"),
            "w",
            encoding="utf-8"
        ) as f:
            json.dump(combined_data, f, ensure_ascii=False, indent=4)

        print("✅ Vector DB rebuilt successfully!")