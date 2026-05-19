from typing import Dict, List, Any
from ..src.config import settings
from .geo import haversine_km

def filter_by_categories(
    locations: List[Dict],
    loc_cat_map: Dict[str, List[str]],
    cat_id_to_name: Dict[str, str],
    desired_categories: List[str],
) -> List[Dict]:
    """
    Giữ lại locations có ít nhất 1 category nằm trong desired_categories.
    Thêm trường 'matched_categories' vào mỗi location.
    """
    # Build reverse: category_name → category_id
    name_to_ids: Dict[str, List[str]] = {}
    for cid, cname in cat_id_to_name.items():
        name_to_ids.setdefault(cname, []).append(cid)

    desired_cat_ids = set()
    for cat_name in desired_categories:
        for cid in name_to_ids.get(cat_name, []):
            desired_cat_ids.add(cid)

    # Nếu không tìm thấy category nào hợp lệ, trả về toàn bộ
    if not desired_cat_ids:
        for loc in locations:
            loc["matched_categories"] = []
        return locations

    filtered = []
    for loc in locations:
        lid = loc["location_id"]
        loc_cats = set(loc_cat_map.get(lid, []))
        matched = loc_cats & desired_cat_ids
        if matched:
            loc["matched_categories"] = [
                cat_id_to_name[cid] for cid in matched if cid in cat_id_to_name
            ]
            filtered.append(loc)
    return filtered

def sort_by_place_style(
    locations: List[Dict], place_style: str
) -> List[Dict]:
    """
    Sắp xếp locations theo place_style:
      - must_go:      Sắp xếp theo count_rating giảm dần (biểu tượng, nhiều người đánh giá)
      - high_quality:  Sắp xếp theo rating giảm dần, count_rating giảm dần
      - hidden_gem:    Lọc count_rating ≤ HIDDEN_GEM_MAX_REVIEWS, sắp xếp theo rating giảm dần
    """
    if place_style == "must_go":
        return sorted(
            locations,
            key=lambda x: (x.get("count_rating") or 0),
            reverse=True,
        )

    elif place_style == "high_quality":
        quality = [
            loc for loc in locations
            if (loc.get("count_rating") or 0) >= settings.HIGH_QUALITY_MIN_REVIEWS
        ]
        if len(quality) < settings.TOTAL_PLACES:
            quality = locations
        return sorted(
            quality,
            key=lambda x: ((x.get("rating") or 0), (x.get("count_rating") or 0)),
            reverse=True,
        )

    elif place_style == "hidden_gem":
        gems = [
            loc for loc in locations
            if (loc.get("count_rating") or 0) <= settings.HIDDEN_GEM_MAX_REVIEWS
        ]
        if len(gems) < settings.TOTAL_PLACES:
            gems = locations
        return sorted(
            gems,
            key=lambda x: (x.get("rating") or 0),
            reverse=True,
        )

    else:
        return sorted(
            locations,
            key=lambda x: (x.get("rating") or 0),
            reverse=True,
        )

def filter_by_radius(
    locations: List[Dict],
    center_lat: float,
    center_lng: float,
    radius_km: float,
) -> List[Dict]:
    """
    Giữ lại locations nằm trong bán kính radius_km từ (center_lat, center_lng).
    Thêm trường 'distance_km' vào mỗi location.
    """
    filtered = []
    for loc in locations:
        lat = loc.get("latitude")
        lng = loc.get("longitude")
        if lat is None or lng is None:
            continue
        try:
            lat = float(lat)
            lng = float(lng)
        except (ValueError, TypeError):
            continue

        dist = haversine_km(center_lat, center_lng, lat, lng)
        if dist <= radius_km:
            loc["distance_km"] = round(dist, 2)
            filtered.append(loc)

    filtered.sort(key=lambda x: x.get("distance_km", 999))
    return filtered