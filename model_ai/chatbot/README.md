# 🌊 Nha Trang Travel Chatbot API Documentation

Hệ thống cung cấp API cho Chatbot tư vấn du lịch Nha Trang, tích hợp công nghệ RAG và quản lý hội thoại thông minh.

---

## 🌐 Thông tin kết nối và Cài đặt Độc lập (Standalone)

Ngoài việc được nhúng trong `server.py` ở cổng 8003, bạn hoàn toàn có thể chạy module Chatbot API này thành một server độc lập (mặc định mở tại cổng `8002`).

**1. Khởi chạy API Server:**
Từ thư mục gốc dự án (`model_ai`), chạy file bằng module Python:
```bash
python3 -m model_ai.chatbot.src.api.chat_api
```
Server sẽ chạy tại `http://0.0.0.0:8002`.
- **Tài liệu Swagger (Interactive):** `http://localhost:8002/docs`

> **Lưu ý:** Nếu chạy cùng `server.py` thì Base URL sẽ là `http://localhost:8003`.

---

## 🛠 Danh sách API chi tiết

### 1. Tạo đoạn chat mới (New Chat)
Khởi tạo một phiên làm việc mới để bắt đầu lưu trữ lịch sử.
- **Endpoint:** `POST /chat/new`
- **Body (JSON):** 
  ```json
  { "user_id": "Test_User" }
  ```
- **Ví dụ Curl:**
  ```bash
  curl -X POST "http://localhost:8003/chat/new" \
       -H "Content-Type: application/json" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>" \
       -d '{"user_id": "Test_User"}'
  ```
- **Phản hồi:** 
  ```json
  {
    "status": "success",
    "session_id": "4ed2b013-a771-42e6-9b49-5b66a1aa93d7",
    "title": "New Chat"
  }
  ```

### 2. Gửi tin nhắn (Chat)
Gửi câu hỏi và nhận phản hồi từ AI tích hợp dữ liệu RAG.
- **Endpoint:** `POST /chat`
- **Body (JSON):**
  ```json
  {
    "message": "Nha Trang có món gì ngon?",
    "user_id": "Test_User",
    "session_id": "4ed2b013-a771-42e6-9b49-5b66a1aa93d7"
  }
  ```
- **Ví dụ Curl:**
  ```bash
  curl -X POST "http://localhost:8003/chat" \
       -H "Content-Type: application/json" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>" \
       -d '{
            "message": "Nha Trang có món gì ngon?",
            "user_id": "Test_User",
            "session_id": "4ed2b013-a771-42e6-9b49-5b66a1aa93d7"
           }'
  ```
- **Phản hồi:**
  ```json
  {
    "session_id": "4ed2b013-a771-42e6-9b49-5b66a1aa93d7",
    "reply": "Nha Trang nổi tiếng với nhiều món ngon như: \n1. Nem nướng Đặng Văn Quyên...\n2. Bún cá sứa..."
  }
  ```


### 3. Lấy lịch sử chat (History)
Hiển thị lại nội dung tin nhắn cũ khi người dùng click vào một cuộc hội thoại.
- **Endpoint:** `GET /chat/{user_id}/{session_id}/history`
- **Ví dụ Curl:**
  ```bash
  curl -X GET "http://localhost:8003/chat/Test_User/4ed2b013-a771-42e6-9b49-5b66a1aa93d7/history" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>"
  ```
- **Phản hồi:** 
  ```json
  {
    "session_id": "4ed2b013-a771-42e6-9b49-5b66a1aa93d7",
    "total_messages": 2,
    "messages": [
      { "role": "user", "content": "Nha Trang có món gì ngon?" },
      { "role": "assistant", "content": "Nha Trang nổi tiếng với..." }
    ]
  }
  ```

### 4. Danh sách các phiên (Sidebar)
Lấy danh sách các cuộc hội thoại cũ để hiển thị ở thanh bên (Sidebar).
- **Endpoint:** `GET /sessions/{user_id}`
- **Ví dụ Curl:**
  ```bash
  curl -X GET "http://localhost:8003/sessions/Test_User" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>"
  ```
