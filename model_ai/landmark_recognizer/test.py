"""
Test script cho hệ thống Landmark Recognizer
Chạy: python test.py
"""
import os
import sys
import time
import logging
import numpy as np

# Thiết lập đường dẫn
current_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(current_dir, "models")
weights_dir = os.path.join(current_dir, "weights")

if models_dir not in sys.path:
    sys.path.insert(0, models_dir)

from landmark_recognizer import LandmarkRecognizer

# ─── Cấu hình logging cho test ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("TestRunner")


def separator(title=""):
    logger.info("=" * 60)
    if title:
        logger.info("  %s", title)
        logger.info("=" * 60)


def test_init():
    """Test 1: Khởi tạo LandmarkRecognizer"""
    separator("TEST 1: Khởi tạo LandmarkRecognizer")
    try:
        recognizer = LandmarkRecognizer()
        logger.info("Device: %s", recognizer.device)
        logger.info("Transform pipeline: %s", recognizer.transform)
        logger.info("✅ Khởi tạo thành công!")
        return recognizer
    except Exception as e:
        logger.error("❌ Lỗi khởi tạo: %s", e, exc_info=True)
        return None


def test_load_model(recognizer):
    """Test 2: Load model DINOv2 từ PyTorch Hub"""
    separator("TEST 2: Load model DINOv2")
    try:
        start = time.time()
        recognizer.load_model(weights_dir=weights_dir)
        elapsed = time.time() - start
        
        # Kiểm tra model đã load thành công
        assert hasattr(recognizer, 'model'), "Model chưa được gán vào self.model"
        assert not recognizer.model.training, "Model phải ở eval mode"
        
        # Đếm parameters
        total_params = sum(p.numel() for p in recognizer.model.parameters())
        logger.info("Tổng tham số model: %s (%.1fM)", f"{total_params:,}", total_params / 1e6)
        logger.info("Thời gian load model: %.2fs", elapsed)
        logger.info("✅ Load model thành công!")
        return True
    except Exception as e:
        logger.error("❌ Lỗi load model: %s", e, exc_info=True)
        return False


def test_load_database(recognizer):
    """Test 3: Load database FAISS + metadata"""
    separator("TEST 3: Load Database & FAISS Index")
    
    # Kiểm tra file weights tồn tại
    required_files = ['global_features.npy', 'image_paths.npy', 'labels.npy', 'local_features.h5']
    for f in required_files:
        path = os.path.join(weights_dir, f)
        exists = os.path.exists(path)
        size_mb = os.path.getsize(path) / (1024 * 1024) if exists else 0
        status = f"✅ {size_mb:.2f} MB" if exists else "❌ MISSING"
        logger.info("  %s: %s", f, status)
    
    try:
        start = time.time()
        recognizer.load_database(db_dir=weights_dir)
        elapsed = time.time() - start
        
        # Kiểm tra metadata
        if hasattr(recognizer, 'index'):
            logger.info("FAISS index vectors: %d", recognizer.index.ntotal)
            logger.info("Labels: %d mục, %d unique", len(recognizer.labels), len(set(recognizer.labels)))
            logger.info("Image paths: %d mục", len(recognizer.image_paths))
            logger.info("Thời gian load DB: %.2fs", elapsed)
            
            # Hiển thị sample labels
            unique_labels = sorted(set(recognizer.labels))
            logger.info("Một số labels mẫu: %s", unique_labels[:10])
            logger.info("✅ Load database thành công!")
            return True
        else:
            logger.warning("⚠️ FAISS index chưa được khởi tạo (có thể thiếu file)")
            return False
    except Exception as e:
        logger.error("❌ Lỗi load database: %s", e, exc_info=True)
        return False


