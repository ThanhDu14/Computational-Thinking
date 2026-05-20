# Travel Recommendation API

Hệ thống API đề xuất lịch trình du lịch tự động, tích hợp lấy dữ liệu từ Supabase và xây dựng lịch trình 3 ngày (mỗi ngày 3 địa điểm).

## Mô tả thuật toán

Quy trình (Pipeline) đề xuất địa điểm hoạt động qua các bước sau:
1. **Lọc theo tỉnh thành (Province)**: Tìm tất cả các địa điểm thuộc tỉnh/thành phố được chỉ định.
2. **Lọc theo danh mục (Categories)**: Giữ lại các địa điểm có chứa ít nhất 1 danh mục mà người dùng mong muốn. Nếu không tìm đủ 9 địa điểm, hệ thống sẽ **mở rộng theo ma trận ngữ nghĩa** (Semantic Matrix) để tìm các danh mục tương đồng (ví dụ: "Khám phá" có thể mở rộng sang "Phiêu lưu", "Văn hóa").
3. **Sắp xếp theo phong cách (Place Style)**:
   - `must_go`: Ưu tiên địa điểm biểu tượng, có lượt đánh giá (count_rating) cao nhất.
   - `high_quality`: Ưu tiên chất lượng, có rating cao và count_rating đạt mức tin cậy nhất định.
   - `hidden_gem`: Ưu tiên ít người biết, có count_rating thấp nhưng rating cao.
4. **Lọc theo khoảng cách (Radius)**: Dựa trên loại phương tiện, hệ thống sẽ lọc các điểm trong bán kính (xe máy: 50km, ô tô: 30km, phương tiện công cộng: 10km) tính từ điểm xuất phát (Trung tâm hoặc Ngoại ô). Nếu không đủ, tự động nhân đôi bán kính.
5. **Xây dựng lịch trình (Itinerary)**: Chọn ra 9 địa điểm tối ưu nhất (sau khi đã lọc và sắp xếp) để phân bổ đều vào 3 ngày (mỗi ngày 3 địa điểm).

## Yêu cầu môi trường

- Python 3.9+
- Khởi tạo virtual environment (`venv`) và cài đặt các package: `fastapi uvicorn pydantic supabase python-dotenv`

## Cài đặt và Khởi chạy Độc lập (Standalone)

Ngoài việc chạy chung với `server.py` ở thư mục gốc, bạn có thể chạy riêng lẻ module Recommend API này (mặc định mở tại port `8001`).

**1. Thiết lập biến môi trường:**
Đảm bảo bạn có file `.env` ở thư mục gốc (nơi có `server.py`) với nội dung:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

**2. Khởi chạy API Server:**
Từ thư mục gốc dự án (`model_ai`), chạy file bằng module Python:
```bash
python3 -m recommend.api.recommend_api
```
Server sẽ chạy tại `http://0.0.0.0:8001`.
- **Swagger UI**: `http://localhost:8001/docs`

## API Endpoints

### 1. Dự đoán lịch trình (Không lưu DB)
- **Endpoint:** `POST /recommend`
- **Body JSON (Mẫu):**
```json
{
  "destination": { "province": "Khánh Hòa" },
  "preferences": {
    "categories": ["Khám phá", "Ẩm thực"],
    "place_style": "must_go"
  },
  "logistics": {
    "starting_point": { "type": "address", "name": "Trung tâm" },
    "transportation": "motorbike"
  }
}
```
- **Ví dụ Curl:**
  ```bash
  curl -X POST "http://localhost:8003/recommend" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>" \
       -H "Content-Type: application/json" \
       -d '{
            "destination": { "province": "Khánh Hòa" },
            "preferences": { "categories": ["Khám phá", "Ẩm thực"], "place_style": "must_go" },
            "logistics": { "starting_point": { "type": "address", "name": "Trung tâm" }, "transportation": "motorbike" }
           }'
  ```

### 2. Lưu lịch trình vào DB
- **Endpoint:** `POST /recommend/save/{user_id}`
- **Body JSON:** Chứa object `itinerary` được trả về từ kết quả dự đoán.
- **Ví dụ Curl:**
  ```bash
  curl -X POST "http://localhost:8003/recommend/save/Test_User" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>" \
       -H "Content-Type: application/json" \
       -d '{"itinerary": {"days": [...]}}'
  ```

### 3. Lấy toàn bộ lịch sử lịch trình
- **Endpoint:** `GET /recommend/history/{user_id}`
- Trả về tất cả các lịch trình đã lưu của người dùng.
- **Ví dụ Curl:**
  ```bash
  curl -X GET "http://localhost:8003/recommend/history/Test_User" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>"
  ```

### 4. Lấy chi tiết & Xóa 1 lịch trình
- **Endpoint Chi tiết:** `GET /recommend/plan/{plan_id}`
  - **Ví dụ Curl:**
    ```bash
    curl -X GET "http://localhost:8003/recommend/plan/12345678-1234-1234-1234-123456789abc" \
         -H "X-Internal-Secret: <YOUR_AI_KEY>"
    ```
- **Endpoint Xóa:** `DELETE /recommend/plan/{plan_id}`
  - **Ví dụ Curl:**
    ```bash
    curl -X DELETE "http://localhost:8003/recommend/plan/12345678-1234-1234-1234-123456789abc" \
         -H "X-Internal-Secret: <YOUR_AI_KEY>"
    ```
