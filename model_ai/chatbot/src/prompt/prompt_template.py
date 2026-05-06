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
            processed_contexts.append(f"[PLACE]\n{text.strip()}")  # ✅ QUAN TRỌNG

        # 🔥 FIX: tạo context_text
        context_text = "\n\n".join(processed_contexts)

        # ===== history =====
        history_summary = ""
        history_recent = ""

        if history:
            history_summary = history.get("summary", "")
            history_recent = history.get("recent", "")
        # if history:
        #     history_lines = []
        #     for h in history:
        #         role = h.get("role", "")
        #         content = h.get("content", "")
        #         history_lines.append(f"{role}: {content}")
        #     history_text = "\n".join(history_lines)

        # ===== PROMPT (GIỮ NGUYÊN) =====
        prompt = f"""
Bạn là một trợ lý AI du lịch thông minh.

⚠️ NGUYÊN TẮC QUAN TRỌNG NHẤT:
- CHỈ được sử dụng thông tin trong phần <CONTEXT>
- KHÔNG được sử dụng kiến thức bên ngoài
- KHÔNG suy đoán
- Nếu không có thông tin → trả lời: "Tôi không biết"

=====================
📌 QUY TẮC TRẢ LỜI:

1. Hiểu đúng ý định:
   - "đi đâu", "gợi ý" → tối đa 3 địa điểm
   - hỏi 1 địa điểm → chỉ trả lời về nó
   - so sánh → chỉ dùng dữ liệu có trong context
   - thiếu dữ liệu → "Tôi không biết"

2. Khi trả danh sách:
   - trả về danh sách số địa điểm theo người dùng yêu cầu, nếu không có yêu cầu thì trả tối đa 3 địa điểm
   - chọn relevant nhất
   - không lan man

3. ⚠️ FORMAT BẮT BUỘC:

Place Name: ...
Address: ...
Description: ...
Average Rating: ...
URL: ...

4. KHÔNG ĐƯỢC:
   - bịa thông tin
   - dùng kiến thức ngoài context
   - thêm thông tin không tồn tại

=====================
<CONTEXT>
{context_text}
</CONTEXT>

=====================
LƯU Ý VỀ HISTORY:
- History chỉ để hiểu câu hỏi
- KHÔNG phải nguồn dữ liệu
- KHÔNG dùng history để tạo thông tin mới

Chat Summary:
{history_summary}

Recent Conversation:
{history_recent}

=====================
User Question:
{query}

=====================
Answer:
"""

        return prompt.strip()