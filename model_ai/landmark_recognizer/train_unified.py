import os
import sys
import numpy as np
import logging
import torch
import time
from pathlib import Path

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("UnifiedTraining")

# Đường dẫn
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
models_dir = os.path.join(current_dir, "models")
weights_dir = os.path.join(current_dir, "weights")
temp_weights_dir = os.path.join(current_dir, "weights_temp")
new_dataset_dir = os.path.join(current_dir, "new_dataset")

if models_dir not in sys.path:
    sys.path.insert(0, models_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from landmark_recognizer import LandmarkRecognizer
from utils.file_utils import scan_image_folder

def main():
    logger.info("="*70)
    logger.info("  BẮT ĐẦU PIPELINE HUẤN LUYỆN HỢP NHẤT (UNIFIED TRAINING PIPELINE)")
    logger.info("="*70)

    # 1. Tải nhãn & đường dẫn gốc từ HuggingFace (nếu chưa có)
    labels_temp_path = os.path.join(temp_weights_dir, 'labels.npy')
    paths_temp_path = os.path.join(temp_weights_dir, 'image_paths.npy')
    
    if not os.path.exists(labels_temp_path) or not os.path.exists(paths_temp_path):
        logger.info("Đang khôi phục tệp chỉ mục mẫu của 7,085 ảnh gốc...")
        os.makedirs(temp_weights_dir, exist_ok=True)
        from utils.download_model import download_model
        download_model('labels.npy', temp_weights_dir)
        download_model('image_paths.npy', temp_weights_dir)

    # 2. Đọc và ánh xạ đường dẫn ổ đĩa ngoài cục bộ
    logger.info("Đang đọc chỉ mục và ánh xạ sang đường dẫn Linux cục bộ...")
    orig_labels = np.load(labels_temp_path, allow_pickle=True).tolist()
    orig_paths = np.load(paths_temp_path, allow_pickle=True).tolist()
    
    local_orig_paths = []
    local_orig_labels = []
    missing_count = 0
    
    for i, p in enumerate(orig_paths):
        p_norm = p.replace('\\', '/')
        if p_norm.startswith('F:/landmark vietnam/data/'):
            local_p = p_norm.replace('F:/landmark vietnam/data/', '/media/nquocdat06/HDD_DATA/landmark vietnam/data/')
        elif p_norm.startswith('C:/Users/Mr.Dat09/'):
            local_p = p_norm.replace('C:/Users/Mr.Dat09/', '/media/nquocdat06/01DC540A12FED910/Users/Mr.Dat09/')
        else:
            local_p = p_norm
            
        if os.path.exists(local_p):
            local_orig_paths.append(local_p)
            local_orig_labels.append(str(orig_labels[i]))
        else:
            missing_count += 1
            
    logger.info(f"Đã xác minh CSDL gốc: {len(local_orig_paths)}/{len(orig_paths)} ảnh tồn tại cục bộ.")
    if missing_count > 0:
        logger.warning(f"Có {missing_count} ảnh gốc không được tìm thấy trên các ổ đĩa mount.")

    # 3. Quét ảnh Tiếng Việt mới từ Supabase (new_dataset)
    local_new_paths = []
    local_new_labels = []
    if os.path.exists(new_dataset_dir):
        logger.info("Đang quét thư mục ảnh bổ sung Supabase (new_dataset)...")
        local_new_paths, local_new_labels = scan_image_folder(new_dataset_dir)
        logger.info(f"Đã tìm thấy {len(local_new_paths)} ảnh bổ sung Supabase thuộc {len(set(local_new_labels))} địa danh.")
    else:
        logger.warning("Thư mục new_dataset trống hoặc chưa được tải từ Supabase.")

    # 4. Gộp toàn bộ dữ liệu huấn luyện
    merged_paths = local_orig_paths + local_new_paths
    merged_labels = local_orig_labels + local_new_labels
    
    if len(merged_paths) == 0:
        logger.error("Không tìm thấy bất kỳ ảnh nào để huấn luyện! Hủy tiến trình.")
        return

    logger.info("="*60)
    logger.info(" THÔNG TIN BỘ DỮ LIỆU HỢP NHẤT:")
    logger.info(f" - Ảnh gốc ổ đĩa   : {len(local_orig_paths)} ảnh")
    logger.info(f" - Ảnh mới Supabase: {len(local_new_paths)} ảnh")
    logger.info(f" - Tổng số ảnh gốc : {len(merged_paths)} ảnh")
    logger.info(f" - Số địa điểm     : {len(set(merged_labels))} địa danh")
    logger.info("="*60)

    # 5. Khởi tạo mô hình LandmarkRecognizer
    logger.info("Đang khởi tạo mô hình LandmarkRecognizer...")
    recognizer = LandmarkRecognizer()
    recognizer.load_model(weights_dir=weights_dir)
    
    # In thông tin thiết bị phần cứng đang sử dụng
    logger.info(f"Thiết bị trích xuất đặc trưng hoạt động: {recognizer.device.type.upper()}")
    if recognizer.device.type == 'cuda':
        logger.info(f"Tên card đồ họa: {torch.cuda.get_device_name(0)}")

    # 6. Tiến hành trích xuất đặc trưng hàng loạt kết hợp 4x Data Augmentation
    logger.info("Bắt đầu huấn luyện và trích xuất đặc trưng hàng loạt...")
    start_time = time.time()
    
    os.makedirs(weights_dir, exist_ok=True)
    global_features_path = os.path.join(weights_dir, 'global_features.npy')
    labels_path = os.path.join(weights_dir, 'labels.npy')
    image_paths_path = os.path.join(weights_dir, 'image_paths.npy')
    local_features_path = os.path.join(weights_dir, 'local_features.h5')

    # Dọn dẹp cache cũ nếu có để tránh xung đột chiều
    for p in [global_features_path, labels_path, image_paths_path, local_features_path]:
        if os.path.exists(p):
            os.remove(p)

    from utils.feature_extractor import extract_features_batch
    
    # 4x data augmentation -> mỗi ảnh sinh ra 5 vector đặc trưng (1 gốc + 4 biến thể)
    extract_features_batch(
        image_paths=merged_paths,
        labels=merged_labels,
        model=recognizer.model,
        transform=recognizer.transform,
        device=recognizer.device,
        global_features_path=global_features_path,
        labels_path=labels_path,
        image_paths_path=image_paths_path,
        local_features_path=local_features_path,
        n_augments=4
    )

    elapsed = time.time() - start_time
    logger.info("="*70)
    logger.info(f"✅ HOÀN TẤT HUẤN LUYỆN HỢP NHẤT trong {elapsed/60:.2f} phút!")
    logger.info(f" - CSDL lưu trữ tại: {weights_dir}")
    logger.info(f" - Số lượng vector đặc trưng sinh ra: {len(merged_paths) * 5}")
    logger.info("="*70)

if __name__ == '__main__':
    main()
