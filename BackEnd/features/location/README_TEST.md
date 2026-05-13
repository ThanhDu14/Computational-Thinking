# Hướng dẫn Kiểm tra Tính năng Location (Backend)

Tài liệu này hướng dẫn bạn cách kiểm tra xem API Location đã hoạt động đúng chưa.

## 1. Khởi động Server
Trước tiên, hãy đảm bảo server Backend của bạn đã chạy:
```bash
cd BackEnd
go run cmd/api/main.go
```

## 2. Kiểm tra các Endpoint bằng CURL hoặc Postman

### Lọc theo thành phố (City)
```bash
curl -X GET "http://localhost:8080/api/location/filter?city=hanoi"
```

### Lọc theo thể loại (Category)
```bash
curl -X GET "http://localhost:8080/api/location/filter?category=Văn+hóa"
```

### Lọc kết hợp thành phố + thể loại + phân trang
```bash
curl -X GET "http://localhost:8080/api/location/filter?city=hanoi&category=Văn+hóa&page=1&limit=10"
```

### Lấy toàn bộ danh sách (có phân trang)
```bash
curl -X GET "http://localhost:8080/api/location/all?page=1&limit=20"
```

### Lấy chi tiết một địa điểm cụ thể (Bao gồm ảnh và thể loại)
Copy ID của bất kỳ địa điểm nào từ kết quả phía trên (ví dụ: `01886c54-de94-4a46-8a80-058cc9b7b746`) và chạy:
```bash
curl -X GET "http://localhost:8080/api/location/01886c54-de94-4a46-8a80-058cc9b7b746"
```

## 3. Cấu trúc Response
Tất cả API đều trả về response có phân trang:
```json
{
  "status": "success",
  "message": "Lấy danh sách địa điểm thành công",
  "data": {
    "data": [...],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

## 4. Lưu ý
*   **Phân trang mặc định:** Nếu không truyền `page` và `limit`, mặc định là `page=1`, `limit=20`, tối đa `limit=100`.
*   **Filter linh hoạt:** Có thể lọc chỉ theo `city`, chỉ theo `category`, kết hợp cả hai, hoặc không filter gì (trả tất cả).
*   **Không phân biệt hoa thường:** Tìm kiếm `city` và `category` đều dùng `ILIKE`.
