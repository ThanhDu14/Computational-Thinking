import re

class PromptTemplate:

    def __init__(self):

        # ========================================================
        # map số chữ tiếng Việt
        # ========================================================
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

        # ========================================================
        # pattern số dạng digit
        # ========================================================
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
                return min(int(match.group(1)), 5)

        # ========================================================
        # pattern số dạng chữ
        # ========================================================
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
                    return min(value, 5)

        # ========================================================
        # default
        # ========================================================
        return 3

    # ============================================================
    # build prompt
    # ============================================================
    def build_prompt(self, query, contexts, history):

        # ========================================================
        # LIMIT
        # ========================================================
        limit = self.extract_limit(query)

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
Bạn là trợ lý AI du lịch thông minh tên Travel AI.

==================================================
PHÂN LOẠI CÂU HỎI
==================================================

1. Nếu câu hỏi KHÔNG liên quan du lịch:

Ví dụ:
- xin chào
- hello
- hi
- cảm ơn
- bạn là ai
- hôm nay thế nào
- trò chuyện thông thường

→ Trả lời theo kiểu chatbot những phải đúng format key-value như bên dưới, KHÔNG được trả lời tự do, KHÔNG được thêm thông tin không có trong format, KHÔNG được bỏ field nào dù có dữ liệu hay không, KHÔNG được trả về JSON hay markdown, chỉ được trả về đúng format key-value như bên dưới và trả về NULL cho các field không có dữ liệu. Luôn luôn trả về đủ 6 field dù có dữ liệu hay không.

==================================================

2. Nếu câu hỏi liên quan:
- du lịch
- địa điểm
- quán cafe
- khách sạn
- ăn uống
- vui chơi
- điểm tham quan
- recommend
- đi đâu

→ trả thông tin địa điểm từ CONTEXT

==================================================

3. Nếu user hỏi thông tin chi tiết về 1 địa điểm:

Ví dụ:
- Hãy cho tôi biết thêm về Bà Nà Hills
- Thông tin về Cầu Rồng
- Đèo Hải Vân có gì

→ CHỈ trả đúng 1 địa điểm
→ KHÔNG gợi ý thêm địa điểm khác

==================================================
⚠️ QUAN TRỌNG
==================================================

- CHỈ dùng dữ liệu trong CONTEXT
- KHÔNG dùng kiến thức ngoài
- KHÔNG hallucinate
- KHÔNG tự tạo địa điểm
- KHÔNG thêm dữ liệu không tồn tại
- Description có thể ngắn gọn, chỉ cần nêu đặc trưng nổi bật nhất của địa điểm, tóm gọn trong 3 câu và trả về đúng 3 câu
==================================================
⚠️ QUY TẮC SỐ LƯỢNG
==================================================

- Nếu user yêu cầu số lượng:
→ trả đúng số lượng

- Nếu user không yêu cầu:
→ mặc định 3 địa điểm

- Tối đa 5 địa điểm

==================================================
⚠️ FORMAT OUTPUT
==================================================

- KHÔNG trả JSON
- KHÔNG markdown
- KHÔNG thêm text ngoài format
- PHẢI đúng format key-value
- KHÔNG được bỏ field
- Nếu không có dữ liệu → dùng NULL
- Có đầu đủ các field: message, location_name, address, category, description, overall_rating, url
- Chỉ cần trả về đúng format key-value, KHÔNG giải thích gì thêm
- Luôn trả về dưới dạng key-value, không được trả dạng câu văn tự do
- LUÔN LUÔN ĐÚNG FORMAT DƯỚI ĐÂY, KHÔNG ĐƯỢC LỆCH FORMAT, Luôn trả đủ 6 field dù có dữ liệu hay không
==================================================
⚠️ FORMAT CHO CHAT THƯỜNG 
==================================================

Message: Xin chào, tôi là Travel AI.
location_name: NULL
address: NULL
category: NULL
description: NULL
overall_rating: NULL
url: NULL

==================================================
⚠️ FORMAT CHO TRAVEL QUERY
==================================================

Message: Xin chào bạn, dưới đây là {actual_count} địa điểm phù hợp.

location_name: ...
address: ...
category: ...
description: ...
overall_rating: ...
url: ...

location_name: ...
address: ...
category: ...
description: ...
overall_rating: ...
url: ...

==================================================
⚠️ FORMAT KHI CHỈ HỎI 1 ĐỊA ĐIỂM
==================================================

Message: Dưới đây là thông tin địa điểm bạn yêu cầu.
location_name: ...
address: ...
category: ...
description: ...
overall_rating: ...
url: ...

==================================================
⚠️ KHI KHÔNG CÓ DỮ LIỆU
==================================================

Message: Không tìm thấy thông tin phù hợp.
location_name: NULL
address: NULL
category: NULL
description: NULL
overall_rating: NULL
url: NULL

==================================================
CONTEXT
==================================================

{context_text}

==================================================
CHAT HISTORY
==================================================

Summary:
{history_summary}

Recent:
{history_recent}

==================================================
USER QUESTION
==================================================

{query}

==================================================
RESPONSE
==================================================
"""
        return prompt.strip()
