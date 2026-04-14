"""
Cần thay đổi:
  - INPUT_FILE_NAME : tên file JSON đầu vào
  - LOCATION        : tên tỉnh/thành phố (tiếng Anh không dấu)
"""

import json
import re
import time
import os
import sys
import requests

sys.stdout.reconfigure(encoding="utf-8")

INPUT_FILE_NAME = "data_ha_noi_final.json"   # Tên file đầu vào
LOCATION        = "Ha Noi"                   # Tỉnh / thành phố

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE   = os.path.join(SCRIPT_DIR, INPUT_FILE_NAME)

# Output file: data_ha_noi_final.json → data_ha_noi_geocoded.json
_base        = os.path.splitext(INPUT_FILE_NAME)[0]          # data_ha_noi_final
_base        = re.sub(r'_final$', '', _base)                 # data_ha_noi
OUTPUT_FILE  = os.path.join(SCRIPT_DIR, f"{_base}_geocoded.json")

# Location slug dùng trong User-Agent (Ha Noi → HaNoi)
_loc_slug    = LOCATION.replace(" ", "")
HEADERS = {
    "User-Agent": f"{_loc_slug}TravelProject/5.0 ({_loc_slug.lower()}.uni.project@gmail.com)",
    "Accept": "application/json",
}

# API URLs
PHOTON_URL    = "https://photon.komoot.io/api/"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

DELAY            = 1.5   # Delay giữa requests (giây)
RATE_LIMIT_WAIT  = 60    # Đợi khi bị rate limit (giây)
REQUEST_TIMEOUT  = 15
SAVE_INTERVAL    = 10


# LÀM SẠCH ĐỊA CHỈ 

def clean_address(address: str) -> str:
    """Làm sạch địa chỉ bẩn từ TripAdvisor scraping."""
    if not address or address.strip() == "N/A":
        return ""

    addr = address.strip()

    # Loại bỏ Plus Code
    addr = re.sub(r'^[A-Z0-9]{3,}\+[A-Z0-9]+\s*,?\s*', '', addr)

    # Cắt tại garbage text
    stop_markers = [
        ". Get directions", ". Nearby stations", ". Entrance fee",
        ". Phone:", ". It only takes", ". The Patron",
        "Travelers who", "REPAIR OF", "for The King",
        "and directions to", ". In 202",
    ]
    for marker in stop_markers:
        idx = addr.lower().find(marker.lower())
        if idx != -1:
            addr = addr[:idx]

    # Xóa mã bưu điện (5-6 chữ số)
    addr = re.sub(r'\b\d{5,6}\b', '', addr)

    # Normalize
    addr = re.sub(r'\s+', ' ', addr).strip()
    addr = re.sub(r',\s*,+', ',', addr)
    addr = re.sub(r'^,\s*|,\s*$', '', addr)

    return addr


def extract_city(raw_address: str) -> str:
    """
    Trích xuất quận/huyện từ địa chỉ nếu tìm thấy.
    Mặc định trả về LOCATION nếu không khớp.
    """
    # Tự động tìm chuỗi trước dấu phẩy cuối có thể là quận/huyện
    parts = [p.strip() for p in (raw_address or "").split(",")]
    for part in parts:
        # Nếu part ngắn (< 40 ký tự) và không phải số → có thể là quận/huyện
        if part and len(part) < 40 and not re.match(r'^\d+', part):
            if any(kw in part.lower() for kw in ["district", "quan", "huyen", "ward", "phuong"]):
                return part.strip()

    return LOCATION  # Fallback về tỉnh/thành phố chính


def build_queries(location_name: str, raw_address: str) -> list:
    """
    Tạo danh sách queries theo thứ tự ưu tiên.
    Dùng LOCATION thay vì hardcode tên tỉnh.
    """
    name  = " ".join(location_name.strip().split()) if location_name else ""
    addr  = clean_address(raw_address)
    city  = extract_city(raw_address)
    queries = []

    # Q1: Tên + Quận/Huyện + Tỉnh + Nước
    if name and city:
        queries.append(f"{name}, {city}, {LOCATION}, Vietnam")

    # Q2: Tên + Address ngắn gọn
    if name and addr:
        short_addr = addr[:50].rsplit(',', 1)[0] if len(addr) > 50 else addr
        queries.append(f"{name}, {short_addr}")

    # Q3: Tên + Tỉnh + Vietnam
    if name:
        queries.append(f"{name}, {LOCATION}, Vietnam")

    # Q4: Chỉ tên + Vietnam
    if name:
        queries.append(f"{name}, Vietnam")

    # Q5: Chỉ address
    if addr and len(addr) > 5:
        queries.append(f"{addr}, Vietnam")

    # Q6: Tên rút gọn (nếu tên quá dài)
    if name and len(name) > 30:
        short_name = name.split('-')[0].split('(')[0].strip()
        if short_name != name:
            queries.append(f"{short_name}, {LOCATION}, Vietnam")

    return queries


# PHOTON API 

def photon_geocode(query: str, session: requests.Session) -> dict:
    """Gọi Photon API (komoot.io) - GeoJSON format."""
    params = {"q": query, "limit": 1, "lang": "en"}

    try:
        resp = session.get(PHOTON_URL, params=params, timeout=REQUEST_TIMEOUT)

        if resp.status_code == 429:
            return {"lat": None, "lon": None, "status": "rate_limited"}
        if resp.status_code != 200:
            return {"lat": None, "lon": None, "status": f"http_{resp.status_code}"}

        features = resp.json().get("features", [])
        if features:
            coords = features[0]["geometry"]["coordinates"]  # [lon, lat]
            return {"lat": str(coords[1]), "lon": str(coords[0]), "status": "success"}
        return {"lat": None, "lon": None, "status": "not_found"}

    except requests.exceptions.Timeout:
        return {"lat": None, "lon": None, "status": "timeout"}
    except requests.exceptions.ConnectionError:
        return {"lat": None, "lon": None, "status": "connection_error"}
    except Exception as e:
        return {"lat": None, "lon": None, "status": f"error: {e}"}


