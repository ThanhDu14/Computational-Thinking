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
- Khởi tạo virtual environment (`venv`) và cài đặt các package.

## Cài đặt và Khởi chạy

**1. Cài đặt các thư viện cần thiết:**
Cài đặt từ `requirements.txt` hoặc cài đặt thủ công:
```bash
pip install fastapi uvicorn pydantic supabase python-dotenv
```

**2. Thiết lập biến môi trường:**
Đảm bảo bạn có file `.env` ở thư mục `recommend/` với nội dung:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
*(Lưu ý: Hệ thống ưu tiên `SUPABASE_SERVICE_ROLE_KEY` để tránh lỗi RLS khi truy vấn).*

**3. Khởi chạy API Server:**
Chạy server API bằng Uvicorn từ thư mục `recommend`:
```bash
uvicorn api.recommend_api:app --host 0.0.0.0 --port 8000 --reload
```
Server sẽ chạy tại `http://0.0.0.0:8000`.

## API Documentation

Khi server đang chạy, bạn có thể xem tài liệu API qua trình duyệt:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`0

## Lệnh `curl` mẫu

Dưới đây là một lệnh curl để test endpoint `/recommend`:

```bash
curl -X 'POST' \
  'http://localhost:8000/recommend' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "destination": {
    "province": "Khánh Hòa"
  },
  "preferences": {
    "categories": [
      "Khám phá",
      "Ẩm thực"
    ],
    "place_style": "must_go"
  },
  "logistics": {
    "starting_point": {
      "type": "address",
      "name": "Trung tâm"
    },
    "transportation": "motorbike"
  }
}'
```
