import os
import torch
import torchvision.transforms as T
from PIL import Image
import numpy as np
import h5py
from tqdm import tqdm
from pathlib import Path
import sys
import time
import cv2
import faiss

# Thiết lập đường dẫn thư mục cho sys.path TRƯỚC KHI gọi thư viện từ folder khác
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, '..'))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from utils.feature_extractor import extract_features
from utils.download_model import download_model
from utils.feature_extractor import extract_features_batch
from utils.feature_extractor import append_features_batch
from utils.file_utils import scan_image_folder
from utils.matcher import match_local_ransac


# Đường dẫn đã được sửa trỏ thẳng ra ngoài thư mục weights chính xác của Project
weights_dir = os.path.join(parent_dir, "weights")
model_file = 'dinov2_vits14_reg.pth'
db_files = ['global_features.npy', 'image_paths.npy', 'labels.npy', 'local_features.h5']

class LandmarkRecognizer:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.transform = T.Compose([
            T.Resize((336, 336)),
            T.ToTensor(),
            T.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
        ])
    
    def load_model(self, weights_dir=weights_dir):
        print("="*50)
        print("Đang khởi tạo mạng thuật toán dinov2_vits14_reg từ PyTorch Hub ....")
        print("="*50)
        # PyTorch Hub sẽ tự động tải trọng số DINO từ facebookresearch (nếu chưa có)
        self.model = torch.hub.load('facebookresearch/dinov2', 'dinov2_vits14_reg')
        self.model.eval()
        self.model.to(self.device)
        print("Khởi tạo model dinov2_vits14_reg thành công!")
        
    def load_database(self, db_dir=weights_dir):
        os.makedirs(db_dir, exist_ok=True)
        for f in db_files:
            print("="*50)
            print(f"Kiểm tra/Tải file CSDL {f} ....")
            print("="*50)
            if not os.path.exists(os.path.join(db_dir, f)):
                download_model(file_name=f, local_dir=db_dir)
                if os.path.exists(os.path.join(db_dir, f)):
                    print(f"Tải file {f} thành công!")
                else:
                    print(f"❌ Lỗi: Không thể tải bản Database online {f} từ HuggingFace.")
            else:
                print(f"File {f} đã tồn tại.")
                
        global_features_path = os.path.join(db_dir, 'global_features.npy')
        labels_path = os.path.join(db_dir, 'labels.npy')
        image_paths_path = os.path.join(db_dir, 'image_paths.npy')
        self.h5_path = os.path.join(db_dir, 'local_features.h5')
        
        if not os.path.exists(global_features_path):
            print(f"[*] CSDL tại {db_dir} chưa đủ file. Bỏ qua khởi tạo FAISS.")
            return
            
        print(f"[*] Đang khởi tạo dữ liệu FAISS và load Metadata lên RAM...")
        labels_fixed_path = os.path.join(db_dir, 'labels_fixed.npy')
        self.labels = np.load(labels_fixed_path if os.path.exists(labels_fixed_path) else labels_path, allow_pickle=True)
        self.image_paths = np.load(image_paths_path, allow_pickle=True)
        global_features = np.load(global_features_path)
        
        norms = np.linalg.norm(global_features, axis=1, keepdims=True)
        self.db_globals = global_features / (norms + 1e-8)
        
        cpu_index = faiss.IndexFlatIP(384)
        try:
            res = faiss.StandardGpuResources()
            self.index = faiss.index_cpu_to_gpu(res, 0, cpu_index)
        except Exception:
            self.index = cpu_index
            
        self.index.add(self.db_globals)
        print("[+] Hoàn tất! FAISS Index đã sẵn sàng trực chiến.")
    
    def train(self, dataset_dir="dataset", db_dir="weights"):
        dataset_path = Path(dataset_dir)
        print("="*50)
        print("Thiết bị đang sử dụng: ",self.device)
        print("="*50)
        print("Đang tiến hành quét thư mục: ",dataset_dir)
        print("="*50)
        if not dataset_path.exists():
            print(f"LỖI: Thư mục {dataset_dir} không tồn tại!")
            return
            
        image_paths, labels = scan_image_folder(dataset_dir)
        total_images = len(image_paths)
        print("="*50)
        print("Tìm thấy tổng cộng ", total_images, " ảnh thuộc ", len(set(labels)), " địa điểm.")
        print("="*50)
        os.makedirs(db_dir, exist_ok=True)
        global_features_path = os.path.join(db_dir, 'global_features.npy')
        labels_path = os.path.join(db_dir, 'labels.npy')
        image_paths_path = os.path.join(db_dir, 'image_paths.npy')
        local_features_path = os.path.join(db_dir, 'local_features.h5')
    
        global_feats_list = []
        extract_features_batch(image_paths, labels, self.model, self.transform, self.device, global_features_path, labels_path, image_paths_path, local_features_path)
        print(f"|-- Global Features: {global_features_path}")
        print(f"|-- Metadata (Labels & Paths): {labels_path}")
        print(f"|-- Local Features (HDF5): {local_features_path}")

    def retrain(self, new_dataset_dir, db_dir=weights_dir):
        global_features_path = os.path.join(db_dir, 'global_features.npy')
        labels_path = os.path.join(db_dir, 'labels.npy')
        image_paths_path = os.path.join(db_dir, 'image_paths.npy')
        local_features_path = os.path.join(db_dir, 'local_features.h5')
        print("="*50)
        
        required_paths = [global_features_path, labels_path, image_paths_path, local_features_path]
        if not all(os.path.exists(p) for p in required_paths):
            print(f"    LỖI: Cơ sở dữ liệu tại {db_dir} không tồn tại hoặc thiếu file. Vui lòng chạy build_database trước.")
            return
            
        print("Đang tải dữ liệu hiện tại ...")
        old_global_feats = np.load(global_features_path)
        old_labels = np.load(labels_path, allow_pickle=True).tolist()
        old_image_paths = np.load(image_paths_path, allow_pickle=True).tolist()
        
        # Quét thư mục lấy file mới
        dataset_path = Path(new_dataset_dir)
        print(f"[*] Bắt đầu quét thư mục mới: {dataset_path} ...")
        
        if not dataset_path.exists():
            print(f"LỖI: Thư mục {new_dataset_dir} không tồn tại!")
            return
            
        new_image_paths, new_labels = scan_image_folder(new_dataset_dir, exclude_paths=old_image_paths)
                            
        total_images = len(new_image_paths)
        if total_images == 0:
            print("[*] Không có ảnh mới nào được tìm thấy hoặc tất cả đều đã có trong database.")
            return
            
        print(f"[*] Tìm thấy tổng cộng {total_images} ảnh mới thuộc {len(set(new_labels))} địa điểm.")
        print("[*] Bắt đầu trích xuất đặc trưng cho dữ liệu mới...")
        
        append_features_batch(
            new_image_paths=new_image_paths, 
            new_labels=new_labels, 
            old_global_feats=old_global_feats, 
            old_labels=old_labels, 
            old_image_paths=old_image_paths,
            model=self.model, 
            transform=self.transform, 
            device=self.device, 
            global_features_path=global_features_path, 
            labels_path=labels_path, 
            image_paths_path=image_paths_path, 
            local_features_path=local_features_path
        )

    def predict(self, query_img_path):
        from utils.matcher import match_local_ransac
        
        if not hasattr(self, 'index'):
            print("LỖI: Hệ thống FAISS chưa được nạp. Code đã load thư mục chứa Numpy Array chưa?")
            return None, 0
            
        start_time = time.time()
        print(f"    Có truy vấn hình ảnh mới tại: {query_img_path}")
        
        query_global, query_local = extract_features(query_img_path, self.model, self.transform, self.device)
        query_global = query_global / (np.linalg.norm(query_global) + 1e-8)
        
        D, I = self.index.search(query_global.reshape(1, -1), k=10)
        top10_idx = I[0]
        
        best_inliers = -1
        best_idx = -1
        
        print(f"| Đang ghép cặp (RANSAC)")
        with h5py.File(self.h5_path, 'r') as h5f:
            for i, cand_id in enumerate(top10_idx):
                try: 
                    cand_local = h5f[f'idx_{cand_id}'][()].astype(np.float32)
                except KeyError:
                    continue
                    
                inliers, mutual_dots = match_local_ransac(query_local, cand_local)
                print(f"|-- [Top {i+1}] ID: {cand_id:5d}  | Khung Inliers: {inliers:3d}/{mutual_dots:3d} | Label: {self.labels[cand_id]}")
                
                if inliers > best_inliers:
                    best_inliers = inliers
                    best_idx = cand_id
                    
        print(f"    Thời gian phản hồi xử lý ảnh: {time.time() - start_time:.2f}s")
        
        THRESHOLD = 15  
        if best_inliers < THRESHOLD:
            print("     CẢNH BÁO: TỶ LỆ KHỚP CHƯA ĐẠT CHUẨN!")
            return None, best_inliers

        final_label = self.labels[best_idx]
        final_match_img = self.image_paths[best_idx]
        print(f"KẾT QUẢ: [{final_label}] (Độ tin cậy: {best_inliers} điểm)")
        return final_match_img, best_inliers, time.time() - start_time
