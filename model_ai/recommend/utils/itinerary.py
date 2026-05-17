from typing import Dict, List, Any
from src.config import settings

def build_itinerary(
    locations: List[Dict],
    images_map: Dict[str, List[str]],
    cat_id_to_name: Dict[str, str],
    loc_cat_map: Dict[str, List[str]],
    days: int = settings.ITINERARY_DAYS,
    per_day: int = settings.PLACES_PER_DAY,
) -> Dict[str, Any]:
    """
    Chia locations thành lịch trình days ngày, mỗi ngày per_day địa điểm.
    Trả về JSON structure theo yêu cầu.
    """
    total_needed = days * per_day
    selected = locations[:total_needed]

    itinerary = {}
    for day_idx in range(days):
        day_key = f"day_{day_idx + 1}"
        start = day_idx * per_day
        end = start + per_day
        day_places = selected[start:end]

        places_output = []
        for loc in day_places:
            lid = loc["location_id"]
            # Lấy danh mục
            cat_ids = loc_cat_map.get(lid, [])
            categories = [
                cat_id_to_name[cid] for cid in cat_ids if cid in cat_id_to_name
            ]
            # Lấy ảnh
            images = images_map.get(lid, [])

            places_output.append({
                "location_id": lid,
                "name": loc.get("name", ""),
                "description": loc.get("description", ""),
                "address": loc.get("address", ""),
                "latitude": float(loc.get("latitude") or 0),
                "longitude": float(loc.get("longitude") or 0),
                "rating": float(loc.get("rating") or 0),
                "count_rating": int(loc.get("count_rating") or 0),
                "duration_minutes": loc.get("duration_minutes"),
                "opening_hours": loc.get("opening_hours_json"),
                "categories": categories,
                "matched_categories": loc.get("matched_categories", []),
                "images": images[:3],  # Tối đa 3 ảnh
                "distance_km": loc.get("distance_km"),
            })

        itinerary[day_key] = {
            "day": day_idx + 1,
            "places": places_output,
        }

    return itinerary
