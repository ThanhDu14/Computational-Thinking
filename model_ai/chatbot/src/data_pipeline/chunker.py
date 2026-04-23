from langchain_core.documents import Document
from src.data_pipeline.cleaner import Cleaner
class TextSplitter:
    def __init__(self):
        pass
    
    def split(self, item: dict):
        """
        👉 KHÔNG còn nhận text nữa
        👉 nhận trực tiếp JSON item
        """

        from copy import deepcopy

        # 🔥 text dùng để embedding
        embedding_text = Cleaner.build_embedding_text(item)

        # 🔥 metadata giữ full info (nhưng bỏ review)
        metadata = Cleaner.remove_reviews(deepcopy(item))

        return [
            Document(
                page_content=embedding_text,  # 👉 chỉ embed cái này
                metadata=metadata             # 👉 dùng để trả về
            )
        ]

    def save_to_json(self, chunks, path):
        import json

        data = []

        for doc in chunks:
            data.append({
                "content": doc.page_content,
                "metadata": doc.metadata
            })

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)