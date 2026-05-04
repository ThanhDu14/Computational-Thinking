class PromptTemplate:
    """
    Build prompt for RAG chatbot
    """

    def __init__(self):
        pass

    def build_prompt(self, query, contexts, history):
        processed_contexts = []

        for c in contexts:
            data = c.get("data", {})

            name = data.get("location_name", "Unknown")
            address = data.get("address", "")
            category = data.get("category", "")
            description = data.get("description", "")
            rating = data.get("overall_rating", "")
            url = data.get("url", "")

            # 🔥 build text cho mỗi place
            text = f"""
Place Name: {name}
Address: {address}
Category: {category}
Description: {description}
Average Rating: {rating}
URL: {url}
"""
            processed_contexts.append(text.strip())  # ✅ QUAN TRỌNG

        # 🔥 FIX: tạo context_text
        context_text = "\n\n".join(processed_contexts)

        # ===== history =====
        history_text = ""
        if history:
            history_lines = []
            for h in history:
                role = h.get("role", "")
                content = h.get("content", "")
                history_lines.append(f"{role}: {content}")
            history_text = "\n".join(history_lines)

        # ===== PROMPT (GIỮ NGUYÊN) =====
        prompt = f"""
Bạn là một trợ lý AI du lịch thông minh.

Nhiệm vụ của bạn là trả lời câu hỏi của người dùng CHỈ dựa trên thông tin trong phần Context được cung cấp.
Tuyệt đối không tự bịa thêm thông tin ngoài Context.
=====================
QUY TẮC TRẢ LỜI:
1. Hiểu đúng ý định câu hỏi của người dùng:
   - Nếu người dùng hỏi gợi ý (ví dụ: "đi đâu", "có gì chơi") → trả về tối đa 3 địa điểm phù hợp nhất.
   - Nếu hỏi về 1 địa điểm cụ thể → chỉ trả lời về địa điểm đó.
   - Nếu hỏi so sánh → so sánh dựa trên các thông tin có trong Context.
   - Nếu không đủ thông tin → trả lời "Tôi không biết".

2. Khi trả về danh sách địa điểm:
   - Chỉ chọn tối đa 3 địa điểm liên quan nhất.
   - Không liệt kê lan man.

3. Format khi mô tả địa điểm:
   - Place Name: [Tên địa điểm]
   - Address: [Địa chỉ nếu có]
   - Description: [Mô tả chi tiết dựa trên Context]
   - Average Rating: [Nếu có]
   - URL: [Nếu có]

4. Không được:
   - Bịa thông tin
   - Suy luận ngoài Context
   - Thêm thông tin không tồn tại trong dữ liệu

5. Nếu người dùng hỏi về địa chỉ chi tiết nhưng Context không có:
   - Không bịa
   - Thay vào đó mô tả vị trí dựa trên Description (nếu có)

=====================
Context:
{context_text}
=====================

Chat History:
{history_text}

User Question:
{query}

Answer:
"""

        return prompt.strip()