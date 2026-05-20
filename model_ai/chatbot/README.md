Markdown
# 🌊 Nha Trang Travel Chatbot API Documentation

Hệ thống cung cấp API cho Chatbot tư vấn du lịch Nha Trang, tích hợp công nghệ RAG và quản lý hội thoại thông minh.

---

## 🌐 Thông tin kết nối (Dành cho Frontend)

- **Base URL:** `http://<IP_CUA_SERVER>:8000`
- **Tài liệu Swagger (Interactive):** `http://<IP_CUA_SERVER>:8000/docs`

> **Lưu ý khi triển khai trên Server:** 
> Để server chấp nhận kết nối từ bên ngoài (nhưng an toàn qua Go BackEnd), phải chạy lệnh:
> `uvicorn main:app --host 127.0.0.1 --port 8000`

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
  curl -X POST "http://localhost:8000/chat/new" \
       -H "Content-Type: application/json" \
       -H "X-Internal-Secret: super_secret_key_123" \
       -d '{"user_id": "Test_User"}'
  ```
- **Phản hồi:** 
  ```json
  {
    "status": "success",
    "session_id": "4ed2b013-a771-42e6-9b49-5b66a1aa93d7",
    "title": "Cuộc hội thoại mới"
  }
  ```
> Frontend cần lưu `session_id` này để dùng cho các bước chat tiếp theo.

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
  curl -X POST "http://localhost:8000/chat" \
       -H "Content-Type: application/json" \
       -H "X-Internal-Secret: super_secret_key_123" \
       -d '{"message": "Nha Trang có món gì ngon?", "user_id": "Test_User", "session_id": "4ed2b013-a771-42e6-9b49-5b66a1aa93d7"}'
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
  curl -X GET "http://localhost:8000/chat/Test_User/4ed2b013-a771-42e6-9b49-5b66a1aa93d7/history" \
       -H "X-Internal-Secret: super_secret_key_123"
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
  curl -X GET "http://localhost:8000/sessions/Test_User" \
       -H "X-Internal-Secret: super_secret_key_123"
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
  curl -X DELETE "http://localhost:8000/chat/Test_User/4ed2b013-a771-42e6-9b49-5b66a1aa93d7" \
       -H "X-Internal-Secret: super_secret_key_123"
  ```
- **Phản hồi:** 
  ```json
  {
    "status": "success", 
    "message": "Đã xóa hội thoại 4ed2b013-a771-42e6-9b49-5b66a1aa93d7" 
  }
  ```

---

## ⚙️ Quy trình xử lý (Logic Flow)

1. **Khởi động:** Khi server chạy, hệ thống tự động tải Vector DB và Embedding Model (Mất khoảng 10-30s).
2. **Quản lý tiêu đề:** Sau 2 câu chat đầu tiên, AI sẽ tự động thay đổi `title` của session từ "Cuộc hội thoại mới" sang tiêu đề phù hợp với nội dung hỏi (Ví dụ: "Ẩm thực Nha Trang").
3. **Bộ nhớ:** Hệ thống tự động tóm tắt (Summary) các tin nhắn quá cũ để tiết kiệm dung lượng nhưng vẫn giữ được ngữ cảnh cho AI.

---

## ⚠️ Lưu ý về lỗi (Error Handling)
- **400 Bad Request:** Tin nhắn rỗng.
- **404 Not Found:** `session_id` không tồn tại.
- **500 Internal Server Error:** Lỗi kết nối Database hoặc lỗi Logic AI (Kiểm tra lo