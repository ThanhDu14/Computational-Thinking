import os
import sys
import json
import csv
import logging
import hashlib
import shutil
import urllib.request
import urllib.parse
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("DatabaseTrainingPipeline")

# Setup absolute paths
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
env_path = os.path.join(project_root, ".env")

# Load environment variables
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Không tìm thấy SUPABASE_URL hoặc SUPABASE_KEY trong file .env!")
    sys.exit(1)

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Path settings
hash_locations_path = os.path.join(current_dir, "hash_locations.csv")
new_dataset_dir = os.path.join(current_dir, "new_dataset")
json_output_path = os.path.join(current_dir, "images_to_train.json")
weights_dir = os.path.join(current_dir, "weights")

# Ensure folders exist
os.makedirs(new_dataset_dir, exist_ok=True)
os.makedirs(weights_dir, exist_ok=True)


def translate_to_vietnamese(text):
    """
    Dịch tự động tên địa danh từ Tiếng Anh sang Tiếng Việt bằng API Google Translate miễn phí.
    """
    text_clean = text.strip()
    if not text_clean:
        return ""
        
    # Một số từ đặc trưng cần Việt hóa chuẩn xác
    special_mappings = {
        "Lake of the restored sword": "Hồ Hoàn Kiếm",
        "Thê Húc bridge": "Cầu Thê Húc",
        "Trấn Quốc Pagoda": "Chùa Trấn Quốc",
        "Hanoi operahouse": "Nhà hát Lớn Hà Nội",
        "Notre Dame Cathedral of Saigon": "Nhà thờ Đức Bà Sài Gòn",
        "Notre Dame Cathedral": "Nhà thờ Đức Bà",
        "Temple Of Literature": "Văn Miếu - Quốc Tử Giám",
        "Ho Chi Minh Mausoleum": "Lăng Chủ tịch Hồ Chí Minh",
        "Ben Thanh Market": "Chợ Bến Thành",
        "Independence Palace": "Dinh Độc Lập",
        "Bui Vien Street": "Phố đi bộ Bùi Viện",
        "Golden Bridge": "Cầu Vàng",
        "Lady Buddha": "Chùa Linh Ứng (Tượng Phật Bà Quan Âm)",
        "Dragon Bridge": "Cầu Rồng",
        "One Pillar Pagoda": "Chùa Một Cột",
        "Cu Chi Tunnels": "Địa đạo Củ Chi",
        "Crazy House": "Biệt thự Hằng Nga (Crazy House)",
        "Datanla Waterfall": "Thác Datanla",
        "Ba Na Hills": "Bà Nà Hills",
        "VinWonders": "VinWonders",
        "Hoan Kiem Lake": "Hồ Hoàn Kiếm"
    }

    # Kiểm tra ánh xạ đặc biệt trước
    for eng, vi in special_mappings.items():
        if eng.lower() in text_clean.lower():
            return vi

    # Dịch tự động qua Google Translate API
    try:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=" + urllib.parse.quote(text_clean)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            translated = data[0][0][0]
            # Chuẩn hóa một số từ dịch thô
            translated = translated.replace("pagoda", "Chùa").replace("Pagoda", "Chùa")
            translated = translated.replace("temple", "Đền").replace("Temple", "Đền")
            return translated.strip()
    except Exception as e:
        logger.debug(f"Không thể dịch tự động '{text_clean}': {e}")
        return text_clean


