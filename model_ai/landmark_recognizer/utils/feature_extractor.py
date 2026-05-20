import torch
import torchvision.transforms as T
from PIL import Image
import numpy as np
import h5py
from tqdm import tqdm

def get_aug_transform():
    """
    Trả về bộ biến đổi ảnh phục vụ cho Image-level Data Augmentation:
    - Flip ngang ngẫu nhiên
    - Xoay ngẫu nhiên từ -15 đến +15 độ
    - Cắt và phóng to ngẫu nhiên từ 80% đến 100% diện tích ảnh gốc
    - Tự động thay đổi độ sáng, tương phản, độ bão hòa màu và sắc thái nhẹ
    """
    return T.Compose([
        T.RandomHorizontalFlip(p=0.5),
        T.RandomRotation(degrees=15),
        T.RandomResizedCrop(size=(336, 336), scale=(0.8, 1.0)),
        T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        T.ToTensor(),
        T.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ])

def extract_features(image_path, model, transform, device):
    """
    Trích xuất đặc trưng (global và local) từ một hình ảnh bằng mô hình.
    """
    img = Image.open(image_path).convert('RGB')
    img_tensor = transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        ret = model.forward_features(img_tensor)
        cls_token = ret['x_norm_clstoken'].cpu().numpy()[0]
        patch_tokens = ret['x_norm_patchtokens'].cpu().numpy()[0].astype(np.float16)
    return cls_token, patch_tokens

def extract_features_batch(image_paths, labels, model, transform, device, global_features_path, labels_path, image_paths_path, local_features_path, n_augments=4):
    """
    Trích xuất đặc trưng hàng loạt kết hợp Image-level Data Augmentation trong bộ nhớ.
    Lưu ý: Chỉ lưu local features của ảnh gốc vào H5 để tiết kiệm ổ cứng (dưới 10GB).
    """
    global_feats_list = []
    final_labels = []
    final_image_paths = []
    
    aug_transform = get_aug_transform()
    embed_dim = getattr(model, "embed_dim", 384)
    
    with h5py.File(local_features_path, 'w') as h5f:
        current_idx = 0
        for i, img_path in enumerate(tqdm(image_paths, desc="Features Extraction (with Augmentation)")):
            try:
                # 1. Trích xuất ảnh gốc
                img = Image.open(img_path).convert('RGB')
                orig_tensor = transform(img).unsqueeze(0).to(device)
                with torch.no_grad():
                    ret = model.forward_features(orig_tensor)
                    cls_token = ret['x_norm_clstoken'].cpu().numpy()[0]
                    patch_tokens = ret['x_norm_patchtokens'].cpu().numpy()[0].astype(np.float16)
                
                global_feats_list.append(cls_token)
                final_labels.append(labels[i])
                final_image_paths.append(img_path)
                # Lưu local features cho ảnh gốc
                h5f.create_dataset(f'idx_{current_idx}', data=patch_tokens, compression="gzip", compression_opts=4)
                current_idx += 1
                
                # 2. Trích xuất các biến thể augmented in-memory
                for aug_i in range(n_augments):
                    aug_tensor = aug_transform(img).unsqueeze(0).to(device)
                    with torch.no_grad():
                        ret_aug = model.forward_features(aug_tensor)
                        cls_token_aug = ret_aug['x_norm_clstoken'].cpu().numpy()[0]
                        # Không cần lưu patch_tokens cho ảnh augmented vào H5 để tiết kiệm bộ nhớ
                    
                    global_feats_list.append(cls_token_aug)
                    final_labels.append(labels[i])
                    final_image_paths.append(f"{img_path}_aug_{aug_i}")
                    # Không gọi h5f.create_dataset cho ảnh augmented
                    current_idx += 1
                    
            except Exception as e:
                print(f"\n  Lỗi: Không thể xử lý ảnh {img_path}: {e}")
                global_feats_list.append(np.zeros(embed_dim, dtype=np.float32))
                final_labels.append(labels[i])
                final_image_paths.append(img_path)
                h5f.create_dataset(f'idx_{current_idx}', data=np.zeros((1, embed_dim), dtype=np.float16), compression="gzip", compression_opts=4)
                current_idx += 1

    print("Đang lưu ...")
    np.save(global_features_path, np.array(global_feats_list, dtype=np.float32))
    np.save(labels_path, np.array(final_labels, dtype=object))
    np.save(image_paths_path, np.array(final_image_paths, dtype=object))
    print("Đã lưu thành công!")

