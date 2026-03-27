# TripAdvisor Data Filter Tool

Công cụ này được viết bằng Go (Golang) nhằm tự động hóa việc lọc và làm sạch dữ liệu POI (Point of Interest) cào từ TripAdvisor. Tool kết hợp logic code thuần và sức mạnh của LLM (Gemini 2.5 Flash) để xử lý dữ liệu nhiễu.

## 🌟 Tính năng nổi bật

1. **Lọc sơ bộ (Pre-filter):** Tự động loại bỏ các "địa điểm ma" (không có bài review) và các địa điểm thiếu Rating (đánh giá "N/A").
2. **Lọc hình ảnh (Image Clean-up):** Xóa bỏ các ảnh rác, ảnh mặc định của hệ thống, chỉ giữ lại ảnh chất lượng cao (kích thước 700x400).
3. **Phân loại bằng AI (AI Classification):** Gom nhóm dữ liệu và gửi qua Google Gemini API để phân tích ngữ nghĩa. Giữ lại đúng các điểm tham quan thực thụ (di tích, bảo tàng, đền chùa...), loại bỏ chính xác các trường học, bệnh viện, nha khoa, spa... bị gán nhầm tag.

## ⚙️ Yêu cầu hệ thống

- Môi trường: Máy tính đã cài đặt [Go](https://go.dev/).
- File dữ liệu thô `data.json` cào từ TripAdvisor đặt ở thư mục gốc.
- API Key miễn phí từ [Google AI Studio](https://aistudio.google.com/).

## 🚀 Hướng dẫn sử dụng

**Bước 1:** Clone repository này về máy.

**Bước 2:** Mở file code (`filter.go` hoặc `main.go`), tìm đến dòng hằng số và dán API Key của bạn vào:
`const GEMINI_API_KEY = "ĐIỀN_API_KEY_CỦA_BẠN_VÀO_ĐÂY"`

**Bước 3:** Mở Terminal tại thư mục chứa code và chạy lệnh:
`go run filter.go`
_(Hoặc build ra file chạy bằng lệnh: `go build -o filter_tool filter.go`)_

**Bước 4:** Nhận kết quả.
Sau khi chạy xong, hệ thống sẽ tự động đối chiếu và xuất ra file `final_attractions.json` chứa 100% dữ liệu đã được làm sạch hoàn hảo kèm đầy đủ thông tin gốc (images, reviews...).
