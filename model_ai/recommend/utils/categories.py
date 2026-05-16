from typing import List
from src.config import settings

def expand_categories_with_semantics(categories: List[str]) -> List[str]:
    """Mở rộng danh sách category dựa trên ma trận ngữ nghĩa."""
    expanded = set(categories)
    for cat in categories:
        if cat in settings.CATEGORY_SIMILARITY_MATRIX:
            for related_cat in settings.CATEGORY_SIMILARITY_MATRIX[cat]:
                expanded.add(related_cat)
    return list(expanded)
