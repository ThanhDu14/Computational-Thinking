# Code thu Thập & xử Lý Dữ Liệu Du Lịch (TripAdvisor Scraper & AI Pipeline)

Dùng để tự động hóa giúp thu thập, chắt lọc và làm giàu dữ liệu các địa điểm du lịch từ TripAdvisor. Hệ thống kết hợp sức mạnh của **Selenium**, **BeautifulSoup**, và Trí tuệ nhân tạo **Gemini 2.5 Flash** để tạo ra một bộ dữ liệu đầy đủ.

## ✨ Luồng Hoạt Động (5 Giai Đoạn)

Hệ thống hoạt động tự động qua 5 bước liên hoàn được lập trình sẵn:
1. **Cào dữ liệu thô (Crawl):** Lấy toàn bộ link và thông tin cơ bản của các địa điểm từ TripAdvisor. Hệ thống tự động chuyển đổi các đường link `.com.vn` sang `.com` để đảm bảo dữ liệu thu thập được đồng nhất bằng tiếng Anh. Các địa điểm không có đánh giá sao hoặc không có ảnh gốc từ TripAdvisor sẽ tự động bị loại.
2. **Lọc thông minh (AI Filter):** Nhờ Gemini 2.5 Flash đọc hiểu và chỉ giữ lại những nơi thực sự là "Địa điểm tham quan" (đánh giá 1), tự động loại bỏ các dịch vụ không liên quan như spa, nha khoa, công ty du lịch (đánh giá 0).
3. **Đắp mô tả (3-Layer Description):** Tự động điền các đoạn giới thiệu tiếng Anh còn thiếu qua 3 lớp phòng ngự: `Wikipedia` ➔ `Google Search (AI Overview/Snippet)` ➔ `Hỏi đáp trực tiếp Gemini`. Hệ thống cũng tự động lọc bỏ các mô tả rác (chứa các từ như "read more", "bubbles").
4. **Truy tìm địa chỉ (3-Layer Address Scraper):** Quét và tìm kiếm địa chỉ qua 3 lớp: `OpenStreetMap` ➔ `Google Search` ➔ `Gemini`. Điểm đặc biệt là hệ thống tích hợp sẵn bộ dịch nội bộ để tự động chuẩn hóa các thuật ngữ tiếng Việt sang tiếng Anh (Ví dụ: "Phường" ➔ "Ward", "Thành phố" ➔ "City", "Đường" ➔ "Street").
5. **Lọc và làm sạch cuối cùng:** Xóa bỏ hoàn toàn các địa điểm tàng hình (không có địa chỉ hợp lệ) và tự động dùng Regex gọt sạch các tiền tố rác (như "Address:").

---

## 🛠️ Cài Đặt Môi Trường

**Yêu cầu hệ thống:**
- Python 3.8+ (Ưu tiên 3.11 và 3.12 để tránh lỗi thư viện)
- Trình duyệt Google Chrome phiên bản mới nhất.

**Bước 1: Clone dự án hoặc tải mã nguồn về máy**

**Bước 2: Cài đặt các thư viện cần thiết**
Mở Terminal/Command Prompt tại thư mục chứa code và chạy lệnh sau:
```bash
pip install -r requirements.txt
```
*(Đảm bảo bạn đã có sẵn file `requirements.txt` chứa các thư viện: `undetected-chromedriver`, `selenium`, `beautifulsoup4`, `requests`, `google-generativeai`)*

---

## ⚙️ Hướng Dẫn Cấu Hình (Bắt Buộc)

Trước khi chạy chương trình, bạn cần mở file code Python (ví dụ: `crawl_new_HA.py` hoặc file gộp của bạn) lên và chỉnh sửa các thông số trong phần **CẤU HÌNH HỆ THỐNG**:

### 1. Cấu Hình API Keys
Hệ thống cần 2 loại chìa khóa để hoạt động:
- **`GEMINI_API_KEY` (Bắt buộc):** Dùng để AI nhận diện địa điểm tham quan và bóc tách địa chỉ.
  - *Cách lấy:* Tạo miễn phí tại [Google AI Studio](https://aistudio.google.com/).

### 2. Cấu Hình Địa Điểm Cào (Đổi Tỉnh/Thành)
Nếu bạn muốn thu thập dữ liệu ở một khu vực khác (VD: Đà Lạt, Hà Nội, TP.HCM), hãy thay đổi 2 biến sau:
- **`LIST_PAGE_URL`**: Lên web TripAdvisor, tìm kiếm khu vực bạn muốn cào (chọn mục *Things to Do* -> *LOCATION + Landmarks*),hoặc search Top landmarks Tripvisor + Location để tìm Web phù hợp, copy link hiển thị trên trình duyệt và dán vào biến này.
  - *Ví dụ thu thập Đà Lạt:* `"https://www.tripadvisor.com/Attractions-g293922-Activities-c47-Da_Lat_Lam_Dong_Province.html"`
- **`LOCATION`**: Tên tiếng Anh không dấu của khu vực đó. Biến này giúp API bản đồ và AI định vị chính xác hơn, tránh nhầm lẫn với các tỉnh khác.
  - *Ví dụ:* `"Da Lat"` hoặc `"Ho Chi Minh City"`.

### 3. Cập Nhật Phiên Bản Chrome
- **`VERSION_MAIN`**: Điền các chữ số đầu tiên của phiên bản Google Chrome bạn đang dùng (Ví dụ: `120`, `122`, `146`...). Hệ thống cần thông số này để driver ẩn danh có thể giả lập người thật qua mặt cơ chế chống bot của TripAdvisor.

---

## 🚀 Cách Khởi Chạy

Mở Terminal và chạy file Python chính của dự án:

```bash
python ten_file_code_cua_ban.py
```
## 📂 Dữ Liệu Đầu Ra (Output)

Sau khi hoàn tất, hệ thống sẽ tạo ra các file lưu trữ nội bộ sau:

- `link_{LOCATION}.json`: File lưu trữ danh sách URL đã quét, dùng để khôi phục tiến trình nếu chương trình bị ngắt giữa chừng.
- `data_raw_{LOCATION}.json`: File chứa dữ liệu thô vừa cào xong (chưa qua bộ lọc AI).
- **`data_{LOCATION}_final.json`**: **✨ File Dữ Liệu Hoàn Chỉnh ✨** Chứa danh sách các địa điểm đã được làm sạch, 100% dịch chuẩn tiếng Anh, có địa chỉ thực tế và loại bỏ toàn bộ dữ liệu rác.