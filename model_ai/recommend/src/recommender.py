from typing import Dict, Any, Optional
from .config import settings
from ..utils.database import db_manager
from ..utils.categories import expand_categories_with_semantics
from ..utils.filter import filter_by_categories, sort_by_place_style, filter_by_radius
from ..utils.itinerary import build_itinerary

def recommend(input_json: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Hàm chính: nhận input JSON và trả về lịch trình 3 ngày.
    Nếu có user_id, kết quả sẽ được lưu lên Supabase.
    """
    # ── Parse input ──────────────────────────────────────────────────
    destination = input_json.get("destination", {})
    preferences = input_json.get("preferences", {})
    logistics = input_json.get("logistics", {})

    province = destination.get("province", "")
    categories = preferences.get("categories", [])
    place_style = preferences.get("place_style", "must_go")
    starting_point_name = logistics.get("starting_point", {}).get("name", "Trung tâm")
    transportation = logistics.get("transportation", "motorbike")

    if not province:
        return {"status": "error", "message": "Thiếu thông tin province."}

    # ── Xác định bán kính ────────────────────────────────────────────
    radius_km = settings.TRANSPORTATION_RADIUS.get(transportation, 30.0)

    # ── Step 1 & 2: Lấy locations của tỉnh & Tính tọa độ ─────────────
    all_locations = db_manager.fetch_locations_by_province(province)
    print(f"[Recommender] Tổng locations thuộc '{province}': {len(all_locations)}")

    if not all_locations:
        return {
            "status": "error",
            "message": f"Không có địa điểm nào thuộc tỉnh '{province}'.",
        }

    province_coords = db_manager.fetch_province_coords(province)

    # Xác định điểm xuất phát (trung tâm hay ngoại ô)
    if province_coords:
        if starting_point_name == "Ngoại ô":
            start_lat = float(province_coords.get("suburb_lat") or 0)
            start_lng = float(province_coords.get("suburb_lng") or 0)
        else:
            start_lat = float(province_coords.get("center_lat") or 0)
            start_lng = float(province_coords.get("center_lng") or 0)
    else:
        # Nếu không có province_coords, tự tính trung bình từ danh sách locations
        valid_lats = [float(loc["latitude"]) for loc in all_locations if loc.get("latitude") is not None]
        valid_lngs = [float(loc["longitude"]) for loc in all_locations if loc.get("longitude") is not None]
        if valid_lats and valid_lngs:
            start_lat = sum(valid_lats) / len(valid_lats)
            start_lng = sum(valid_lngs) / len(valid_lngs)
        else:
            start_lat, start_lng = 0.0, 0.0

    print(f"[Recommender] Tỉnh: {province} | Điểm xuất phát: {starting_point_name} "
          f"({start_lat}, {start_lng}) | Bán kính: {radius_km} km")

    # ── Step 3: Lấy category map & location-category mapping ────────
    cat_id_to_name = db_manager.fetch_category_map()
    location_ids = [loc["location_id"] for loc in all_locations]
    loc_cat_map = db_manager.fetch_location_category_ids(location_ids)

    # ── Step 4: Lọc theo categories ─────────────────────────────────
    if categories:
        filtered = filter_by_categories(
            all_locations, loc_cat_map, cat_id_to_name, categories
        )
        print(f"[Recommender] Sau lọc categories {categories}: {len(filtered)}")

        # Nếu không đủ 9 địa điểm (TOTAL_PLACES), mở rộng bằng categories liên quan
        if len(filtered) < settings.TOTAL_PLACES:
            expanded_cats = expand_categories_with_semantics(categories)
            print(f"[Recommender] ⚠ Không đủ địa điểm. Mở rộng bằng ma trận ngữ nghĩa: {expanded_cats}")
            expanded_filtered = filter_by_categories(
                all_locations, loc_cat_map, cat_id_to_name, expanded_cats
            )
            # Merge và ưu tiên những cái đã có trong `filtered` (exact match)
            existing_ids = {loc["location_id"] for loc in filtered}
            for loc in expanded_filtered:
                if loc["location_id"] not in existing_ids:
                    filtered.append(loc)
                    existing_ids.add(loc["location_id"])
            print(f"[Recommender] Sau khi mở rộng, tổng locations: {len(filtered)}")
    else:
        filtered = all_locations
        for loc in filtered:
            loc["matched_categories"] = []

    # ── Step 5: Lọc theo place_style ─────────────────────────────────
    styled = sort_by_place_style(filtered, place_style)
    print(f"[Recommender] Sau sort place_style '{place_style}': {len(styled)}")

    # ── Step 6: Lọc theo bán kính ────────────────────────────────────
    geo_filtered = filter_by_radius(styled, start_lat, start_lng, radius_km)
    print(f"[Recommender] Sau lọc bán kính {radius_km} km: {len(geo_filtered)}")

    # Fallback: nếu quá ít kết quả, mở rộng bán kính
    if len(geo_filtered) < settings.TOTAL_PLACES:
        expanded_radius = radius_km * 2
        geo_filtered = filter_by_radius(styled, start_lat, start_lng, expanded_radius)
        print(f"[Recommender] ⚠ Mở rộng bán kính → {expanded_radius} km: {len(geo_filtered)}")

    # Nếu vẫn thiếu, lấy từ styled (không lọc geo)
    if len(geo_filtered) < settings.TOTAL_PLACES:
        print(f"[Recommender] ⚠ Không đủ {settings.TOTAL_PLACES} địa điểm, bổ sung thêm...")
        existing_ids = {loc["location_id"] for loc in geo_filtered}
        for loc in styled:
            if loc["location_id"] not in existing_ids:
                geo_filtered.append(loc)
                existing_ids.add(loc["location_id"])
            if len(geo_filtered) >= settings.TOTAL_PLACES:
                break

    # ── Step 7: Lấy ảnh cho các địa điểm đã chọn ────────────────────
    final_ids = [loc["location_id"] for loc in geo_filtered[:settings.TOTAL_PLACES]]
    images_map = db_manager.fetch_location_images(final_ids)

    # ── Step 8: Build itinerary ──────────────────────────────────────
    itinerary = build_itinerary(
        geo_filtered, images_map, cat_id_to_name, loc_cat_map
    )

    # ── Step 9: Lưu kết quả lên Supabase ────────────────────────────
    saved_data = None
    if user_id:
        saved_data = db_manager.save_recommendation_result(
            user_id=user_id,
            input_params=input_json,
            province=province,
            itinerary=itinerary,
        )

    result = {
        "status": "success",
        "province": province,
        "place_style": place_style,
        "categories_requested": categories,
        "transportation": transportation,
        "starting_point": starting_point_name,
        "radius_km": radius_km,
        "total_candidates": len(all_locations),
        "after_category_filter": len(filtered),
        "after_geo_filter": len(geo_filtered),
        "itinerary": itinerary,
    }

    if saved_data:
        result["saved"] = saved_data

    return result