def append_features_batch(new_image_paths, new_labels, old_global_feats, old_labels, old_image_paths, 
                          model, transform, device, global_features_path, labels_path, image_paths_path, local_features_path, n_augments=4):
    """
    Bổ sung đặc trưng hàng loạt kết hợp Image-level Data Augmentation trong bộ nhớ.
    Lưu ý: Chỉ lưu local features của ảnh gốc vào H5 để tiết kiệm ổ cứng (dưới 10GB).
    """
    start_idx = len(old_image_paths)
    new_global_feats_list = []
    added_labels = []
    added_image_paths = []
    
    aug_transform = get_aug_transform()
    embed_dim = getattr(model, "embed_dim", 384)
    
    with h5py.File(local_features_path, 'a') as h5f:
        current_idx = start_idx
        for i, img_path in enumerate(tqdm(new_image_paths, desc="Features Update (with Augmentation)")):
            try:
                # 1. Trích xuất ảnh gốc
                img = Image.open(img_path).convert('RGB')
                orig_tensor = transform(img).unsqueeze(0).to(device)
                with torch.no_grad():
                    ret = model.forward_features(orig_tensor)
                    cls_token = ret['x_norm_clstoken'].cpu().numpy()[0]
                    patch_tokens = ret['x_norm_patchtokens'].cpu().numpy()[0].astype(np.float16)
                
                new_global_feats_list.append(cls_token)
                added_labels.append(new_labels[i])
                added_image_paths.append(img_path)
                # Lưu local features cho ảnh gốc
                h5f.create_dataset(f'idx_{current_idx}', data=patch_tokens, compression="gzip", compression_opts=4)
                current_idx += 1
                
                # 2. Trích xuất các biến thể augmented
                for aug_i in range(n_augments):
                    aug_tensor = aug_transform(img).unsqueeze(0).to(device)
                    with torch.no_grad():
                        ret_aug = model.forward_features(aug_tensor)
                        cls_token_aug = ret_aug['x_norm_clstoken'].cpu().numpy()[0]
                        # Không cần lưu patch_tokens cho ảnh augmented vào H5
                    
                    new_global_feats_list.append(cls_token_aug)
                    added_labels.append(new_labels[i])
                    added_image_paths.append(f"{img_path}_aug_{aug_i}")
                    # Không gọi h5f.create_dataset cho ảnh augmented
                    current_idx += 1
                    
            except Exception as e:
                print(f"\n  Lỗi: Không thể xử lý ảnh {img_path}: {e}")
                new_global_feats_list.append(np.zeros(embed_dim, dtype=np.float32))
                added_labels.append(new_labels[i])
                added_image_paths.append(img_path)
                h5f.create_dataset(f'idx_{current_idx}', data=np.zeros((1, embed_dim), dtype=np.float16), compression="gzip", compression_opts=4)
                current_idx += 1

    updated_global_feats = np.vstack((old_global_feats, np.array(new_global_feats_list, dtype=np.float32)))
    updated_labels = old_labels + added_labels
    updated_image_paths = old_image_paths + added_image_paths
    
    print("Đang lưu bản cập nhật ...")
    np.save(global_features_path, updated_global_feats)
    np.save(labels_path, np.array(updated_labels, dtype=object))
    np.save(image_paths_path, np.array(updated_image_paths, dtype=object))
    print(f"\n✅ Hoàn tất cập nhật! Tổng số ảnh trong gallery (gồm cả biến thể): {len(updated_image_paths)}")