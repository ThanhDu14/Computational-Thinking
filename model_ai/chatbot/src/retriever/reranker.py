import re

class Reranker:
    def __init__(self):
        # có thể mở rộng thêm
        self.location_keywords = [
            "huế", "hồ chí minh", "hcm", "sài gòn",
            "an giang", "đà lạt", "hà nội"
        ]

    def extract_location(self, query: str):
        query = query.lower()
        for loc in self.location_keywords:
            if loc in query:
                return loc
        return None

    def rerank(self, query, docs, top_k=5):
        query_lower = query.lower()
        target_location = self.extract_location(query)

        for doc in docs:
            data = doc.get("data", {})
            address = str(data.get("address", "")).lower()
            name = str(data.get("location_name", "")).lower()
            category = str(data.get("category", "")).lower()

            score = doc.get("score", 0)

            # 🔥 1. BOOST nếu match location
            if target_location:
                if target_location in address or target_location in name:
                    score += 0.3   # boost mạnh

            # 🔥 2. BOOST nếu liên quan du lịch
            if any(k in query_lower for k in ["du lịch", "tham quan", "địa điểm"]):
                if any(k in category for k in ["du lịch", "tham quan", "phiêu lưu", "khám phá"]):
                    score += 0.1

            # 🔥 3. phạt nếu KHÔNG cùng location
            if target_location:
                if target_location not in address and target_location not in name:
                    score -= 0.2

            doc["rerank_score"] = score

        # 🔥 sort lại
        docs = sorted(docs, key=lambda x: x["rerank_score"], reverse=True)

        return docs[:top_k]