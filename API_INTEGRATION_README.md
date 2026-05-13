# Hướng dẫn tích hợp API - Feature: Location & Review

Tài liệu này cung cấp chi tiết về các API backend cho tính năng **Location (Địa điểm)** và **Review (Đánh giá)**, giúp team Frontend dễ dàng tích hợp.

Tất cả các API dưới đây giả định base URL là: `http://localhost:8080` (thay đổi tùy theo môi trường).

---

## 1. Feature: Location (Địa điểm)

Các API Location là **Public** (không cần gửi kèm token đăng nhập), ai cũng có thể truy cập.
Cấu trúc response trả về luôn có dạng chuẩn:
```json
{
  "code": 200,
  "status": "success",
  "message": "...",
  "data": {
    "data": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 1.1 Lấy toàn bộ địa điểm (có phân trang)
- **Method:** `GET`
- **Endpoint:** `/api/location/all`
- **Query Parameters (Tuỳ chọn):**
  - `page`: Trang hiện tại (mặc định: `1`).
  - `limit`: Số lượng item trên mỗi trang (mặc định: `20`, tối đa `100`).
- **Ví dụ gọi API:** `/api/location/all?page=1&limit=10`

### 1.2 Lọc và tìm kiếm địa điểm
- **Method:** `GET`
- **Endpoint:** `/api/location/filter`
- **Query Parameters (Tuỳ chọn):**
  - `city`: Tên thành phố (hỗ trợ tiếng Việt có dấu/không dấu, không phân biệt hoa thường. VD: `Hà Nội`, `ho chi minh`).
  - `category`: Tên danh mục (VD: `Vui chơi`, `Ăn uống`).
  - `page`: Trang hiện tại.
  - `limit`: Số lượng item.
- **Ví dụ gọi API:** `/api/location/filter?city=ho chi minh&category=Vui chơi`

---

## 2. Feature: Review (Đánh giá)

Tính năng review cho phép người dùng đánh giá địa điểm và tải lên hình ảnh.
**Lưu ý quan trọng:** Các API yêu cầu đăng nhập cần truyền Header:
`Authorization: Bearer <Your_Token>` (Token lấy từ Firebase hoặc Local JWT).

### 2.1 Xem danh sách Review của một địa điểm (Public)
- **Method:** `GET`
- **Endpoint:** `/api/review/location/:location_id`
- **Quyền:** Public (Không cần token)
- **Response Data:** Mảng các object review (bao gồm `review_id`, `user_id`, `rating`, `comment`, mảng `images` string, `created_at`).

### 2.2 Xem danh sách Review của bản thân (Protected)
- **Method:** `GET`
- **Endpoint:** `/api/review/my-reviews`
- **Quyền:** Yêu cầu đăng nhập.
- **Response Data:** Mảng các review do chính user hiện tại viết.

### 2.3 Upload hình ảnh Review lên Cloudinary (Protected)
> ⚠️ **Chú ý:** Frontend phải gọi API này ĐẦU TIÊN để lấy URL của ảnh, sau đó mới gửi URL đó vào API Tạo/Cập nhật Review.
- **Method:** `POST`
- **Endpoint:** `/api/review/upload-image`
- **Quyền:** Yêu cầu đăng nhập.
- **Content-Type:** `multipart/form-data`
- **Body:**
  - Key `files`: Chứa các file ảnh (Tối đa 5 file, mỗi file < 10MB).
- **Response Data:**
```json
{
  "code": 200,
  "status": "success",
  "message": "Tải ảnh review thành công",
  "data": {
    "image_urls": [
      "https://res.cloudinary.com/.../image1.jpg",
      "https://res.cloudinary.com/.../image2.jpg"
    ]
  }
}
```

### 2.4 Tạo Review mới (Protected)
- **Method:** `POST`
- **Endpoint:** `/api/review/create`
- **Quyền:** Yêu cầu đăng nhập.
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "location_id": "b3f3e...-uuid", // Bắt buộc
  "rating": 4.5,                  // Bắt buộc, từ 1 đến 5
  "comment": "Trải nghiệm tuyệt vời!",
  "images": [                     // Mảng URL ảnh lấy từ API 2.3 (tuỳ chọn)
    "https://res.cloudinary.com/.../image1.jpg"
  ]
}
```

### 2.5 Cập nhật Review (Protected)
- **Method:** `PUT`
- **Endpoint:** `/api/review/update/:review_id`
- **Quyền:** Yêu cầu đăng nhập (Chỉ sửa được review của chính mình).
- **Content-Type:** `application/json`
- **Body (Tất cả đều tuỳ chọn, gửi gì update nấy):**
```json
{
  "rating": 5.0,
  "comment": "Đã chỉnh sửa comment",
  "images": [
    "https://res.cloudinary.com/.../image3.jpg" // LƯU Ý: Sẽ GHI ĐÈ toàn bộ ảnh cũ bằng mảng ảnh mới này
  ]
}
```

### 2.6 Xóa Review (Protected)
- **Method:** `DELETE`
- **Endpoint:** `/api/review/delete/:review_id`
- **Quyền:** Yêu cầu đăng nhập (Chỉ xoá được review của chính mình).
- **Response Data:** Trả về status 200 OK nếu xoá thành công.

---

## Tóm tắt Flow tạo Review (Dành cho Frontend)
1. Người dùng chọn số 🌟 (rating), viết nhận xét (comment) và chọn ảnh tải lên.
2. Frontend gọi API **2.3 (`/api/review/upload-image`)** bằng FormData chứa danh sách ảnh.
3. Backend trả về mảng `image_urls`.
4. Frontend gom mảng `image_urls` đó cùng với `location_id`, `rating`, `comment` và gọi API **2.4 (`/api/review/create`)** để lưu review vào cơ sở dữ liệu.