- **Phản hồi:** 
  ```json
  {
    "user_id": "Test_User",
    "sessions": [
      {
        "id": "4ed2b013-a771-42e6-9b49-5b66a1aa93d7",
        "title": "Ẩm thực Nha Trang",
        "created_at": "2024-05-06T13:45:00"
      }
    ]
  }
  ```

### 5. Xóa hội thoại (Delete Session)
Xóa vĩnh viễn một cuộc hội thoại.
- **Endpoint:** `DELETE /chat/{user_id}/{session_id}`
- **Ví dụ Curl:**
  ```bash
  curl -X DELETE "http://localhost:8003/chat/Test_User/4ed2b013-a771-42e6-9b49-5b66a1aa93d7" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>"
  ```
- **Phản hồi:** 
  ```json
  {
    "status": "success", 
    "message": "Đã xóa hội thoại 4ed2b013-a771-42e6-9b49-5b66a1aa93d7" 
  }
  ```

### 6. Đổi tên hội thoại (Rename Session)
Đổi tên hiển thị của hội thoại.
- **Endpoint:** `PATCH /sessions/{user_id}/{session_id}/title`
- **Body (JSON):**
  ```json
  { "title": "Du lịch biển" }
  ```
- **Ví dụ Curl:**
  ```bash
  curl -X PATCH "http://localhost:8003/sessions/Test_User/4ed2b013-a771-42e6-9b49-5b66a1aa93d7/title" \
       -H "Content-Type: application/json" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>" \
       -d '{"title": "Du lịch biển"}'
  ```

### 7. Chat bằng Hình ảnh (Image Upload + Landmark)
Tải lên một bức ảnh, hệ thống sẽ lưu ảnh vào Supabase Bucket, nhận diện địa danh bằng AI, lưu metadata vào DB và tự động tạo câu hỏi để hỏi Chatbot về địa điểm đó.
- **Endpoint:** `POST /chat/image`
- **Body:** `form-data`
  - `file`: File ảnh (`.jpg`, `.png`).
  - `user_id`: UUID của người dùng.
  - `session_id`: (Tùy chọn) UUID của phiên chat hiện tại. Nếu không có, hệ thống sẽ tạo phiên mới.
- **Ví dụ Curl:**
  ```bash
  curl -X POST "http://localhost:8003/chat/image" \
       -H "X-Internal-Secret: <YOUR_AI_KEY>" \
       -F "file=@/path/to/image.jpg" \
       -F "user_id=12345678-1234-1234-1234-123456789abc" \
       -F "session_id=4ed2b013-a771-42e6-9b49-5b66a1aa93d7"
  ```
- **Phản hồi:** 
  ```json
  {
    "session_id": "4ed2b013-a771-42e6-9b49-5b66a1aa93d7",
    "image_url": "https://<supabase-url>/storage/v1/object/public/images/1234.../xyz.jpg",
    "location_name": "Tháp Bà Ponagar",
    "reply": {
       "message": "Tháp Bà Ponagar là một ngôi đền Chăm Pa nằm ở Nha Trang...",
       "data": []
    }
  }
  ```
> **Lưu ý:** Lịch sử chat (khi GET history) sẽ chứa Markdown kèm ảnh (VD: `![Image](https...)`) để Frontend hiển thị dễ dàng.

---

## ⚙️ Quy trình xử lý (Logic Flow)

1. **Khởi động:** Khi server chạy, hệ thống tự động tải Vector DB và Embedding Model.
2. **Quản lý tiêu đề:** Sau 2 câu chat đầu tiên, AI sẽ tự động tạo tựa đề phù hợp (tùy cài đặt).
3. **Bộ nhớ:** Hệ thống tự động tóm tắt (Summary) các tin nhắn quá cũ để tiết kiệm dung lượng ngữ cảnh.

---

## ⚠️ Lưu ý về lỗi (Error Handling)
- **400 Bad Request:** Tin nhắn rỗng.
- **404 Not Found:** `session_id` không tồn tại.
- **500 Internal Server Error:** Lỗi kết nối Database hoặc lỗi Logic AI.