class Cleaner:

    @staticmethod
    def clean_text(text: str) -> str:
        import re
        import unicodedata

        if not isinstance(text, str):
            return ""

        text = unicodedata.normalize("NFC", text)

        text = "".join(
            char for char in text
            if not unicodedata.category(char).startswith("C") or char in ["\n", "\t"]
        )

        text = re.sub(r'[^\w\s.,!?;:()\-\*]', '', text)

        return text.strip()

    @staticmethod
    def build_embedding_text(item: dict) -> str:
        name = item.get("location_name", "")
        category = item.get("category", "")
        address = item.get("address", "")
        description = item.get("description", "")
        # 🔥 xử lý category
        if isinstance(category, list):
            category_text = ", ".join(category)
        else:
            category_text = str(category)

        return f"{name} ở {address} là địa điểm du lịch với những đặc trưng về {category_text}. {description}"

    @staticmethod
    def remove_reviews(item: dict, keys_to_remove: list = ["reviews", "images", "rating_count", "opening_hours"]) -> dict:
        """🔥 remove item trước khi trả về"""
        item = item.copy()
        for key in keys_to_remove:
            item.pop(key, None)
            
        return item