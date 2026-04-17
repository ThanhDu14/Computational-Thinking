# 🚀 Smart Travel Backend - Hướng dẫn Cài đặt & Testing

Chào mừng bạn đến với hệ thống Backend của dự án Smart Travel. Tài liệu này sẽ giúp bạn thiết lập môi trường và kiểm tra các tính năng (đặc biệt là API Destination mới) bằng Postman.

---

## 🛠 1. Thiết lập Môi trường

Để server chạy thành công, bạn **bắt buộc** phải có 2 file sau trong thư mục `BackEnd/`:

### 1.1 file `.env`
Tạo file `.env` từ file mẫu và điền thông tin Database (Supabase):
```env
DATABASE_URL=postgresql://postgres.[ID]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
SERVER_PORT=8080
FRONTEND_URL=http://localhost:3000
```

### 1.2 file `serviceAccountKey.json`
Tải file này từ Firebase Console (Project Settings > Service Accounts) và đặt vào thư mục `BackEnd/`. Đây là chìa khóa để hệ thống có thể xác thực người dùng Google.

---

## 🏃 2. Cách Chạy Server

Mở terminal và chạy các lệnh sau:
```bash
cd BackEnd
go run cmd/api/main.go
```
Nếu thấy dòng chữ **"Đã kết nối thành công đến PostgreSQL!"** và **"Server đang chạy tại: http://localhost:8080"** là bạn đã thành công!

---

## 📮 3. Hướng dẫn Test bằng Postman

Tính năng mới **Destination** cho phép bạn tìm kiếm địa điểm du lịch theo thành phố.

### 3.1 Cấu hình Request chung
- **Method:** `GET`
- **URL Base:** `http://localhost:8080/api`

### 3.2 Các API Endpoint để Test

#### A. Lọc theo Thành phố (City)
Dùng để lấy toàn bộ địa điểm của một tỉnh/thành.
- **URL:** `http://localhost:8080/api/destination/filter/hanoi` (Thay `hanoi` bằng tên khác nếu cần)
- **Cách làm trong Postman:** Nhập URL -> Bấm **Send**.

#### B. Lọc nâng cao (City + Category)
Dùng khi người dùng muốn tìm "Đồ ăn tại Hà Nội".
- **URL:** `http://localhost:8080/api/destination/filter/hanoi?category=Ẩm thực`
- **Cách làm trong Postman:**
    1. Nhập URL: `http://localhost:8080/api/destination/filter/hanoi`
    2. Chọn tab **Params**.
    3. Thêm Key: `category` | Value: `Ẩm thực`.
    4. Bấm **Send**.

#### C. Xem toàn bộ danh sách
- **URL:** `http://localhost:8080/api/destination/all`

---

## 📝 4. Cấu trúc dữ liệu JSON (Để bạn thêm mẫu vào DB)

Vì hiện tại Database của bạn có thể đang trống, bạn có thể thêm mẫu dòng này vào Postgres để test:

```json
{
  "location_name": "Văn Miếu Quốc Tử Giám",
  "address": "Đống Đa, Hà Nội",
  "overall_rating": "4.5/5",
  "city": "Hanoi",
  "category": ["Văn hóa", "Lịch sử"],
  "images": ["https://vi.wikipedia.org/wiki/File:Van_Mieu_01.jpg"]
}
```

---

## 💡 Mẹo nhỏ
- Nếu bạn sửa code Backend, hãy tắt server (Ctrl+C) và chạy lại lệnh `go run` để cập nhật thay đổi.
- Mọi phản hồi từ API đều có chung cấu trúc: `{ "status": "...", "code": ..., "message": "...", "data": ... }`.
