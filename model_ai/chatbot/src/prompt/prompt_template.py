import re


class PromptTemplate:

    def __init__(self):
        self.number_map = {
            "một": 1, "hai": 2, "ba": 3, "bốn": 4, "tư": 4,
            "năm": 5, "sáu": 6, "bảy": 7, "bẩy": 7,
            "tám": 8, "chín": 9, "mười": 10,
        }

    def extract_limit(self, query: str) -> int:
        q = query.lower()
        for pattern in [r"top\s+(\d+)", r"(\d+)\s+(?:địa điểm|nơi|quán|khách sạn|điểm)"]:
            m = re.search(pattern, q)
            if m:
                return int(m.group(1))
        for word, val in self.number_map.items():
            for pattern in [rf"\btop\s+{word}\b", rf"\b{word}\s+(?:địa điểm|nơi|quán|khách sạn)\b"]:
                if re.search(pattern, q):
                    return val
        return 3

    @staticmethod
    def _place_block(idx: int, total: int) -> str:
        label = f"địa điểm {idx}/{total}"
        return (
            f"location_name: [tên {label} từ CONTEXT]\n"
            f"address: [địa chỉ {label} từ CONTEXT]\n"
            f"category: [loại {label} từ CONTEXT]\n"
            f"description: [đúng 3 câu viết lại từ mô tả {label} trong CONTEXT]\n"
            f"overall_rating: [rating {label} từ CONTEXT]\n"
            f"url: [url {label} từ CONTEXT]"
        )

    def build_prompt(self, query: str, contexts: list, history: dict) -> str:

        requested = self.extract_limit(query)
        over_limit = requested > 5
        limit = min(requested, 5)
        contexts = contexts[:limit]
        actual_count = len(contexts)

        # --- Build context blocks ---
        context_blocks = []
        for c in contexts:
            d = c.get("data", {})
            context_blocks.append(
                f"[PLACE]\n"
                f"Place Name: {d.get('location_name', '')}\n"
                f"Address: {d.get('address', '')}\n"
                f"Category: {d.get('category', '')}\n"
                f"Description: {d.get('description', '')}\n"
                f"Average Rating: {d.get('overall_rating', '')}\n"
                f"URL: {d.get('url', '')}"
            )
        context_text = "\n\n".join(context_blocks) if context_blocks else "Không có dữ liệu."

        # --- Determine response template type ---
        has_data = actual_count > 0

        if over_limit:
            place_message = f"Mình chỉ có thể gợi ý tối đa 5 địa điểm thôi, dưới đây là {actual_count} địa điểm phù hợp cho bạn!"
        elif actual_count == 1:
            place_message = "Đây là thông tin địa điểm bạn muốn biết thêm!"
        else:
            place_message = f"Dưới đây là {actual_count} địa điểm mình gợi ý cho bạn!"

        # [PERF] Chỉ build MẪU phù hợp thay vì cả 3
        if has_data and actual_count == 1:
            # Mẫu A
            template_section = (
                f"MẪU TRẢ LỜI (1 địa điểm)\n"
                f"Message: {place_message}\n"
                f"{self._place_block(1, 1)}\n"
            )
        elif has_data:
            # Mẫu B
            mau_b_blocks = f"Message: {place_message}\n"
            for i in range(1, actual_count + 1):
                mau_b_blocks += self._place_block(i, actual_count)
                if i < actual_count:
                    mau_b_blocks += "\n\n"
            template_section = (
                f"MẪU TRẢ LỜI ({actual_count} địa điểm)\n"
                f"{mau_b_blocks}\n"
            )
        else:
            # Mẫu C
            template_section = (
                "MẪU TRẢ LỜI (không có dữ liệu / chào hỏi)\n"
                "Message: [trả lời tự nhiên, đúng ý người dùng; nếu không có dữ liệu thì nói rõ chưa có thông tin trong dữ liệu hiện tại]\n"
                "location_name: NULL\n"
                "address: NULL\n"
                "category: NULL\n"
                "description: NULL\n"
                "overall_rating: NULL\n"
                "url: NULL\n"
            )

        prompt = (
            "Bạn là Travel AI, trợ lý tư vấn du lịch thân thiện và chuyên nghiệp.\n"
            "\n"
            "QUY TẮC\n"
            "- Hỗ trợ tìm địa điểm du lịch, quán ăn, khách sạn, điểm tham quan.\n"
            "- Chào hỏi/câu hỏi thường: trả lời ngắn gọn, thân thiện. Câu hỏi ngoài du lịch: trả lời lịch sự rồi kéo lại chủ đề.\n"
            "- Mọi nội dung ngoài 6 field block phải nằm trong Message. Không tạo dòng thừa.\n"
            "- CHỈ dùng dữ liệu trong CONTEXT. Không bịa tên, địa chỉ, mô tả, rating, url.\n"
            "- Nếu địa điểm người dùng hỏi KHÔNG CÓ CHÍNH XÁC trong CONTEXT → dùng block NULL, nói rõ trong Message là chưa có thông tin.\n"
            "- Không suy diễn từ tên giống một phần hoặc cùng khu vực.\n"
            "\n"
            "FORMAT BẮT BUỘC\n"
            "- Bắt đầu bằng 'Message:'. Sau đó là block địa điểm hoặc block NULL.\n"
            "- Không dùng markdown, bullet, JSON, code block.\n"
            "- Mỗi block: location_name, address, category, description, overall_rating, url (đúng thứ tự, đủ 6 field).\n"
            "- description: viết lại từ CONTEXT, đúng 3 câu ngắn gọn, kết thúc bằng dấu chấm.\n"
            "- Message: tự nhiên, thân thiện, đúng trọng tâm.\n"
            "- Tối đa 5 địa điểm.\n"
            "\n"
            f"{template_section}\n"
            "CONTEXT\n"
            f"{context_text}\n"
            "\n"
            "USER QUESTION\n"
            f"{query}\n"
            "\n"
            "RESPONSE\n"
            "Message:"
        )

        return prompt.strip()
