# 📍 Landmark Recognizer API Documentation

Hệ thống nhận diện địa danh (Landmark) thông minh, ứng dụng thuật toán **DINOv2** của Meta (để trích xuất đặc trưng hình ảnh) và thuật toán **FAISS** (tìm kiếm vector tốc độ cao) kết hợp với thuật toán **RANSAC** (để đối chiếu chi tiết các điểm ảnh cục bộ).

---

## 🌐 Thông tin kết nối và Cài đặt Độc lập (Standalone)

Mặc dù hệ thống được tích hợp vào API Server chính ở cổng `8003`, bạn có thể chạy riêng module nhận diện hình ảnh này dưới dạng API độc lập ở cổng `8004`.

**Khởi chạy API Server Độc Lập:**
Từ thư mục gốc dự án (`model_ai`), chạy file qua module Python:
```bash
python3 -m landmark_recognizer.api.app
```
Server sẽ chạy tại `http://0.0.0.0:8004`.
- **Tài liệu Swagger (Interactive):** `http://localhost:8004/docs`

> **Lưu ý:** Lần đầu khởi động có thể tốn từ 10-30s để tải `dinov2_vits14_reg` và các file database vào RAM.

---

## 🛠 Danh sách API chi tiết

### 1. Kiểm tra trạng thái hệ thống (Health Check)
Kiểm tra xem hệ thống đã nạp xong FAISS index, DINOv2 model, và tình trạng GPU/CPU hiện tại chưa.
- **Endpoint:** `GET /landmark/health`
- **Ví dụ Curl:**
  ```bash
  curl -X GET "http://localhost:8003/landmark/health" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>"
  ```
- **Phản hồi mẫu:**
  ```json
  {
    "status": "healthy",
    "device": "cpu",
    "faiss_ready": true,
    "total_vectors": 7085,
    "total_labels": 434
  }
  ```

### 2. Lấy danh sách nhãn địa danh (Labels)
Trả về danh sách toàn bộ các địa danh mà AI hiện đang có khả năng nhận diện (Dựa trên `hash_locations.csv`).
- **Endpoint:** `GET /landmark/labels`
- **Ví dụ Curl:**
  ```bash
  curl -X GET "http://localhost:8003/landmark/labels" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>"
  ```
- **Phản hồi mẫu:**
  ```json
  {
    "total": 434,
    "labels": [
      { "id": "1", "name": "VinWonders Nha Trang" },
      { "id": "2", "name": "Tháp Bà Ponagar" }
    ]
  }
  ```

### 3. Nhận diện hình ảnh (Predict)
Upload một bức ảnh và hệ thống sẽ dự đoán đó là địa danh nào.
- **Endpoint:** `POST /landmark/predict`
- **Body:** `form-data` chứa file ảnh (key là `file`, value là file hình `.jpg`, `.png`).
- **Ví dụ Curl:**
  ```bash
  curl -X POST "http://localhost:8003/landmark/predict" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>" \
       -H "Content-Type: multipart/form-data" \
       -F "file=@/path/to/your/image.jpg"
  ```
- **Phản hồi mẫu:**
  ```json
  {
    "success": true,
    "label": "2",
    "location_name": "Tháp Bà Ponagar",
    "inliers": 85,
    "processing_time": 2.34
  }
  ```

---

## ⚙️ Quy trình xử lý nhận diện (Logic Flow)

1. **Upload:** Người dùng upload một hình ảnh qua API.
2. **Global Feature Extraction (DINOv2):** Mô hình DINOv2 trích xuất một vector đặc trưng duy nhất (Global Feature) đại diện cho toàn bộ hình ảnh.
3. **Similarity Search (FAISS):** Vector này được đối chiếu siêu nhanh với hàng ngàn ảnh trong CSDL FAISS để tìm ra 10 ảnh gần giống nhất (Top-10 Candidates).
4. **Local Feature Matching (RANSAC):** Trong 10 ảnh đó, AI bắt đầu đối chiếu chi tiết từng cụm pixel (Local Features) để lọc nhiễu, sử dụng RANSAC để xem bao nhiêu điểm thật sự khớp nhau (Inliers).
5. **Đánh giá và Trả kết quả:** Ảnh ứng viên nào có số `inliers` cao nhất (và vượt qua mức tối thiểu) sẽ được trả về làm kết quả cuối cùng.

---

## ⚠️ Lưu ý về lỗi (Error Handling)
- **400 Bad Request:** Định dạng ảnh upload không hợp lệ (hỗ trợ jpg, png).
- **503 Service Unavailable:** Hệ thống Model/FAISS Index chưa khởi tạo xong.
- **500 Internal Server Error:** Lỗi trong quá trình xử lý ảnh.