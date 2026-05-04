import faiss
import json
import numpy as np


class VectorDB:
    def __init__(self, index_path, texts_path):
        self.index = faiss.read_index(index_path)

        with open(texts_path, "r", encoding="utf-8") as f:
            self.docs = json.load(f)   # 🔥 đổi tên cho rõ nghĩa

    def search(self, query_vector, top_k=5):
        # 👉 đảm bảo đúng shape (1, dim)
        query_vector = np.array([query_vector]).astype("float32")

        # 🔥 normalize để dùng cosine similarity
        faiss.normalize_L2(query_vector)

        # search bằng inner product
        scores, indices = self.index.search(query_vector, top_k)

        results = []

        for i, idx in enumerate(indices[0]):
            if idx == -1:
                continue

            doc = self.docs[idx]

            results.append({
                "score": float(scores[0][i]),
                "data": doc.get("metadata", {}),   # 🔥 QUAN TRỌNG
                "content": doc.get("content", "") # (optional debug)
            })

        return results