def restore_original_benchmark_weights():
    """
    Kiểm tra và tải bộ trọng số gốc từ HuggingFace (chỉ dành cho ViT-Small).
    Nếu dùng ViT-Base, bỏ qua bước này để huấn luyện CSDL 768 chiều hoàn toàn từ mới.
    """
    logger.info("Bước 1: Kiểm tra bộ trọng số gốc trong thư mục weights...")

    # Nạp hàm download
    models_path = os.path.join(current_dir, "models")
    if models_path not in sys.path:
        sys.path.insert(0, models_path)
    from landmark_recognizer import LandmarkRecognizer
    
    recognizer = LandmarkRecognizer()
    recognizer.load_model(weights_dir=weights_dir)
    
    if getattr(recognizer, "embed_dim", 384) == 768:
        logger.info("Đang sử dụng ViT-Base (768 chiều). Bỏ qua tải trọng số ViT-Small từ HuggingFace.")
        return
        
    # load_database sẽ tự động kiểm tra và chỉ tải từ HuggingFace nếu file chưa tồn tại
    recognizer.load_database(db_dir=weights_dir)
    logger.info("Đã kiểm tra xong bộ dữ liệu gốc (bỏ qua tải nếu đã có sẵn).")


def translate_hash_locations_to_vietnamese():
    """
    Đọc bảng hash_locations.csv tiếng Anh hiện tại, tự động dịch các địa danh sang Tiếng Việt
    và lưu lại để đồng bộ hóa nhãn hiển thị của mô hình.
    """
    logger.info("Bước 2: Đang tự động dịch bảng tra cứu hash_locations.csv sang Tiếng Việt...")
    
    # Tải thông tin Tiếng Việt từ bảng locations trên Supabase để so khớp chính xác nếu có
    loc_res = supabase.table("locations").select("location_id, name").execute()
    locations = loc_res.data or []
    db_vietnamese_names = [row["name"].strip() for row in locations if row.get("name")]

    temp_records = []
    
    if os.path.exists(hash_locations_path):
        with open(hash_locations_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            
        total_rows = len(rows)
        for idx, row in enumerate(rows):
            eng_name = row["location_name"].strip()
            num_id = row["id"].strip()
            
            # Kiểm tra xem tên có khớp trực tiếp hoặc gần đúng với tên trong DB không
            matched_vi_name = None
            for db_name in db_vietnamese_names:
                # Nếu khớp hoàn toàn hoặc là con của nhau
                if eng_name.lower() == db_name.lower():
                    matched_vi_name = db_name
                    break
            
            # Nếu không khớp trực tiếp, sử dụng Google Translate
            if not matched_vi_name:
                matched_vi_name = translate_to_vietnamese(eng_name)
                
            temp_records.append({
                "location_name": matched_vi_name,
                "id": num_id
            })
            
            if (idx + 1) % 50 == 0 or idx == 0:
                logger.info(f"Đã dịch: {idx + 1}/{total_rows} địa điểm...")
                
        # Ghi lại file CSV bằng Tiếng Việt
        with open(hash_locations_path, mode="w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["location_name", "id"])
            for r in temp_records:
                writer.writerow([r["location_name"], r["id"]])
                
        logger.info(f"Đã chuyển đổi thành công tệp hash_locations.csv sang Tiếng Việt!")
    else:
        logger.error(f"Không tìm thấy tệp hash_locations.csv gốc tại {hash_locations_path}")


def fetch_new_vietnamese_images():
    """
    Lấy danh sách các bức ảnh Tiếng Việt mới từ Supabase (bảng locations và user-uploaded)
    để chuẩn bị bổ sung (retrain/append) vào mô hình.
    """
    logger.info("Bước 3: Đang lấy dữ liệu hình ảnh Tiếng Việt mới từ Supabase để bổ sung...")
    
    # 1. Lấy thông tin locations tiếng Việt
    loc_res = supabase.table("locations").select("location_id, name").execute()
    locations = loc_res.data or []
    id_to_vietnamese_name = {row["location_id"]: row["name"] for row in locations}

    # Tải lại bảng hash_locations để lấy ID số
    name_to_num_id = {}
    if os.path.exists(hash_locations_path):
        with open(hash_locations_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                name_to_num_id[row["location_name"].strip()] = row["id"].strip()

    # 2. Lấy hình ảnh cơ sở từ locationimages
    base_img_res = supabase.table("locationimages").select("location_id, image").execute()
    base_images = base_img_res.data or []

    # 3. Lấy hình ảnh mới của người dùng chưa train (is_training_data = False)
    user_img_res = supabase.table("imageidentifiedlocation").select("*, imageupload(*)").eq("is_training_data", False).execute()
    user_records = user_img_res.data or []

    new_images_to_train = []
    user_trained_ids = []

    # Gộp ảnh cơ sở
    for idx, row in enumerate(base_images):
        loc_id = row.get("location_id")
        image_url = row.get("image")
        vietnamese_name = id_to_vietnamese_name.get(loc_id)

        if image_url and vietnamese_name:
            new_images_to_train.append({
                "source": "base_database",
                "location_id": loc_id,
                "detected_landmark_name": vietnamese_name,
                "image_url": image_url,
                "image_id": f"base_{loc_id[:8]}_{idx}"
            })

    # Gộp ảnh người dùng mới tải lên
    for row in user_records:
        ident_id = row.get("identification_id")
        image_id = row.get("image_id")
        loc_id = row.get("location_id")
        
        vietnamese_name = id_to_vietnamese_name.get(loc_id) or row.get("detected_landmark_name")
        
        # Trích xuất URL
        imageupload_data = row.get("imageupload")
        image_url = None
        if imageupload_data:
            image_url = imageupload_data.get("image_url")
            
        if not image_url and image_id:
            upload_res = supabase.table("imageupload").select("image_url").eq("image_id", image_id).execute()
            if upload_res.data:
                image_url = upload_res.data[0].get("image_url")

        if image_url and vietnamese_name:
            new_images_to_train.append({
                "source": "user_upload",
                "identification_id": ident_id,
                "location_id": loc_id,
                "detected_landmark_name": vietnamese_name,
                "image_url": image_url,
                "image_id": image_id
            })
            user_trained_ids.append(ident_id)

    # Lưu thông tin ảnh huấn luyện ra JSON
    with open(json_output_path, "w", encoding="utf-8") as f:
        json.dump(new_images_to_train, f, ensure_ascii=False, indent=4)
    logger.info(f"Đã xuất thông tin ảnh bổ sung ra JSON: {json_output_path}")

    return new_images_to_train, user_trained_ids, name_to_num_id


def download_and_organize_images(image_records, name_to_num_id):
    """Tải và tổ chức các ảnh bổ sung"""
    logger.info("Bước 4: Đang tải hình ảnh mới về máy...")
    
    if os.path.exists(new_dataset_dir):
        shutil.rmtree(new_dataset_dir)
    os.makedirs(new_dataset_dir, exist_ok=True)

    downloaded_paths = []
    
    for idx, item in enumerate(image_records):
        url = item["image_url"]
        landmark_name = item["detected_landmark_name"]
        image_id = item["image_id"]
        
        # Tìm numeric ID, nếu chưa có thì tự động sinh mới
        num_id = name_to_num_id.get(landmark_name.strip())
        if not num_id:
            h = int(hashlib.md5(landmark_name.strip().encode("utf-8")).hexdigest(), 16) % 1000000000
            num_id = str(h)
            name_to_num_id[landmark_name.strip()] = num_id
            # Lưu lại vào CSV
            with open(hash_locations_path, mode="a", encoding="utf-8", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([landmark_name.strip(), num_id])

        label_dir = os.path.join(new_dataset_dir, num_id)
        os.makedirs(label_dir, exist_ok=True)

        ext = ".jpg"
        if "." in url.split("/")[-1]:
            temp_ext = "." + url.split("/")[-1].split(".")[-1]
            if len(temp_ext) <= 5 and temp_ext.lower() in [".jpg", ".jpeg", ".png"]:
                ext = temp_ext

        local_img_path = os.path.abspath(os.path.join(label_dir, f"{image_id}{ext}"))

        if (idx + 1) % 100 == 0 or idx == 0:
            logger.info(f"Tiến độ tải ảnh bổ sung: {idx + 1}/{len(image_records)}")
            
        try:
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            with urllib.request.urlopen(req, timeout=10) as response, open(local_img_path, 'wb') as out_file:
                out_file.write(response.read())
            downloaded_paths.append(local_img_path)
        except Exception as e:
            pass

    logger.info(f"Tải thành công {len(downloaded_paths)}/{len(image_records)} ảnh bổ sung.")
    return downloaded_paths


def retrain_model_with_new_data():
    """Bổ sung đặc trưng của các ảnh mới vào cơ sở dữ liệu của LandmarkRecognizer"""
    logger.info("Bước 5: Đang nạp mô hình LandmarkRecognizer để tiến hành RETRAIN (Bổ sung đặc trưng)...")
    
    models_path = os.path.join(current_dir, "models")
    if models_path not in sys.path:
        sys.path.insert(0, models_path)

    try:
        from landmark_recognizer import LandmarkRecognizer
        recognizer = LandmarkRecognizer()
        
        # Load model DINOv2
        recognizer.load_model(weights_dir=weights_dir)
        
        # Tẩy tệp cache labels_fixed.npy cũ nếu có để nhận nhãn mới
        labels_fixed_path = os.path.join(weights_dir, 'labels_fixed.npy')
        if os.path.exists(labels_fixed_path):
            os.remove(labels_fixed_path)
            
        # Gọi phương thức retrain() để bổ sung các ảnh mới tải về vào DB trọng số gốc
        recognizer.retrain(new_dataset_dir=new_dataset_dir, db_dir=weights_dir)
        logger.info("✅ Bổ sung đặc trưng thành công vào CSDL!")
        return True
    except Exception as e:
        logger.error(f"Lỗi khi retrain bổ sung mô hình: {e}", exc_info=True)
        return False


def mark_images_as_trained(identification_ids):
    """Cập nhật trạng thái đã train lên Supabase"""
    if not identification_ids:
        return
    logger.info(f"Đang cập nhật trạng thái đã train cho {len(identification_ids)} bản ghi người dùng trên database...")
    success_count = 0
    for ident_id in identification_ids:
        try:
            res = supabase.table("imageidentifiedlocation").update({"is_training_data": True}).eq("identification_id", ident_id).execute()
            if res.data:
                success_count += 1
        except Exception as e:
            logger.error(f"Không thể cập nhật cho bản ghi {ident_id}: {e}")
    logger.info(f"Đã cập nhật thành công {success_count}/{len(identification_ids)} bản ghi.")


def run_pipeline():
    logger.info("=== BẮT ĐẦU PIPELINE HUẤN LUYỆN BỔ SUNG & VIỆT HÓA ĐỊA DANH ===")
    
    # 1. Khôi phục lại bộ CSDL gốc 7,085 ảnh từ HuggingFace
    restore_original_benchmark_weights()
    
    # 2. Dịch toàn bộ bảng ánh xạ sang Tiếng Việt
    translate_hash_locations_to_vietnamese()
    
    # 3. Lấy các ảnh mới từ Supabase (bao gồm 1000 ảnh gốc + ảnh user)
    new_images, user_trained_ids, name_to_num_id = fetch_new_vietnamese_images()
    if not new_images:
        logger.warning("Không tìm thấy hình ảnh mới nào để bổ sung. Pipeline hoàn tất sớm.")
        return
        
    # 4. Tải ảnh mới về máy
    downloaded_paths = download_and_organize_images(new_images, name_to_num_id)
    if not downloaded_paths:
        logger.error("Không tải được hình ảnh mới nào. Dừng pipeline.")
        return
        
    # 5. Huấn luyện bổ sung (retrain) vào CSDL 7,085 ảnh hiện tại
    retrain_success = retrain_model_with_new_data()
    
    # 6. Cập nhật trạng thái database
    if retrain_success:
        mark_images_as_trained(user_trained_ids)
        logger.info("=== PIPELINE TỰ ĐỘNG RETRAIN & VIỆT HÓA HOÀN TẤT THÀNH CÔNG ===")
    else:
        logger.error("=== PIPELINE THẤT BẠI TRONG QUÁ TRÌNH RETRAIN ===")


if __name__ == "__main__":
    run_pipeline()