# ========================== NOMINATIM API ==========================

def nominatim_geocode(query: str, session: requests.Session) -> dict:
    """Gọi Nominatim API làm backup."""
    params = {"q": query, "format": "json", "limit": 1, "countrycodes": "vn"}

    try:
        resp = session.get(NOMINATIM_URL, params=params, timeout=REQUEST_TIMEOUT)

        if resp.status_code == 429:
            return {"lat": None, "lon": None, "status": "rate_limited"}
        if resp.status_code == 403:
            return {"lat": None, "lon": None, "status": "forbidden"}
        if resp.status_code != 200:
            return {"lat": None, "lon": None, "status": f"http_{resp.status_code}"}

        results = resp.json()
        if results:
            return {"lat": results[0]["lat"], "lon": results[0]["lon"], "status": "success"}
        return {"lat": None, "lon": None, "status": "not_found"}

    except Exception as e:
        return {"lat": None, "lon": None, "status": f"error: {e}"}


# ========================== GEOCODING ENGINE ==========================

def geocode_location(location_name: str, raw_address: str,
                     session: requests.Session) -> dict:
    """Multi-strategy geocoding: Photon (primary) → Nominatim (backup)."""
    queries = build_queries(location_name, raw_address)

    if not queries:
        return {"lat": "Not Found", "lon": "Not Found", "strategy": "no_query"}

    # === THỬ PHOTON ===
    for i, query in enumerate(queries):
        time.sleep(DELAY)
        result = photon_geocode(query, session)

        if result["status"] == "rate_limited":
            print(f"\n    🛑 Photon rate limited! Đợi {RATE_LIMIT_WAIT}s...", end="", flush=True)
            time.sleep(RATE_LIMIT_WAIT)
            result = photon_geocode(query, session)

        if result["status"] == "success":
            return {"lat": result["lat"], "lon": result["lon"], "strategy": f"Photon Q{i+1}"}

    # === THỬ NOMINATIM (backup, chỉ 2 queries đầu) ===
    for i, query in enumerate(queries[:2]):
        time.sleep(DELAY * 2)
        result = nominatim_geocode(query, session)

        if result["status"] in ("rate_limited", "forbidden"):
            break

        if result["status"] == "success":
            return {"lat": result["lat"], "lon": result["lon"], "strategy": f"Nominatim Q{i+1}"}

    return {"lat": "Not Found", "lon": "Not Found", "strategy": "all_failed"}


# LƯU DỮ LIỆU 

def save_data(data: list, filepath: str):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


# HÀM CHÍNH 

def main():
    print("=" * 70)
    print(f"  GEOCODING ĐỊA ĐIỂM {LOCATION.upper()} v5.0")
    print(f"  Input : {INPUT_FILE_NAME}")
    print(f"  Output: {os.path.basename(OUTPUT_FILE)}")
    print("  Photon API (primary) + Nominatim (backup)")
    print("=" * 70)

    print(f"\n📂 Đọc: {INPUT_FILE}")
    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"❌ {e}")
        return

    total = len(data)
    print(f"✅ {total} địa điểm.\n")

    session = requests.Session()
    session.headers.update(HEADERS)

    print(f"🔄 Geocoding (delay={DELAY}s)...\n")
    success = fail = skipped = 0

    for i, item in enumerate(data, start=1):
        name = item.get("location_name", item.get("Ten_Dia_Diem", ""))
        addr = item.get("address", item.get("Dia_Chi", ""))

        # Resume: bỏ qua nếu đã có tọa độ
        lat = item.get("Latitude", "Not Found")
        lon = item.get("Longitude", "Not Found")
        if lat != "Not Found" and lon != "Not Found" and lat and lon:
            skipped += 1
            success += 1
            print(f"  ⏭ {i}/{total}: {name[:40]} (đã có)")
            continue

        print(f"  🔍 {i}/{total}: {name[:42] or '(N/A)'}", end="", flush=True)

        result = geocode_location(name, addr, session)
        item["Latitude"]  = result["lat"]
        item["Longitude"] = result["lon"]

        if result["lat"] != "Not Found":
            success += 1
            print(f" -> ✅ ({result['lat']}, {result['lon']}) [{result['strategy']}]")
        else:
            fail += 1
            print(f" -> ❌ [{result['strategy']}]")

        if i % SAVE_INTERVAL == 0:
            save_data(data, OUTPUT_FILE)
            print(f"  💾 Saved ({success}/{i})\n")

    print(f"\n{'=' * 70}")
    save_data(data, OUTPUT_FILE)
    print(f"💾 Đã lưu: {OUTPUT_FILE}")

    new_found = success - skipped
    print(f"\n KẾT QUẢ:")
    print(f"  Tổng        : {total}")
    print(f"  Thành công  : {success} ({success/total*100:.1f}%)")
    if skipped:
        print(f"  ↳ Có sẵn   : {skipped}")
        print(f"  ↳ Mới tìm  : {new_found}")
    print(f"  Thất bại    : {fail} ({fail/total*100:.1f}%)")

    if fail > 0:
        print(f"\n⚠ CHƯA TÌM ĐƯỢC:")
        for item in data:
            if item.get("Latitude") == "Not Found":
                print(f"  - {item.get('location_name', '?')}")

    print(f"\n{'=' * 70}")
    print(" Hoàn tất!")


if __name__ == "__main__":
    main()