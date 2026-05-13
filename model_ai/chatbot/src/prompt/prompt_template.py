import re

class PromptTemplate:
    def __init__(self):

        # map số chữ tiếng Việt
        self.number_map = {
            "một": 1,
            "hai": 2,
            "ba": 3,
            "bốn": 4,
            "tư": 4,
            "năm": 5,
            "sáu": 6,
            "bảy": 7,
            "bẩy": 7,
            "tám": 8,
            "chín": 9,
            "mười": 10
        }

    # ============================================================
    # extract limit từ query
    # ============================================================
    def extract_limit(self, query):

        query = query.lower()

        # =====================================================
        # PATTERN số dạng digit
        # ví dụ:
        # - 5 địa điểm
        # - top 4 quán cafe
        # =====================================================
        digit_patterns = [
            r'(\d+)\s+địa điểm',
            r'(\d+)\s+nơi',
            r'(\d+)\s+quán',
            r'(\d+)\s+khách sạn',
            r'(\d+)\s+điểm',
            r'top\s+(\d+)'
        ]

        for pattern in digit_patterns:

            match = re.search(pattern, query)

            if match:
                return min(int(match.group(1)), 10)

        # =====================================================
        # PATTERN số dạng chữ
        # ví dụ:
        # - bốn địa điểm
        # - top năm quán cafe
        # =====================================================
        for word, value in self.number_map.items():

            word_patterns = [
                rf'\b{word}\s+địa điểm\b',
                rf'\b{word}\s+nơi\b',
                rf'\b{word}\s+quán\b',
                rf'\b{word}\s+khách sạn\b',
                rf'top\s+{word}\b'
            ]

            for pattern in word_patterns:

                if re.search(pattern, query):
                    return value

        # =====================================================
        # mặc định
        # =====================================================
        return 3


    # ============================================================
    # build prompt
    # ============================================================
    def build_prompt(self, query, contexts, history):

        # ========================================================
        # LIMIT
        # ========================================================
        limit = self.extract_limit(query)

        # chỉ lấy đúng số lượng context
        contexts = contexts[:limit]

        actual_count = len(contexts)

        # ========================================================
        # CONTEXT PROCESSING
        # ========================================================
        processed_contexts = []

        for c in contexts:

            data = c.get("data", {})

            name = data.get("location_name", "Unknown")

            address = data.get("address", "")

            category = data.get("category", "")

            description = data.get("description", "")

            rating = data.get("overall_rating", "")

            url = data.get("url", "")

            text = f"""
Place Name: {name}
Address: {address}
Category: {category}
Description: {description}
Average Rating: {rating}
URL: {url}
"""

            processed_contexts.append(
                f"[PLACE]\n{text.strip()}"
            )

        context_text = "\n\n".join(processed_contexts)

        # ========================================================
        # HISTORY
        # ========================================================
        history_summary = ""
        history_recent = ""

        if history:
            history_summary = history.get("summary", "")
            history_recent = history.get("recent", "")

        # ========================================================
        # PROMPT
        # ========================================================
        prompt = f"""
Bạn là một trợ lý AI du lịch thông minh.

==================================================
⚠️ NGUYÊN TẮC QUAN TRỌNG NHẤT
==================================================

- CHỈ được sử dụng dữ liệu trong <CONTEXT>
- KHÔNG dùng kiến thức bên ngoài
- KHÔNG suy đoán
- KHÔNG được tự tạo thêm địa điểm
- KHÔNG được hallucinate
- CHỈ được dùng địa điểm có trong CONTEXT

==================================================
⚠️ QUY TẮC SỐ LƯỢNG
==================================================

- PHẢI trả CHÍNH XÁC {actual_count} địa điểm
- KHÔNG được trả nhiều hơn
- KHÔNG được trả ít hơn nếu context đủ dữ liệu
- Nếu user không nói số lượng:
  → mặc định là 3
- Số lượng tối đa là 10

==================================================
⚠️ QUY TẮC DESCRIPTION
==================================================

- PHẢI giữ nguyên description từ context
- KHÔNG được viết lại
- KHÔNG paraphrase
- KHÔNG thêm cảm xúc
- KHÔNG quảng cáo
- KHÔNG tóm tắt

==================================================
⚠️ FORMAT OUTPUT
==================================================

- PHẢI trả về JSON hợp lệ
- KHÔNG trả Markdown
- KHÔNG trả giải thích
- KHÔNG thêm text ngoài JSON
- JSON phải parse được bằng json.loads()

==================================================
⚠️ CATEGORY FORMAT
==================================================

- category phải là array string

Ví dụ:

[
    "Văn hóa",
    "Thư giãn"
]

==================================================
⚠️ OVERALL RATING
==================================================

- overall_rating phải là number

Ví dụ:

4.5

==================================================
⚠️ FORMAT JSON BẮT BUỘC
==================================================

Nếu có dữ liệu:

{{
    "success": true,
    "count": {actual_count},
    "places": [
        {{
            "location_name": "...",
            "address": "...",
            "category": ["..."],
            "description": "...",
            "overall_rating": 4.5,
            "url": "..."
        }}
    ]
}}

==================================================
⚠️ KHI KHÔNG CÓ DỮ LIỆU
==================================================

{{
    "success": false,
    "message": "Không tìm thấy thông tin"
}}

==================================================
<CONTEXT>
{context_text}
</CONTEXT>

==================================================
LƯU Ý VỀ HISTORY
==================================================

- History chỉ để hiểu ngữ cảnh hội thoại
- KHÔNG phải nguồn dữ liệu
- KHÔNG lấy dữ liệu địa điểm từ history

Chat Summary:
{history_summary}

Recent Conversation:
{history_recent}

==================================================
USER QUESTION
==================================================

{query}

==================================================
JSON RESPONSE
==================================================
"""
        return prompt.strip()