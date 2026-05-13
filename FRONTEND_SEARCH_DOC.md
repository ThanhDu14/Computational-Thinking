# Hướng dẫn tích hợp API Search cho Frontend

Tài liệu này hướng dẫn Frontend (React/Vite/Next.js) tích hợp tính năng tìm kiếm địa điểm.

## 1. Thông tin API

- **Base URL:** `http://localhost:8080/api`
- **Endpoint:** `/location/search`
- **Method:** `GET`

## 2. Tham số Query

| Param | Bắt buộc | Mô tả | Ví dụ |
|---|---|---|---|
| `q` | ✅ | Từ khóa tìm kiếm tên địa điểm | `Chợ Bến Thành` hoặc `cho ben thanh` |
| `city` | ❌ | Lọc theo thành phố (kết hợp với filter hiện có) | `hochiminh`, `danang` |
| `category` | ❌ | Lọc theo danh mục (kết hợp với filter hiện có) | `Ẩm thực`, `Văn hóa` |
| `page` | ❌ | Số trang (mặc định: 1) | `1` |
| `limit` | ❌ | Số kết quả mỗi trang (mặc định: 20, tối đa: 100) | `10` |

## 3. Cách gọi API

### Với Axios

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Tìm kiếm địa điểm theo tên, có thể kết hợp filter city/category
 * @param {string} keyword - Từ khóa tìm kiếm (bắt buộc)
 * @param {string} city - Lọc theo thành phố (tùy chọn)
 * @param {string} category - Lọc theo danh mục (tùy chọn)
 * @param {number} page - Số trang (mặc định: 1)
 * @param {number} limit - Số kết quả mỗi trang (mặc định: 20)
 */
const searchLocations = async (keyword, city = '', category = '', page = 1, limit = 20) => {
  const params = { q: keyword, page, limit };

  // Chỉ thêm city/category nếu người dùng có chọn
  if (city) params.city = city;
  if (category) params.category = category;

  const response = await axios.get(`${API_BASE_URL}/location/search`, { params });
  return response.data;
};
```

### Với Fetch API

```javascript
const searchLocations = async (keyword, city = '', category = '') => {
  const params = new URLSearchParams({ q: keyword });
  if (city) params.append('city', city);
  if (category) params.append('category', category);

  const response = await fetch(`${API_BASE_URL}/location/search?${params}`);
  return response.json();
};
```

## 4. Cấu trúc Response

### Tìm thấy kết quả (200 OK)

```json
{
  "status": "success",
  "code": 200,
  "message": "Tìm kiếm thành công",
  "data": {
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Chợ Bến Thành",
        "latitude": 10.772461,
        "longitude": 106.698055,
        "duration_minutes": 90,
        "opening_hours": "06:00 - 18:00",
        "address": "Đường Lê Lợi, Quận 1, TP.HCM",
        "rating": 4.3,
        "count_rating": 5200,
        "description": "Ngôi chợ biểu tượng của Sài Gòn...",
        "city": "Thành phố Hồ Chí Minh",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "categories": [
          {
            "id": "uuid-string",
            "category_name": "Mua sắm",
            "created_at": "2024-01-01T00:00:00Z"
          }
        ],
        "images": [
          { "image": "https://example.com/cho-ben-thanh-1.jpg" },
          { "image": "https://example.com/cho-ben-thanh-2.jpg" }
        ]
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 20
  }
}
```

### Không tìm thấy (200 OK, mảng rỗng)

```json
{
  "status": "success",
  "code": 200,
  "message": "Không tìm thấy địa điểm nào phù hợp",
  "data": {
    "data": [],
    "total": 0,
    "page": 1,
    "limit": 20
  }
}
```

### Thiếu từ khóa (400 Bad Request)

```json
{
  "status": "error",
  "code": 400,
  "message": "Vui lòng nhập từ khóa tìm kiếm",
  "data": null
}
```

## 5. Ví dụ tích hợp React Component

```jsx
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

function SearchBar({ selectedCity, selectedCategory }) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    
    setLoading(true);
    try {
      const params = { q: keyword };
      if (selectedCity) params.city = selectedCity;
      if (selectedCategory) params.category = selectedCategory;
      
      const { data } = await axios.get(`${API_BASE_URL}/location/search`, { params });
      setResults(data.data?.data || []);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Tìm kiếm địa điểm..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
      </button>

      {results.map((location) => (
        <div key={location.id}>
          <h3>{location.name}</h3>
          <p>{location.city} • ⭐ {location.rating}</p>
        </div>
      ))}
    </div>
  );
}
```

## 6. Lưu ý quan trọng

- **Hỗ trợ tìm không dấu:** Gõ `cho ben thanh` vẫn tìm ra "Chợ Bến Thành"
- **Hỗ trợ tìm không khoảng trắng:** Gõ `chopbenthanh` vẫn tìm ra "Chợ Bến Thành"
- **Case-insensitive:** Không phân biệt hoa thường
- **Response format giống `/filter`:** Có thể tái sử dụng component hiển thị kết quả
- **CORS:** Backend cho phép `http://localhost:3000`. Đổi port thì cập nhật `FRONTEND_URL` trong `.env`
- **Empty state:** Luôn trả 200 với mảng rỗng `[]`, không trả 404
