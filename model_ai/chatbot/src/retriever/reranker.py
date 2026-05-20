from sentence_transformers import CrossEncoder

class Reranker:
    def __init__(self):
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = CrossEncoder(
            "BAAI/bge-reranker-v2-m3",
            device=device
        )

    def rerank(self, query, docs, top_k=5):

        pairs = []

        for doc in docs:
            data = doc.get("data", {})

            text = f"""
            Tên địa điểm: {data.get('location_name', '')}

            Địa chỉ: {data.get('address', '')}

            Loại hình: {data.get('category', '')}

            Mô tả: {data.get('description', '')}
            """

            pairs.append((query, text))

        scores = self.model.predict(pairs)

        for doc, score in zip(docs, scores):
            doc["rerank_score"] = float(score)

        docs = sorted(
            docs,
            key=lambda x: x["rerank_score"],
            reverse=True
        )

        return docs[:top_k]