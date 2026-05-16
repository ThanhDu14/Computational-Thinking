# Tài liệu Tích hợp API cho FrontEnd (Wishlist & Search Location)

Tài liệu này mô tả chi tiết các Endpoints từ BackEnd và các nhiệm vụ mà FrontEnd cần thực hiện để tích hợp tính năng **Tìm kiếm địa điểm (Search)** và **Danh sách yêu thích (Wishlist)**.

---

## 1. Tính năng Tìm kiếm & Khám phá Địa điểm (Location)

### 1.1. API: Tìm kiếm địa điểm (Fuzzy Search)
- **Method:** `GET`
- **Endpoint:** `/api/location/search`
- **Mô tả:** Tìm kiếm địa điểm thông minh. Hỗ trợ tìm kiếm không dấu, không khoảng trắng (Ví dụ: `hobalo` vẫn tìm được `Hỏa Lò`).
- **Query Parameters:**
  - `q` (bắt buộc): Từ khóa tìm kiếm.
  - `city` (tùy chọn): Lọc theo thành phố.
  - `category` (tùy chọn): Lọc theo danh mục.
  - `page` / `limit` (tùy chọn): Phân trang (mặc định 1/20).
- **Response thành công (200 OK):**
  ```json
  {
      "status": "success",
      "code": 200,
      "data": {
          "data": [ 
              { "id": "...", "name": "Nhà tù Hỏa Lò", "city": "Hà Nội", "rating": 4.8, ... } 
          ],
          "total": 54,
          "page": 1,
          "limit": 20
      }
  }
  ```

### 1.2. API: Lọc địa điểm (Filter)
- **Method:** `GET`
- **Endpoint:** `/api/location/filter`
- **Mô tả:** Lấy danh sách địa điểm theo bộ lọc thành phố hoặc danh mục (thường dùng cho trang khám phá).
- **Query Parameters:** `city`, `category`, `page`, `limit`.
- **Response:** Cấu trúc tương tự API Search.

### 1.3. API: Lấy chi tiết địa điểm (Detail)
- **Method:** `GET`
- **Endpoint:** `/api/location/:id`
- **Mô tả:** Lấy toàn bộ thông tin chi tiết của một địa điểm để hiển thị trang chi tiết.
- **Response thành công (200 OK):**
  ```json
  {
      "status": "success",
      "data": {
          "id": "...",
          "name": "Nhà tù Hỏa Lò",
          "description": "...",
          "images": [{ "image": "url..." }],
          "categories": [{ "category_name": "Văn hóa" }],
          ...
      }
  }
  ```

### 📌 Nhiệm vụ của FrontEnd (Location):
1. **Xử lý Search Bar:** Bắt sự kiện `Enter` hoặc click nút tìm kiếm. Hiển thị trạng thái "Loading" khi đang gọi API.
2. **Xử lý dữ liệu:** Lưu ý dữ liệu danh sách nằm trong `data.data`, thông tin phân trang nằm trong `data`.
3. **Fuzzy Search:** Khuyến khích hiển thị kết quả ngay khi người dùng gõ (debounce) vì API hỗ trợ tìm kiếm rất linh hoạt.
4. **Trang chi tiết:** Khi người dùng click vào Card địa điểm, điều hướng sang `/location/:id` và gọi API **[1.3]** để lấy data.
5. **Xử lý lỗi:** Nếu `data.data` rỗng, hiển thị thông báo *"Không tìm thấy địa điểm nào phù hợp"*.

---

## 2. Tính năng Danh sách Yêu thích (Wishlist)

⚠️ **LƯU Ý QUAN TRỌNG:** Tất cả các endpoint của Wishlist đều yêu cầu người dùng phải đăng nhập. FrontEnd bắt buộc phải đính kèm Token vào Header của request.
- **Header bắt buộc:**
  ```http
  Authorization: Bearer <Your_Token>
  Content-Type: application/json
  ```

### 2.1. API: Thêm vào Wishlist
- **Method:** `POST`
- **Endpoint:** `/api/wishlist/add`
- **Body (JSON):**
  ```json
  {
      "location_id": "string-uuid-cua-dia-diem"
  }
  ```
- **Response lỗi thường gặp (409 Conflict):** Lỗi *"địa điểm này đã có trong wishlist của bạn"*.

### 2.2. API: Xem danh sách Wishlist
- **Method:** `GET`
- **Endpoint:** `/api/wishlist/my-wishlist`
- **Mô tả:** Lấy danh sách toàn bộ các địa điểm mà user đã lưu.
- **Response thành công (200 OK):**
  ```json
  {
      "status": "success",
      "message": "Lấy danh sách wishlist thành công",
      "data": [
          { "location_id": "uuid-1" },
          { "location_id": "uuid-2" }
      ]
  }
  ```

### 2.3. API: Xóa khỏi Wishlist
- **Method:** `DELETE`
- **Endpoint:** `/api/wishlist/remove/:location_id`
- **Mô tả:** Xóa một địa điểm cụ thể khỏi danh sách yêu thích. Trả về 200 OK nếu xóa thành công.

### 2.4. API: Kiểm tra địa điểm đã lưu chưa
- **Method:** `GET`
- **Endpoint:** `/api/wishlist/check/:location_id`
- **Mô tả:** Dùng để hiển thị trạng thái nút trái tim (đã thả tim hay chưa) khi user vào xem chi tiết một địa điểm.
- **Response thành công (200 OK):**
  ```json
  {
      "status": "success",
      "message": "Kiểm tra wishlist thành công",
      "data": {
          "location_id": "uuid-1",
          "is_in_wishlist": true
      }
  }
  ```

### 📌 Nhiệm vụ của FrontEnd (Wishlist):
1. **Lưu trữ Token:** Lấy token từ lúc Login để nhúng vào API (ví dụ dùng `localStorage.getItem('token')`).
2. **Nút "Thả tim" (Favorite Button):**
   - Khi load trang chi tiết địa điểm, gọi API **[2.4] (Check)** để xem user đã lưu chưa -> Hiển thị trái tim Đỏ (đã lưu) hoặc Trắng (chưa lưu).
   - Nếu bấm tim Trắng -> Gọi API **[2.1] (Add)**.
   - Nếu bấm tim Đỏ -> Gọi API **[2.3] (Remove)**.
3. **Trang Danh sách Yêu thích (My Wishlist Page):**
   - Gọi API **[2.2] (Get My Wishlist)** để lấy mảng các `location_id`.
   - Lấy `location_id` đó đi fetch thêm thông tin chi tiết địa điểm (tên, hình ảnh) để hiển thị lên UI cho user xem.
