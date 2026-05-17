# Model AI Server

Đây là API server tổng hợp dành cho hệ thống AI, bao gồm các module chức năng: **Recommendation** (Gợi ý lịch trình du lịch), **Landmark Recognizer** (Nhận diện địa danh qua hình ảnh) và **RAG Chatbot** (Trợ lý ảo AI kết hợp Retrieval-Augmented Generation).

## Bảo mật (Authentication)

Tất cả các API yêu cầu phải truyền header xác thực `X-Internal-Secret` trong mỗi request để đảm bảo chỉ có hệ thống backend nội bộ mới có quyền gọi đến AI server.

- **Header Key**: `X-Internal-Secret`
- **Header Value**: Giá trị của biến môi trường `AI_KEY` được định nghĩa trong file `.env`.

> **Lưu ý trong các ví dụ cURL dưới đây, hãy thay thế `<YOUR_AI_KEY>` bằng key thật của bạn.**

---

## 1. Recommend Endpoints

Các API liên quan đến hệ thống gợi ý lịch trình du lịch.

### 1.1. Lấy gợi ý lịch trình
- **Endpoint:** `/recommend`
- **Method:** `POST`
- **Chức năng:** Nhận dữ liệu đầu vào bao gồm điểm đến (destination), sở thích (preferences) và thông tin di chuyển (logistics) để tạo ra một lịch trình gợi ý phù hợp. Endpoint này chỉ dự đoán, **không lưu vào database**.

**Ví dụ cURL:**
```bash
curl -X POST "http://localhost:8000/recommend" \
     -H "Content-Type: application/json" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>" \
     -d '{
           "destination": {
             "province": "Lâm Đồng"
           },
           "preferences": {
             "categories": ["nature", "culture"],
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

### 1.2. Lưu lịch trình lên Supabase
- **Endpoint:** `/recommend/save/{user_id}`
- **Method:** `POST`
- **Chức năng:** Nhận kết quả lịch trình (JSON từ endpoint `/recommend`) và lưu lên Supabase, liên kết với `user_id` từ bảng `users`. Dữ liệu sẽ được lưu vào các bảng: `plans`, `planday`, `plandaylocation`.

**Ví dụ cURL:**
```bash
curl -X POST "http://localhost:8003/recommend/save/123e4567-e89b-12d3-a456-426614174000" \
     -H "Content-Type: application/json" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>" \
     -d '{
           "itinerary": {
             "day_1": {
               "day": 1,
               "places": [
                 {"location_id": "uuid-1", "name": "Địa điểm A"},
                 {"location_id": "uuid-2", "name": "Địa điểm B"}
               ]
             }
           }
         }'
```

### 1.3. Lấy lịch sử lịch trình
- **Endpoint:** `/recommend/history/{user_id}`
- **Method:** `GET`
- **Chức năng:** Trả về danh sách tất cả các lịch trình (kèm chi tiết các địa điểm theo từng ngày) mà người dùng đã từng tạo và lưu trên hệ thống.

**Ví dụ cURL:**
```bash
curl -X GET "http://localhost:8003/recommend/history/123e4567-e89b-12d3-a456-426614174000" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>"
```

### 1.4. Lấy chi tiết một lịch trình cụ thể
- **Endpoint:** `/recommend/plan/{plan_id}`
- **Method:** `GET`
- **Chức năng:** Trả về chi tiết của duy nhất 1 lịch trình dựa vào `plan_id` của nó.

**Ví dụ cURL:**
```bash
curl -X GET "http://localhost:8003/recommend/plan/YOUR_PLAN_UUID" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>"
```

### 1.5. Xóa một lịch trình
- **Endpoint:** `/recommend/plan/{plan_id}`
- **Method:** `DELETE`
- **Chức năng:** Xóa hoàn toàn 1 lịch trình ra khỏi hệ thống (bao gồm cả các địa điểm trong lịch trình đó).

**Ví dụ cURL:**
```bash
curl -X DELETE "http://localhost:8003/recommend/plan/YOUR_PLAN_UUID" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>"
```

---

## 2. Landmark Recognizer Endpoints

Các API liên quan đến nhận diện địa danh từ hình ảnh.

### 2.1. Kiểm tra trạng thái hệ thống
- **Endpoint:** `/landmark/health`
- **Method:** `GET`
- **Chức năng:** Trả về trạng thái hoạt động của mô hình nhận diện địa danh, thông tin thiết bị đang chạy và dữ liệu Faiss.

**Ví dụ cURL:**
```bash
curl -X GET "http://localhost:8000/landmark/health" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>"
```

### 2.2. Lấy danh sách nhãn địa danh
- **Endpoint:** `/landmark/labels`
- **Method:** `GET`
- **Chức năng:** Lấy toàn bộ danh sách các ID và tên địa danh hiện có trong database của Landmark Recognizer.

**Ví dụ cURL:**
```bash
curl -X GET "http://localhost:8000/landmark/labels" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>"
```

### 2.3. Nhận diện địa danh từ hình ảnh
- **Endpoint:** `/landmark/predict`
- **Method:** `POST`
- **Chức năng:** Nhận diện một địa danh từ file ảnh (chấp nhận `.jpg`, `.jpeg`, `.png`) được người dùng tải lên.

**Ví dụ cURL:**
```bash
curl -X POST "http://localhost:8000/landmark/predict" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>" \
     -F "file=@/path/to/your/image.jpg"
