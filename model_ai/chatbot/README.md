Markdown
# 🌊 Nha Trang Travel Chatbot API Documentation

Hệ thống cung cấp API cho Chatbot tư vấn du lịch Nha Trang, tích hợp công nghệ RAG và quản lý hội thoại thông minh.

---

## 🌐 Thông tin kết nối (Dành cho Frontend)

- **Base URL:** `http://<IP_CUA_SERVER>:8000`
- **Tài liệu Swagger (Interactive):** `http://<IP_CUA_SERVER>:8000/docs`

> **Lưu ý khi triển khai trên Server:** 
> Để server chấp nhận kết nối từ bên ngoài, phải chạy lệnh:
> `uvicorn main:app --host 0.0.0.0 --port 8000`

---

## 🛠 Danh sách API chi tiết

### 1. Tạo đoạn chat mới (New Chat)
Khởi tạo một phiên làm việc mới để bắt đầu lưu trữ lịch sử.
- **Endpoint:** `POST /chat/new`
- **Body (JSON):** 
  ```json
  { "user_id": "id_nguoi_dung" }
  
Phản hồi: Trả về session_id. Frontend cần lưu ID này vào LocalStorage hoặc State để dùng cho các bước sau.

💬 2. Gửi tin nhắn (Chat)
Gửi câu hỏi và nhận phản hồi từ AI.

Endpoint: POST /chat

Body (JSON):

JSON
{
  "message": "Nha Trang có món gì ngon?",
  "user_id": "id_nguoi_dung",
  "session_id": "uuid-vừa-lấy-ở-bước-1"
}
Phản hồi:

JSON
{
  "session_id": "uuid",
  "reply": "Nội dung câu trả lời từ AI..."
}


### 📜 3. Lấy lịch sử chat (History)
Hiển thị lại nội dung tin nhắn cũ khi người dùng click vào một cuộc hội thoại.
- **Endpoint:** `GET /chat/{session_id}/history`
- **Phản hồi:** Danh sách các object chứa `role` (user/assistant) và `content`.

### 🗂 4. Danh sách các phiên (Sidebar)
Lấy danh sách các cuộc hội thoại cũ để hiển thị ở thanh bên (Sidebar).
- **Endpoint:** `GET /sessions/{user_id}`
- **Phản hồi:** Trả về danh sách các session bao gồm `id`, `title` (AI tự đặt tên), và thời gian tạo.

### 🗑 5. Xóa hội thoại (Delete Session)
Xóa vĩnh viễn một cuộc hội thoại.
- **Endpoint:** `DELETE /chat/{session_id}`
- **Phản hồi:** `{ "status": "success", "message": "..." }`

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