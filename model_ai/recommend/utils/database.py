import json
import logging
from typing import List, Dict, Any, Optional
from ..src.config import settings

logger = logging.getLogger("Recommender")

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

    # =========================================================================
    # SAVE RECOMMENDATION RESULTS TO SUPABASE
    # =========================================================================

    def save_user_trip_request(
        self, user_id: str, province: str, input_params: Dict[str, Any]
    ) -> Optional[str]:
        """
        Lưu yêu cầu gợi ý lịch trình vào bảng `usertriprequest`.
        Returns: request_id hoặc None nếu lỗi.
        """
        if not self.client:
            return None

        row = {
            "user_id": user_id,
            "destination_text": province,
            "parameters_json": json.dumps(input_params, ensure_ascii=False),
        }
        resp = self.client.table("usertriprequest").insert(row).execute()
        if resp.data:
            return resp.data[0]["request_id"]
        return None

    def save_plan(self, user_id: str, generation_source: str = "ai_recommend") -> Optional[str]:
        """
        Tạo một plan mới trong bảng `plans`.
        Returns: plan_id hoặc None nếu lỗi.
        """
        if not self.client:
            return None

        row = {
            "user_id": user_id,
            "generation_source": generation_source,
        }
        resp = self.client.table("plans").insert(row).execute()
        if resp.data:
            return resp.data[0]["plan_id"]
        return None

    def save_plan_days(self, plan_id: str, num_days: int) -> List[Dict[str, Any]]:
        """
        Tạo các bản ghi planday cho plan.
        Returns: list of {plan_day_id, day_seq} đã tạo.
        """
        if not self.client:
            return []

        rows = [
            {"plan_id": plan_id, "day_seq": day_seq}
            for day_seq in range(1, num_days + 1)
        ]
        resp = self.client.table("planday").insert(rows).execute()
        return resp.data or []

    def save_plan_day_locations(
        self, plan_day_id: str, location_ids: List[str]
    ) -> bool:
        """
        Lưu danh sách locations cho một planday vào bảng `plandaylocation`.
        Returns: True nếu thành công.
        """
        if not self.client or not location_ids:
            return False

        rows = [
            {
                "plan_day_id": plan_day_id,
                "location_id": loc_id,
                "visit_order": idx + 1,
            }
            for idx, loc_id in enumerate(location_ids)
        ]
        resp = self.client.table("plandaylocation").insert(rows).execute()
        return bool(resp.data)

    def save_recommendation_result(
        self,
        user_id: str,
        itinerary: Dict[str, Any],
        input_params: Optional[Dict[str, Any]] = None,
        province: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Lưu kết quả lịch trình lên Supabase.
        Luồng: (tùy chọn usertriprequest) → plans → planday → plandaylocation.
        Returns: dict chứa request_id, plan_id, plan_days nếu thành công.
        """
        if not self.client:
            logger.warning("Supabase client chưa được khởi tạo, bỏ qua lưu kết quả.")
            return None

        try:
            request_id = None
            # 1. Lưu yêu cầu trip (nếu có input_params)
            if input_params and province:
                request_id = self.save_user_trip_request(user_id, province, input_params)
                logger.info(f"[Save] Đã lưu usertriprequest: {request_id}")

            # 2. Tạo plan
            plan_id = self.save_plan(user_id)
            logger.info(f"[Save] Đã tạo plan: {plan_id}")

            # 3. Tạo planday cho từng ngày
            num_days = len(itinerary)
            plan_days = self.save_plan_days(plan_id, num_days)
            logger.info(f"[Save] Đã tạo {len(plan_days)} planday records")

            # 4. Lưu locations cho từng planday
            # Sắp xếp plan_days theo day_seq để khớp với itinerary
            plan_days_sorted = sorted(plan_days, key=lambda x: x["day_seq"])

            for plan_day_record in plan_days_sorted:
                day_seq = plan_day_record["day_seq"]
                plan_day_id = plan_day_record["plan_day_id"]
                day_key = f"day_{day_seq}"

                day_data = itinerary.get(day_key, {})
                places = day_data.get("places", [])
                loc_ids = [p["location_id"] for p in places if p.get("location_id")]

                if loc_ids:
                    self.save_plan_day_locations(plan_day_id, loc_ids)
                    logger.info(
                        f"[Save] Day {day_seq}: đã lưu {len(loc_ids)} locations"
                    )

            return {
                "request_id": request_id,
                "plan_id": plan_id,
                "plan_days": [
                    {"plan_day_id": pd["plan_day_id"], "day_seq": pd["day_seq"]}
                    for pd in plan_days_sorted
                ],
            }

        except Exception as e:
            logger.error(f"[Save] Lỗi khi lưu kết quả recommend: {e}")
            return None

    def get_user_itinerary_history(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Lấy toàn bộ lịch sử các plan (lịch trình) của user.
        """
        if not self.client:
            return []

        # 1. Lấy danh sách plans của user
        plans_resp = self.client.table("plans").select("plan_id, created_at").eq("user_id", user_id).order("created_at", desc=True).execute()
        plans_data = plans_resp.data or []
        if not plans_data:
            return []

        plan_ids = [p["plan_id"] for p in plans_data]

        # 2. Lấy danh sách planday của các plans đó
        days_resp = self.client.table("planday").select("plan_day_id, plan_id, day_seq").in_("plan_id", plan_ids).execute()
        days_data = days_resp.data or []
        plan_day_ids = [d["plan_day_id"] for d in days_data]

        # 3. Lấy plandaylocation (các địa điểm trong mỗi ngày)
        if not plan_day_ids:
            return plans_data # Return plans with empty days

        loc_resp = self.client.table("plandaylocation").select("plan_day_id, location_id, visit_order").in_("plan_day_id", plan_day_ids).order("visit_order").execute()
        loc_data = loc_resp.data or []
        location_ids = list(set([l["location_id"] for l in loc_data]))

        # 4. Lấy thông tin chi tiết locations
        locations_detail = {}
        if location_ids:
            # Lấy thông tin cơ bản
            detail_resp = self.client.table("locations").select("location_id, name, address, latitude, longitude, rating").in_("location_id", location_ids).execute()
            
            # Lấy hình ảnh (chỉ lấy 1 ảnh đầu tiên cho nhẹ)
            images_resp = self.client.table("locationimages").select("location_id, image").in_("location_id", location_ids).execute()
            images_dict = {}
            for img in (images_resp.data or []):
                lid = img["location_id"]
                if lid not in images_dict:
                    images_dict[lid] = []
                images_dict[lid].append(img["image"])

            for item in (detail_resp.data or []):
                lid = item["location_id"]
                item["images"] = images_dict.get(lid, [])[:1] # Giới hạn 1 ảnh
                locations_detail[lid] = item

        # 5. Lắp ráp dữ liệu
        history = []
        for plan in plans_data:
            pid = plan["plan_id"]
            plan_days = [d for d in days_data if d["plan_id"] == pid]
            plan_days.sort(key=lambda x: x["day_seq"])

            itinerary = {}
            for pd in plan_days:
                pd_id = pd["plan_day_id"]
                day_seq = pd["day_seq"]
                day_key = f"day_{day_seq}"

                # Các location trong ngày này
                day_locs = [l for l in loc_data if l["plan_day_id"] == pd_id]
                day_locs.sort(key=lambda x: x["visit_order"])

                places = []
                for dl in day_locs:
                    lid = dl["location_id"]
                    if lid in locations_detail:
                        places.append(locations_detail[lid])

                itinerary[day_key] = {
                    "day": day_seq,
                    "places": places
                }

            history.append({
                "plan_id": pid,
                "created_at": plan.get("created_at"),
                "itinerary": itinerary
            })

        return history

    def get_plan_detail(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """
        Lấy chi tiết 1 lịch trình cụ thể dựa vào plan_id.
        """
        if not self.client:
            return None

        # 1. Kiểm tra plan có tồn tại
        plan_resp = self.client.table("plans").select("plan_id, user_id, created_at").eq("plan_id", plan_id).execute()
        if not plan_resp.data:
            return None
        plan_info = plan_resp.data[0]

        # 2. Lấy danh sách planday
        days_resp = self.client.table("planday").select("plan_day_id, day_seq").eq("plan_id", plan_id).execute()
        days_data = days_resp.data or []
        plan_day_ids = [d["plan_day_id"] for d in days_data]

        if not plan_day_ids:
            return {"plan_id": plan_id, "created_at": plan_info.get("created_at"), "itinerary": {}}

        # 3. Lấy plandaylocation
        loc_resp = self.client.table("plandaylocation").select("plan_day_id, location_id, visit_order").in_("plan_day_id", plan_day_ids).order("visit_order").execute()
        loc_data = loc_resp.data or []
        location_ids = list(set([l["location_id"] for l in loc_data]))

        # 4. Lấy thông tin locations
        locations_detail = {}
        if location_ids:
            detail_resp = self.client.table("locations").select("location_id, name, address, latitude, longitude, rating").in_("location_id", location_ids).execute()
            images_resp = self.client.table("locationimages").select("location_id, image").in_("location_id", location_ids).execute()
            
            images_dict = {}
            for img in (images_resp.data or []):
                lid = img["location_id"]
                if lid not in images_dict:
                    images_dict[lid] = []
                images_dict[lid].append(img["image"])

            for item in (detail_resp.data or []):
                lid = item["location_id"]
                item["images"] = images_dict.get(lid, [])[:1]
                locations_detail[lid] = item

        # 5. Lắp ráp dữ liệu
        days_data.sort(key=lambda x: x["day_seq"])
        itinerary = {}
        for pd in days_data:
            pd_id = pd["plan_day_id"]
            day_seq = pd["day_seq"]
            day_key = f"day_{day_seq}"

            day_locs = [l for l in loc_data if l["plan_day_id"] == pd_id]
            day_locs.sort(key=lambda x: x["visit_order"])

            places = []
            for dl in day_locs:
                lid = dl["location_id"]
                if lid in locations_detail:
                    places.append(locations_detail[lid])

            itinerary[day_key] = {
                "day": day_seq,
                "places": places
            }

        return {
            "plan_id": plan_id,
            "user_id": plan_info.get("user_id"),
            "created_at": plan_info.get("created_at"),
            "itinerary": itinerary
        }

    def delete_plan(self, plan_id: str) -> bool:
        """
        Xóa một plan. Nhờ ON DELETE CASCADE ở DB, nó sẽ tự động xóa planday và plandaylocation.
        """
        if not self.client:
            return False
            
        resp = self.client.table("plans").delete().eq("plan_id", plan_id).execute()
        return len(resp.data or []) > 0

db_manager = SupabaseManager()