```

---

## 3. Chatbot RAG Endpoints

Các API liên quan đến hội thoại với trợ lý ảo.

### 3.1. Tạo phiên chat mới
- **Endpoint:** `/chat/new`
- **Method:** `POST`
- **Chức năng:** Khởi tạo một phiên trò chuyện (session) mới cho người dùng.

**Ví dụ cURL:**
```bash
curl -X POST "http://localhost:8000/chat/new" \
     -H "Content-Type: application/json" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>" \
     -d '{
           "user_id": "123e4567-e89b-12d3-a456-426614174000"
         }'
```

### 3.2. Gửi tin nhắn chat
- **Endpoint:** `/chat`
- **Method:** `POST`
- **Chức năng:** Gửi tin nhắn đến chatbot. Có thể truyền thêm `session_id` để tiếp tục cuộc trò chuyện hiện tại. Nếu không truyền `session_id`, hệ thống sẽ tự tìm hoặc tạo mới.

**Ví dụ cURL:**
```bash
curl -X POST "http://localhost:8000/chat" \
     -H "Content-Type: application/json" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>" \
     -d '{
           "message": "Xin chào, bạn có thể giúp tôi gợi ý chuyến du lịch Đà Lạt không?",
           "user_id": "123e4567-e89b-12d3-a456-426614174000",
           "session_id": "optional-session-uuid"
         }'
```

### 3.3. Lấy lịch sử đoạn chat
- **Endpoint:** `/chat/{user_id}/{session_id}/history`
- **Method:** `GET`
- **Chức năng:** Lấy toàn bộ lịch sử tin nhắn của một phiên trò chuyện cụ thể.

**Ví dụ cURL:**
```bash
curl -X GET "http://localhost:8000/chat/123e4567-e89b-12d3-a456-426614174000/YOUR_SESSION_ID/history" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>"
```

### 3.4. Xóa phiên trò chuyện
- **Endpoint:** `/chat/{user_id}/{session_id}`
- **Method:** `DELETE`
- **Chức năng:** Xóa bỏ hoàn toàn một phiên trò chuyện của người dùng.

**Ví dụ cURL:**
```bash
curl -X DELETE "http://localhost:8000/chat/123e4567-e89b-12d3-a456-426614174000/YOUR_SESSION_ID" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>"
```

### 3.5. Lấy danh sách tất cả các phiên chat của user
- **Endpoint:** `/sessions/{user_id}`
- **Method:** `GET`
- **Chức năng:** Trả về danh sách tất cả các phiên trò chuyện hiện có của một user.

**Ví dụ cURL:**
```bash
curl -X GET "http://localhost:8000/sessions/123e4567-e89b-12d3-a456-426614174000" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>"
```

### 3.6. Đổi tên phiên trò chuyện
- **Endpoint:** `/sessions/{user_id}/{session_id}/title`
- **Method:** `PATCH`
- **Chức năng:** Cập nhật lại tiêu đề (title) cho một phiên trò chuyện cụ thể.

**Ví dụ cURL:**
```bash
curl -X PATCH "http://localhost:8000/sessions/123e4567-e89b-12d3-a456-426614174000/YOUR_SESSION_ID/title" \
     -H "Content-Type: application/json" \
     -H "X-Internal-Secret: <YOUR_AI_KEY>" \
     -d '{
           "title": "Chuyến du lịch Đà Lạt mùa mưa"
         }'
```
