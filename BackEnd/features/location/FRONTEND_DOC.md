# Hướng dẫn tích hợp API Location cho Frontend

Tài liệu này hướng dẫn cách kết nối Frontend (React/Vite/Next.js) với API Location mới.

## 1. Thông tin API
*   **Base URL:** `http://localhost:8080/api` (Tùy cấu hình môi trường)
*   **Endpoint:** `/location/filter/:city`
*   **Method:** `GET`

## 2. Cách gọi API (Ví dụ dùng Axios)

### Lấy danh sách địa điểm theo thành phố
```javascript
const getLocations = async (city) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/location/filter/${city}`);
    return response.data; // Dữ liệu sẽ nằm trong response.data.data
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  }
};
```

### Lọc theo cả thành phố và thể loại
Sử dụng query parameter `category` để lọc chi tiết hơn:
```javascript
const filterLocations = async (city, category) => {
  const response = await axios.get(`${API_BASE_URL}/location/filter/${city}`, {
    params: { category: category }
  });
  return response.data.data;
};
```

## 3. Cấu trúc dữ liệu trả về (Data Schema)
Mỗi item trong danh sách trả về sẽ có cấu trúc như sau:
```json
{
  "id": "uuid-string",
  "location_name": "Tên địa điểm",
  "address": "Địa chỉ chi tiết",
  "overall_rating": "4.5/5",
  "rating_count": "1000",
  "opening_hours": "08:00 - 22:00",
  "description": "Mô tả ngắn gọn về địa điểm",
  "images": ["url1", "url2"],
  "category": ["Văn hóa", "Ẩm thực"],
  "city": "Hanoi"
}
```

## 4. Lưu ý quan trọng cho Frontend
*   **CORS:** Backend đã được cấu hình cho phép `http://localhost:3000`. Nếu Frontend chạy ở port khác, hãy cập nhật biến môi trường `FRONTEND_URL` trong file `.env` của Backend.
*   **Empty State:** Nếu không tìm thấy kết quả, API vẫn trả về status `200` nhưng `data` sẽ là mảng rỗng `[]` và message là "Không tìm thấy điểm đến nào phù hợp".
