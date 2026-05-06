class Reranker:
    def __init__(self):
        pass

    def rerank(self, query, docs, top_k=5):
        query_lower = query.lower()
        
        for doc in docs:
            data = doc.get("data", {})
            address = str(data.get("address", "")).lower()
            name = str(data.get("location_name", "")).lower()
            category = str(data.get("category", "")).lower()
            
            score = doc.get("score", 0)

            # [CẢI TIẾN] Dynamic Matching thay vì Hardcode
            # Lấy từng từ khóa trong tên địa điểm để check với query
            name_words = [word for word in name.split() if len(word) > 2] 
            matched_words = sum(1 for word in name_words if word in query_lower)
            
            if matched_words > 0:
                score += (0.1 * matched_words) # Boost nhẹ cho mỗi từ trùng
                
            # Trùng nguyên cụm tên
            if name in query_lower:
                score += 0.4 # Boost rất mạnh

            # Liên quan du lịch
            if any(k in query_lower for k in ["du lịch", "tham quan", "địa điểm", "chơi", "ăn"]):
                if any(k in category for k in ["du lịch", "tham quan", "phiêu lưu", "khám phá"]):
                    score += 0.1

            doc["rerank_score"] = score

        # Sort lại theo rerank_score
        docs = sorted(docs, key=lambda x: x["rerank_score"], reverse=True)
        return docs[:top_k]