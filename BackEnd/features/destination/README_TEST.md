# Hướng dẫn Kiểm tra Tính năng Destination (Backend)

Tài liệu này hướng dẫn bạn cách kiểm tra xem API Destination đã hoạt động đúng chưa.

## 1. Khởi động Server
Trước tiên, hãy đảm bảo server Backend của bạn đã chạy:
```bash
cd BackEnd
go run cmd/api/main.go
```

## 2. Kiểm tra các Endpoint bằng CURL hoặc Postman

### Lọc theo thành phố (City)
Lệnh này sẽ tìm các địa điểm ở một thành phố cụ thể (Không phân biệt hoa thường).
```bash
curl -X GET http://localhost:8080/api/destination/filter/hanoi
```

### Lọc theo thành phố và Thể loại (Category)
Bạn có thể kết hợp lọc thành phố qua đường dẫn và thể loại qua query parameter.
```bash
curl -X GET "http://localhost:8080/api/destination/filter/hanoi?category=Văn hóa"
```

### Lấy toàn bộ danh sách
```bash
curl -X GET http://localhost:8080/api/destination/all
```

## 3. Lưu ý về dữ liệu
*   **Database trống:** Vì chúng ta không dùng file crawl nên ban đầu Database sẽ chưa có dữ liệu. Bạn có thể dùng Postman hoặc công cụ quản lý DB (như Supabase Dashboard) để thêm vài dòng test vào bảng `destinations`.
*   **AutoMigrate:** Khi chạy server lần đầu, bảng `destinations` sẽ tự động được tạo trong Postgres của bạn.

---
**Cấu trúc dữ liệu mẫu để Test (JSON):**
```json
{
  "location_name": "Hồ Hoàn Kiếm",
  "address": "Hoàn Kiếm, Hà Nội",
  "overall_rating": "4.8/5",
  "city": "Hanoi",
  "category": ["Văn hóa", "Thư giãn"]
}
```
