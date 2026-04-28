# Hướng dẫn tích hợp API Location cho Frontend

Tài liệu này hướng dẫn cách kết nối Frontend (React/Vite/Next.js) với API Location mới.

## 1. Thông tin API
*   **Base URL:** `http://localhost:8080/api` (Tùy cấu hình môi trường)
*   **Endpoint Filter:** `/location/filter`
*   **Endpoint Detail:** `/location/:id`
*   **Method:** `GET`

## 2. Cách gọi API (Ví dụ dùng Axios)

### Lấy danh sách địa điểm theo thành phố và thể loại
Sử dụng query parameter `city` và `category` để lọc:
```javascript
const filterLocations = async (city, category) => {
  const response = await axios.get(`${API_BASE_URL}/location/filter`, {
    params: { city: city, category: category }
  });
  return response.data.data;
};
```

### Lấy chi tiết một địa điểm cụ thể
Chuyển hướng người dùng khi click vào một địa điểm và gọi API này với `id` của địa điểm đó:
```javascript
const getLocationDetail = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/location/${id}`);
  return response.data.data;
};
```

## 3. Cấu trúc dữ liệu trả về (Data Schema)
Mỗi item trong danh sách trả về (và cả lúc lấy chi tiết) sẽ có cấu trúc như sau:
```json
{
  "id": "uuid-string",
  "name": "Tên địa điểm",
  "latitude": 10.776656,
  "longitude": 106.700853,
  "duration_minutes": 120,
  "opening_hours": "08:00 - 22:00",
  "address": "Địa chỉ chi tiết",
  "rating": 4.5,
  "count_rating": 1000,
  "description": "Mô tả ngắn gọn về địa điểm",
  "city": "Thành phố Hồ Chí Minh",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "categories": [
    {
      "id": "uuid-string",
      "category_name": "Văn hóa",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "images": [
    {
      "image": "https://url-anh-1.com/img.jpg"
    },
    {
      "image": "https://url-anh-2.com/img.jpg"
    }
  ]
}
```

## 4. Lưu ý quan trọng cho Frontend
*   **CORS:** Backend đã được cấu hình cho phép `http://localhost:3000`. Nếu Frontend chạy ở port khác, hãy cập nhật biến môi trường `FRONTEND_URL` trong file `.env` của Backend.
*   **Empty State:** Nếu không tìm thấy kết quả, API vẫn trả về status `200` nhưng `data` sẽ là mảng rỗng `[]` và message là "Không tìm thấy điểm đến nào phù hợp".
