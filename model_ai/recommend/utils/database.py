from typing import List, Dict, Any, Optional
from src.config import settings

class SupabaseManager:
    def __init__(self):
        self.client = settings.supabase_client

    def fetch_province_coords(self, province_name: str) -> Optional[Dict[str, float]]:
        """
        Lấy tọa độ trung tâm và ngoại ô của tỉnh từ bảng `provinces`.
        Returns: {"center_lat", "center_lng", "suburb_lat", "suburb_lng"} hoặc None.
        """
        if not self.client:
            return None
            
        resp = (
            self.client.table("provinces")
            .select("center_lat, center_lng, suburb_lat, suburb_lng")
            .eq("name", province_name)
            .limit(1)
            .execute()
        )
        if resp.data:
            return resp.data[0]
        return None

    def fetch_category_map(self) -> Dict[str, str]:
        """
        Lấy toàn bộ categories → trả về dict {category_id: category_name}.
        """
        if not self.client:
            return {}
            
        resp = self.client.table("categories").select("category_id, category_name").execute()
        return {row["category_id"]: row["category_name"] for row in (resp.data or [])}

    def fetch_locations_by_province(self, province_name: str) -> List[Dict[str, Any]]:
        """
        Lấy tất cả locations thuộc tỉnh (city = province_name).
        Trả về list dict với các trường cần thiết.
        """
        if not self.client:
            return []
            
        resp = (
            self.client.table("locations")
            .select(
                "location_id, name, description, address, city, "
                "latitude, longitude, duration_minutes, "
                "opening_hours_json, rating, count_rating"
            )
            .eq("city", province_name)
            .execute()
        )
        return resp.data or []

    def fetch_location_category_ids(self, location_ids: List[str]) -> Dict[str, List[str]]:
        """
        Lấy mapping {location_id: [category_id, ...]} từ bảng locationcategories.
        """
        if not self.client or not location_ids:
            return {}

        mapping: Dict[str, List[str]] = {}
        # Query theo batch (Supabase `in_` filter)
        batch_size = 100
        for i in range(0, len(location_ids), batch_size):
            batch = location_ids[i : i + batch_size]
            resp = (
                self.client.table("locationcategories")
                .select("location_id, category_id")
                .in_("location_id", batch)
                .execute()
            )
            for row in (resp.data or []):
                lid = row["location_id"]
                cid = row["category_id"]
                mapping.setdefault(lid, []).append(cid)
        return mapping

    def fetch_location_images(self, location_ids: List[str]) -> Dict[str, List[str]]:
        """
        Lấy ảnh cho các locations từ bảng locationimages.
        Returns: {location_id: [image_url, ...]}
        """
        if not self.client or not location_ids:
            return {}

        images_map: Dict[str, List[str]] = {}
        batch_size = 100
        for i in range(0, len(location_ids), batch_size):
            batch = location_ids[i : i + batch_size]
            resp = (
                self.client.table("locationimages")
                .select("location_id, image")
                .in_("location_id", batch)
                .execute()
            )
            for row in (resp.data or []):
                lid = row["location_id"]
                images_map.setdefault(lid, []).append(row["image"])
        return images_map

db_manager = SupabaseManager()
