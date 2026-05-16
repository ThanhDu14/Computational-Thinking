# ============================================================
# prompt_template.py
# [THAY ĐỔI] Thêm yêu cầu trả lời dạng Markdown
#            để frontend có thể render đẹp mắt
# ============================================================

class PromptTemplate:
    def __init__(self):
        pass

    def build_prompt(self, query, contexts, history):
        processed_contexts = []

        for c in contexts:
            data = c.get("data", {})

            name        = data.get("location_name", "Unknown")
            address     = data.get("address", "")
            category    = data.get("category", "")
            description = data.get("description", "")
            rating      = data.get("overall_rating", "")
            url         = data.get("url", "")

            text = f"""
Place Name: {name}
Address: {address}
Category: {category}
Description: {description}
Average Rating: {rating}
URL: {url}
"""
            processed_contexts.append(f"[PLACE]\n{text.strip()}")

        context_text = "\n\n".join(processed_contexts)

        history_summary = ""
        history_recent  = ""

        if history:
            history_summary = history.get("summary", "")
            history_recent  = history.get("recent", "")

        # [THAY ĐỔI] Thêm phần FORMAT MARKDOWN vào prompt
        prompt = f"""
        Bạn là một trợ lý AI du lịch thông minh.

        ⚠️ NGUYÊN TẮC QUAN TRỌNG NHẤT:
        - CHỈ được sử dụng thông tin trong phần <CONTEXT>
        - KHÔNG được sử dụng kiến thức bên ngoài
        - KHÔNG suy đoán
        - Nếu không có thông tin → trả lời: "Tôi không biết"
        """
        return prompt.strip()