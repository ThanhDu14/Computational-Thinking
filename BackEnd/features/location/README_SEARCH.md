# 🔍 Tính năng Tìm kiếm Địa điểm (Location Search)

## Tổng quan

Tính năng cho phép người dùng tìm kiếm địa điểm du lịch theo **tên**, kết hợp với bộ lọc **thành phố** và **danh mục** có sẵn. Kết quả được sắp xếp theo đánh giá (rating) giảm dần.

---

## Kỹ thuật & Thuật toán sử dụng

### 1. Pattern Matching với ILIKE (Case-Insensitive LIKE)

Sử dụng toán tử `ILIKE` của PostgreSQL — biến thể không phân biệt hoa/thường của `LIKE`. Hỗ trợ ký tự đại diện `%` để tìm kiếm chuỗi con (substring matching).

```sql
WHERE name ILIKE '%từ khóa%'
```

**Tại sao chọn ILIKE thay vì Full-Text Search (FTS)?**
- Dữ liệu đồ án có quy mô nhỏ (< 10,000 bản ghi) → ILIKE đủ nhanh
- FTS yêu cầu tạo Index GIN và cấu hình `tsvector` → phức tạp hóa không cần thiết
- ILIKE hỗ trợ tìm chuỗi con tự nhiên hơn (VD: "Bến" tìm ra "Chợ Bến Thành")

### 2. Xử lý Tiếng Việt với PostgreSQL `unaccent`

Tiếng Việt có dấu thanh (sắc, huyền, hỏi, ngã, nặng) gây khó khăn khi tìm kiếm. Extension `unaccent` của PostgreSQL giải quyết vấn đề này bằng cách **loại bỏ toàn bộ dấu** trước khi so sánh.

```sql
-- Người dùng gõ: "cho ben thanh"
-- Database chứa:  "Chợ Bến Thành"
-- Sau unaccent:   "Cho Ben Thanh" ≈ "cho ben thanh" → KHỚP ✅

WHERE unaccent(name) ILIKE unaccent('%cho ben thanh%')
```

Extension được kích hoạt tự động khi server khởi động:
```go
db.Exec("CREATE EXTENSION IF NOT EXISTS unaccent;")
```

### 3. Chuẩn hóa chuỗi (String Normalization)

Trước khi so sánh, cả input của người dùng và dữ liệu trong DB đều được **xóa khoảng trắng** bằng hàm `REPLACE`:

```sql
-- Input:    "ho chi minh" → "hochiminh"
-- Database: "Hồ Chí Minh" → unaccent → "Ho Chi Minh" → REPLACE → "HoChiMinh"
-- So sánh:  "hochiminh" ILIKE "HoChiMinh" → KHỚP ✅ (ILIKE không phân biệt hoa/thường)

WHERE REPLACE(unaccent(name), ' ', '') ILIKE unaccent('%hochiminh%')
```

### 4. Subquery cho Filter Category (Tránh Duplicate)

Khi filter theo category, sử dụng **Subquery** thay vì `JOIN` trực tiếp để tránh nhân bản kết quả khi một địa điểm thuộc nhiều category:

```sql
WHERE location_id IN (
  SELECT lc.location_id FROM locationcategories lc
  JOIN categories c ON c.category_id = lc.category_id
  WHERE unaccent(c.category_name) ILIKE unaccent('%ẩm thực%')
)
```

### 5. Sắp xếp theo Rating

Kết quả được sắp xếp theo cột `rating` giảm dần — địa điểm có đánh giá cao sẽ hiển thị trước:

```sql
ORDER BY rating DESC
```

---

## Luồng xử lý (Flow)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌────────────┐
│   Frontend   │────▶│   Handler    │────▶│     Service      │────▶│ PostgreSQL │
│  Search Bar  │     │  Validate q  │     │  Build Query     │     │   ILIKE    │
│  + Filters   │     │  Parse params│     │  + unaccent()    │     │  unaccent  │
└──────────────┘     └──────────────┘     └──────────────────┘     └────────────┘
     GET                 400 nếu              Preload               ORDER BY
  /search?q=xxx          q rỗng            Categories,Images      rating DESC
  &city=xxx                                 Count + Find
  &category=xxx
```

---

## Endpoint

```
GET /api/location/search?q={keyword}&city={city}&category={category}&page={page}&limit={limit}
```

| Tham số | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `q` | ✅ | string | Từ khóa tìm kiếm (tên địa điểm) |
| `city` | ❌ | string | Lọc theo thành phố |
| `category` | ❌ | string | Lọc theo danh mục |
| `page` | ❌ | int | Số trang (mặc định: 1) |
| `limit` | ❌ | int | Kết quả mỗi trang (mặc định: 20, tối đa: 100) |

---

## Ví dụ

| Mục đích | URL |
|---|---|
| Tìm theo tên | `/api/location/search?q=Chợ Bến Thành` |
| Tìm không dấu | `/api/location/search?q=cho ben thanh` |
| Tìm + lọc city | `/api/location/search?q=biển&city=danang` |
| Tìm + lọc cả 2 | `/api/location/search?q=cầu&city=danang&category=vanHoa` |
| Phân trang | `/api/location/search?q=chùa&page=2&limit=10` |

---

## Cấu trúc code

```
features/location/
├── model.go       # Struct: Location, Category, LocationImage, LocationCategory
├── handler.go     # SearchLocationHandler — validate input, trả response
├── service.go     # SearchLocations — build query ILIKE + unaccent
├── route.go       # Đăng ký GET /search
└── README_SEARCH.md  # Tài liệu này
```