def test_predict(recognizer, image_path=None):
    """Test 4: Predict một ảnh"""
    separator("TEST 4: Predict")
    
    if not hasattr(recognizer, 'index'):
        logger.error("❌ FAISS chưa sẵn sàng. Bỏ qua test predict.")
        return False
    
    # Nếu không cung cấp ảnh test, tìm ảnh từ database
    if image_path is None:
        # Lấy một ảnh random từ database để test
        valid_paths = [p for p in recognizer.image_paths if os.path.exists(str(p))]
        if valid_paths:
            image_path = str(np.random.choice(valid_paths))
            logger.info("Dùng ảnh random từ DB để test: %s", image_path)
        else:
            logger.error("❌ Không tìm thấy ảnh nào hợp lệ trong database để test.")
            logger.info("Hãy chạy lại với: python test.py --image <đường_dẫn_ảnh>")
            return False
    
    if not os.path.exists(image_path):
        logger.error("❌ File ảnh không tồn tại: %s", image_path)
        return False
    
    try:
        logger.info("Đang predict ảnh: %s", image_path)
        result = recognizer.predict(image_path)
        
        if result[0] is None:
            logger.warning("Kết quả: Không nhận dạng được (inliers=%d)", result[1])
        else:
            matched_img, inliers, elapsed = result
            logger.info("┌─────────────────────────────────────────")
            logger.info("│ KẾT QUẢ PREDICT")
            logger.info("│ Ảnh match  : %s", matched_img)
            logger.info("│ Inliers    : %d", inliers)
            logger.info("│ Thời gian  : %.2fs", elapsed)
            logger.info("└─────────────────────────────────────────")
        
        logger.info("✅ Predict hoàn tất!")
        return True
    except Exception as e:
        logger.error("❌ Lỗi predict: %s", e, exc_info=True)
        return False


def test_memory_usage():
    """Test 5: Kiểm tra bộ nhớ"""
    separator("TEST 5: Thông tin hệ thống")
    try:
        import torch
        logger.info("PyTorch version: %s", torch.__version__)
        logger.info("CUDA available: %s", torch.cuda.is_available())
        if torch.cuda.is_available():
            logger.info("CUDA device: %s", torch.cuda.get_device_name(0))
            allocated = torch.cuda.memory_allocated(0) / (1024**2)
            reserved = torch.cuda.memory_reserved(0) / (1024**2)
            logger.info("GPU Memory Allocated: %.1f MB", allocated)
            logger.info("GPU Memory Reserved: %.1f MB", reserved)
    except Exception as e:
        logger.warning("Không thể lấy thông tin GPU: %s", e)
    
    try:
        import psutil
        process = psutil.Process(os.getpid())
        mem_mb = process.memory_info().rss / (1024 * 1024)
        logger.info("RAM sử dụng bởi process: %.1f MB", mem_mb)
        logger.info("CPU percent: %.1f%%", psutil.cpu_percent(interval=1))
    except ImportError:
        logger.info("(Cài 'pip install psutil' để xem thông tin RAM/CPU)")


def run_full_pipeline(image_path=None):
    """Chạy toàn bộ pipeline test"""
    total_start = time.time()
    results = {}
    
    separator("BẮT ĐẦU TEST TOÀN BỘ HỆ THỐNG LANDMARK RECOGNIZER")
    
    # Test 1: Init
    recognizer = test_init()
    results["init"] = recognizer is not None
    if not recognizer:
        logger.error("Dừng test do không thể khởi tạo.")
        return results
    
    # Test 2: Load model
    results["load_model"] = test_load_model(recognizer)
    if not results["load_model"]:
        logger.error("Dừng test do không thể load model.")
        return results
    
    # Test 3: Load database
    results["load_database"] = test_load_database(recognizer)
    
    # Test 4: Predict
    if results["load_database"]:
        results["predict"] = test_predict(recognizer, image_path)
    else:
        results["predict"] = False
        logger.warning("Bỏ qua test predict do database chưa sẵn sàng.")
    
    # Test 5: Memory
    test_memory_usage()
    
    # Tổng kết
    total_elapsed = time.time() - total_start
    separator("TỔNG KẾT")
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        logger.info("  %-20s %s", test_name, status)
    
    passed_count = sum(1 for v in results.values() if v)
    total_count = len(results)
    logger.info("Kết quả: %d/%d passed | Tổng thời gian: %.2fs", passed_count, total_count, total_elapsed)
    
    return results


if __name__ == "__main__":
    # Hỗ trợ chạy với ảnh cụ thể: python test.py --image path/to/image.jpg
    image_path = None
    if "--image" in sys.argv:
        idx = sys.argv.index("--image")
        if idx + 1 < len(sys.argv):
            image_path = sys.argv[idx + 1]
    
    run_full_pipeline(image_path=image_path)
