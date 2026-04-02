# Code thu Thập & xử Lý Dữ Liệu Du Lịch (TripAdvisor Scraper & AI Pipeline)

Dùng để tự động hóa giúp thu thập, chắt lọc và làm giàu dữ liệu các địa điểm du lịch từ TripAdvisor. Hệ thống kết hợp sức mạnh của **Selenium**, **BeautifulSoup**, API bản đồ và Trí tuệ nhân tạo **Gemini 2.5 Flash** để tạo ra một bộ dữ liệu đầy đủ.

## ✨ Luồng Hoạt Động (5 Giai Đoạn)

Hệ thống hoạt động tự động qua 5 bước liên hoàn:
1. **Cào dữ liệu thô (Crawl):** Lấy toàn bộ link và thông tin cơ bản của các địa điểm từ TripAdvisor.
2. **Lọc thông minh (AI Filter):** Nhờ Gemini AI đọc hiểu và chỉ giữ lại những nơi thực sự là "Địa điểm tham quan" (loại bỏ spa, nha khoa, công ty du lịch...).
3. **Đắp mô tả (Wiki Description):** Tự động tìm kiếm và điền các đoạn giới thiệu (description) còn thiếu bằng Wikipedia API.
4. **Truy tìm địa chỉ (4-Layer Address Scraper):** Quét địa chỉ qua 4 lớp bảo vệ để đảm bảo không lọt dữ liệu: 
   `OpenStreetMap` ➔ `Google Maps API` ➔ `Google Search (AI Overviews)` ➔ `Hỏi đáp trực tiếp Gemini`.
5. **Lọc rác cuối cùng:** Xóa bỏ hoàn toàn các địa điểm tàng hình (không thể xác định được địa chỉ).

---

## 🛠️ Cài Đặt Môi Trường

**Yêu cầu hệ thống:**
- Python 3.8+
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
- **`Maps_API_KEY` (Tùy chọn):** Dùng để tra cứu địa chỉ nhanh và chính xác hơn.
  - *Lưu ý:* Nếu bạn chưa có Key này, hãy để trống `""`, hệ thống sẽ tự động dùng OpenStreetMap và Gemini để làm phương án thay thế.

### 2. Cấu Hình Địa Điểm Cào (Đổi Tỉnh/Thành)
Nếu bạn muốn thu thập dữ liệu ở một khu vực khác (VD: Đà Lạt, Hà Nội, TP.HCM), hãy thay đổi 2 biến sau:
- **`LIST_PAGE_URL`**: Lên web TripAdvisor, tìm kiếm khu vực bạn muốn cào (chọn mục *Attractions* hoặc *Things to Do*), copy link hiển thị trên trình duyệt và dán vào biến này.
  - *Ví dụ thu thập Đà Lạt:* `"https://www.tripadvisor.com.vn/Attractions-g293922-Activities-Da_Lat_Lam_Dong_Province.html"`
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

Sau khi hoàn tất, hệ thống sẽ tạo ra các file sau trong cùng thư mục:

- `link_{LOCATION}.json` (đổi tên tùy theo địa điểm cào): File lưu trữ danh sách URL đã quét (giúp resume nếu bị đứt mạng).
- `data_{LOCATION}_raw.json`: File chứa dữ liệu thô chưa qua bộ lọc AI.
- `new_link_{LOCATION}.json`: Danh sách các địa điểm bị thiếu mô tả cần tra Wiki.
- **`data_{LOCATION}_final.json`(đổi tên tùy theo địa điểm cào)**: **✨ File Dữ Liệu Hoàn Chỉnh ✨** Chứa danh sách các địa điểm đã được làm sạch, 100% có địa chỉ thực tế và đã bị loại bỏ toàn bộ dữ liệu rác.