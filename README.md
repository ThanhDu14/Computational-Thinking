# 🗺️ SmartTravel - Hệ Thống Gợi Ý Tham Quan & Lên Kế Hoạch Du Lịch Thông Minh

<p align="center">
  <strong>SmartTravel</strong> là một ứng dụng web cao cấp hỗ trợ khách du lịch khám phá điểm đến, xem dự báo thời tiết thời gian thực, trò chuyện cùng trợ lý AI cá nhân hóa và tự tay lên lịch trình chi tiết bằng phương pháp kéo thả trực quan. Dự án được phát triển nhằm tối ưu hóa trải nghiệm lên kế hoạch du lịch cho người dùng hiện đại.
</p>

---

## ✨ Tính Năng Nổi Bật (Key Features)

- **🎨 Giao Diện Premium (Dark Glassmorphism):** Trải nghiệm thị giác hiện đại, bóng bẩy với hiệu ứng mờ kính (backdrop-blur) tinh tế, chuyển động mượt mà bằng Framer Motion và hỗ trợ chuyển đổi Dark/Light mode linh hoạt.
- **📅 Lên Kế Hoạch Du Lịch Kéo Thả (AI Trip Planner):** Cho phép người dùng tự do sắp xếp, kéo thả thứ tự các địa điểm tham quan giữa các ngày bằng thư viện `@hello-pangea/dnd` vô cùng trực quan.
- **🤖 Trợ Lý Trò Chuyện AI (AI Concierge):** Tích hợp trợ lý chatbot thông minh hỗ trợ giải đáp thắc mắc, gợi ý quán ăn, khách sạn và các địa điểm vui chơi phù hợp với sở thích cá nhân.
- **⚡ Tìm Kiếm & Bộ Lọc Tỉnh Thành Thông Minh:**
  - Lọc địa điểm theo Tỉnh/Thành phố và Danh mục (Ẩm thực, Văn hóa, Giải trí, Bãi biển...).
  - Tìm kiếm nhanh với tính năng **Searchable Dropdown không dấu** (gõ *"ca"* hay *"cà"* đều ra *"Cà Mau"*).
- **🎬 Chế Độ Lướt Địa Điểm Nhập Vai (Immersive Carousel Mode):** Trải nghiệm xem thông tin và hình ảnh địa điểm toàn màn hình độc đáo lấy cảm hứng từ định dạng video ngắn (Tiktok).
- **⛅ Thời Tiết Thời Gian Thực (Real-time Weather):** Tích hợp API thời tiết cập nhật liên tục thông tin nhiệt độ, độ ẩm tại các điểm đến.
- **❤️ Bộ Sưu Tập Yêu Thích (Wishlist Drawer & Page):** Lưu trữ nhanh các điểm đến yêu thích vào ngăn kéo (Drawer) tiện lợi hoặc quản lý trực quan trên trang Wishlist toàn màn hình.
- **🌍 Đa Ngôn Ngữ & Bảo Mật:** Hỗ trợ song ngữ Anh - Việt (i18next) và hệ thống xác thực tài khoản an toàn thông qua Firebase Authentication.

---

## 💻 Công Nghệ Sử Dụng (Tech Stack)

### Front-End (Client)
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 + Framer Motion (chuyển động)
- **State Management & Router:** React Context API + React Router DOM v7
- **Drag-and-Drop:** `@hello-pangea/dnd`
- **Internationalization:** i18next + react-i18next
- **Authentication:** Firebase Client SDK
- **Icons:** Lucide React + Custom Inline SVG

### Back-End (Server)
- **Language:** Golang (Go 1.26.1)
- **Web Framework:** Gin Gonic
- **ORM:** GORM (hỗ trợ driver PostgreSQL & MySQL)
- **Security:** Firebase Admin SDK + JWT (JSON Web Token)
- **CORS & Middlewares:** Gin contrib CORS + Custom Middlewares

---

## 📂 Cấu Trúc Thư Mục Chi Tiết (Project Structure)

```text
Computational-Thinking/
│
├── FrontEnd/                              # 🖥️ Source code React (Vite + TailwindCSS v4)
│   ├── index.html                         # File entry HTML chính
│   ├── vite.config.js                     # Cấu hình Vite & plugin
│   └── src/
│       ├── main.jsx                       # Entry point – khởi tạo React DOM
│       ├── App.jsx                        # Router config chính (React Router v7)
│       ├── App.css                        # CSS riêng cho App component
│       ├── index.css                      # CSS toàn cục, khai báo @theme Tailwind
│       ├── firebase.js                    # Khởi tạo Firebase Client SDK
│       │
│       ├── components/                    # 🧩 Các component tái sử dụng
│       │   ├── AiConcierge/              #    Module trợ lý AI chatbot
│       │   │   ├── ChatCards.css          #    CSS riêng cho chat cards
│       │   │   ├── ChatRenderer.jsx       #    Render tin nhắn (text, card, carousel)
│       │   │   └── FloatingChatWidget.jsx #    Widget chat nổi góc màn hình
│       │   │
│       │   ├── common/                   #    Component dùng chung
│       │   │   ├── Button.jsx            #    Nút bấm chuẩn hóa
│       │   │   ├── ConfirmModal.jsx      #    Modal xác nhận hành động
│       │   │   ├── CustomSelect.jsx      #    Dropdown searchable (tìm kiếm tỉnh thành)
│       │   │   ├── GlassCard.jsx         #    Thẻ kính mờ Glassmorphism
│       │   │   ├── ProtectedRoute.jsx    #    Route bảo vệ yêu cầu đăng nhập
│       │   │   ├── SectionHeader.jsx     #    Tiêu đề section chuẩn hóa
│       │   │   ├── Skeleton.jsx          #    Loading skeleton placeholder
│       │   │   ├── SweetModal.jsx        #    Modal thông báo đẹp mắt
│       │   │   ├── TopProgressBar.jsx    #    Thanh tiến trình đầu trang
│       │   │   └── WishlistDrawer.jsx    #    Ngăn kéo yêu thích trượt bên phải
│       │   │
│       │   ├── layout/                   #    Bố cục chung
│       │   │   ├── Footer.jsx            #    Chân trang
│       │   │   ├── Layout.jsx            #    Layout wrapper (Navbar + Footer)
│       │   │   └── Navbar.jsx            #    Thanh điều hướng chính + hamburger menu
│       │   │
│       │   ├── places/                   #    Component liên quan địa điểm
│       │   │   ├── ItineraryDetailModal.jsx  # Modal chi tiết lịch trình
│       │   │   ├── PlaceCard.jsx         #    Thẻ hiển thị địa điểm
│       │   │   ├── TripPlanner.jsx       #    Trình lên kế hoạch kéo thả
│       │   │   └── WeatherWidget.jsx     #    Widget thời tiết thời gian thực
│       │   │
│       │   ├── recommendation/           #    Module gợi ý
│       │   │   └── RecommendationList.jsx #   Danh sách địa điểm gợi ý
│       │   │
│       │   └── reviews/                  #    Module đánh giá
│       │       ├── ReviewCard.jsx        #    Thẻ hiển thị bài đánh giá
│       │       └── ReviewForm.jsx        #    Form viết/chỉnh sửa đánh giá
│       │
│       ├── context/                       # 🔄 React Context (State Management)
│       │   ├── AuthContext.jsx            #    Quản lý xác thực người dùng
│       │   ├── ChatContext.jsx            #    Quản lý trạng thái chat AI
│       │   ├── ProfileContext.jsx         #    Quản lý hồ sơ cá nhân
│       │   ├── ThemeContext.jsx           #    Quản lý Dark/Light mode
│       │   └── WishlistContext.jsx        #    Quản lý danh sách yêu thích
│       │
│       ├── data/                          # 📊 Dữ liệu tĩnh
│       │   ├── vietnamProvinces.js        #    Danh sách 63 tỉnh thành Việt Nam
│       │   ├── data_HA_final.json         #    Dữ liệu địa điểm Hội An
│       │   ├── data_da_lat_final.json     #    Dữ liệu địa điểm Đà Lạt
│       │   └── data_thanh_hoa_final.json  #    Dữ liệu địa điểm Thanh Hóa
│       │
│       ├── hooks/                         # 🪝 Custom React Hooks
│       │   └── useTheme.js               #    Hook quản lý theme
│       │
│       ├── i18n/                          # 🌐 Cấu hình đa ngôn ngữ
│       │   └── i18n.js                   #    Khởi tạo i18next
│       │
│       ├── locales/                       # 🗣️ File ngôn ngữ JSON
│       │   ├── en/
│       │   │   └── translation.json      #    Bản dịch tiếng Anh
│       │   └── vi/
│       │       └── translation.json      #    Bản dịch tiếng Việt
│       │
│       ├── pages/                         # 📄 Các trang chính của ứng dụng
│       │   ├── About/
│       │   │   └── AboutPage.jsx         #    Trang giới thiệu đội ngũ
│       │   ├── AiConcierge/
│       │   │   └── AiConciergePage.jsx   #    Trang chat AI toàn màn hình
│       │   ├── Blog/
│       │   │   ├── BlogPage.jsx          #    Trang danh sách bài viết
│       │   │   └── BlogDetailPage.jsx    #    Trang chi tiết bài viết
│       │   ├── Contact/
│       │   │   └── ContactPage.jsx       #    Trang liên hệ
│       │   ├── Destinations/
│       │   │   └── DestinationsPage.jsx  #    Trang khám phá điểm đến
│       │   ├── Home/
│       │   │   └── HomePage.jsx          #    Trang chủ (Hero + CTA)
│       │   ├── MyItineraries/
│       │   │   └── MyItinerariesPage.jsx #    Trang quản lý lịch trình
│       │   ├── PlaceDetail/
│       │   │   └── PlaceDetailPage.jsx   #    Trang chi tiết địa điểm
│       │   ├── Recommendations/
│       │   │   └── RecommendationsPage.jsx # Trang gợi ý theo AI
│       │   ├── Search/
│       │   │   └── SearchPage.jsx        #    Trang tìm kiếm toàn hệ thống
│       │   ├── Settings/
│       │   │   └── SettingsPage.jsx      #    Trang cài đặt tài khoản
│       │   └── Wishlist/
│       │       └── WishlistPage.jsx      #    Trang yêu thích toàn màn hình
│       │
│       ├── services/                      # 🔌 Kết nối API (Axios)
│       │   ├── api.js                    #    Axios instance cấu hình base URL
│       │   ├── authService.js            #    API xác thực (đăng ký, đăng nhập)
│       │   ├── chatService.js            #    API trò chuyện AI
│       │   ├── contactService.js         #    API gửi form liên hệ
│       │   ├── locationService.js        #    API CRUD địa điểm
│       │   ├── profileService.js         #    API hồ sơ người dùng
│       │   ├── recommendationService.js  #    API gợi ý địa điểm (AI)
│       │   ├── reviewService.js          #    API đánh giá & bình luận
│       │   ├── weatherService.js         #    API thời tiết thời gian thực
│       │   └── wishlistService.js        #    API danh sách yêu thích
│       │
│       ├── styles/                        # 🎨 CSS bổ sung
│       │   └── variables.css             #    Biến CSS tùy chỉnh
│       │
│       ├── utils/                         # 🛠️ Hàm tiện ích
│       │   └── helpers.js                #    Các hàm helper dùng chung
│       │
│       ├── UI/                            # 🔐 Trang xác thực
│       │   └── AuthPage.jsx              #    Đăng nhập / Đăng ký (Firebase Auth)
│       │
│       └── assets/                        # 🖼️ Tài nguyên tĩnh
│           ├── hero.png                  #    Ảnh hero banner
│           ├── react.svg                 #    Logo React
│           ├── vite.svg                  #    Logo Vite
│           ├── icons/                    #    Thư mục icon tùy chỉnh
│           └── images/                   #    Thư mục hình ảnh
│
├── BackEnd/                               # ⚙️ Source code Backend (Golang + Gin)
│   ├── .env.example                       # File cấu hình môi trường mẫu
│   ├── go.mod                             # Go module dependencies
│   ├── go.sum                             # Go checksum file
│   │
│   ├── cmd/                               # 🚀 Điểm khởi chạy ứng dụng
│   │   └── api/
│   │       └── main.go                   #    Entry point server Gin
│   │
│   ├── config/                            # ⚙️ Cấu hình hệ thống
│   │   ├── database.go                   #    Kết nối PostgreSQL/MySQL (GORM)
│   │   ├── env.go                        #    Đọc biến môi trường
│   │   └── firebase.go                   #    Khởi tạo Firebase Admin SDK
│   │
│   ├── features/                          # 📦 Các module API (Clean Architecture)
│   │   ├── auth/                         #    Xác thực & phân quyền
│   │   │   ├── handler.go                #    HTTP handler
│   │   │   ├── model.go                  #    Struct dữ liệu
│   │   │   ├── route.go                  #    Đăng ký route
│   │   │   └── service.go               #    Business logic
│   │   │
│   │   ├── chatbot/                      #    Proxy API chatbot AI
│   │   │   ├── handler.go
│   │   │   └── route.go
│   │   │
│   │   ├── contact/                      #    Gửi form liên hệ
│   │   │   ├── handler.go
│   │   │   ├── model.go
│   │   │   ├── route.go
│   │   │   └── service.go
│   │   │
│   │   ├── location/                     #    CRUD địa điểm du lịch
│   │   │   ├── handler.go
│   │   │   ├── model.go
│   │   │   ├── route.go
│   │   │   └── service.go
│   │   │
│   │   ├── profile/                      #    Quản lý hồ sơ người dùng
│   │   │   ├── handler.go
│   │   │   ├── model.go
│   │   │   ├── route.go
│   │   │   └── service.go
│   │   │
│   │   ├── review/                       #    Đánh giá & bình luận
│   │   │   ├── handler.go
│   │   │   ├── model.go
│   │   │   ├── route.go
│   │   │   └── service.go
│   │   │
│   │   ├── weather/                      #    API proxy thời tiết
│   │   │   (trống – đang phát triển)
│   │   │
│   │   └── wishlist/                     #    Quản lý yêu thích
│   │       ├── handler.go
│   │       ├── model.go
│   │       ├── route.go
│   │       └── service.go
│   │
│   ├── middlewares/                       # 🛡️ Middleware
│   │   └── auth_middleware.go            #    Xác thực JWT/Firebase token
│   │
│   └── utils/                             # 🛠️ Hàm tiện ích Backend
│       ├── auth_utils.go                 #    Hàm hỗ trợ xác thực
│       ├── file_upload.go                #    Upload file (ảnh đại diện)
│       └── response.go                   #    Chuẩn hóa JSON response
│
├── Database/                              # 🗄️ Database Scripts & Schema
│   └── schema.sql                        #    SQL tạo bảng & seed data
│
├── model_ai/                              # 🤖 Module AI / Machine Learning
│   ├── server.py                          # FastAPI server tổng hợp các model
│   ├── README.md                          # Tài liệu hướng dẫn module AI
│   │
│   ├── chatbot/                           #    🧠 Chatbot RAG (Retrieval-Augmented Generation)
│   │   ├── __init__.py
│   │   ├── main.py                       #    Entry point chatbot
│   │   ├── build_vector_db.py            #    Xây dựng vector database (FAISS)
│   │   ├── requirements.txt              #    Python dependencies
│   │   ├── README.md                     #    Tài liệu chatbot
│   │   ├── test_api.py                   #    Script kiểm thử API
│   │   ├── data/                         #    Dữ liệu huấn luyện
│   │   ├── embeddings/                   #    Vector embeddings đã tạo
│   │   ├── src/                          #    Source code xử lý chatbot
│   │   └── utils/                        #    Hàm tiện ích
│   │
│   ├── landmark_recognizer/               #    📸 Nhận diện địa danh qua hình ảnh
│   │   ├── README.md                     #    Tài liệu nhận diện
│   │   ├── requirements.txt              #    Python dependencies
│   │   ├── test.py                       #    Script kiểm thử
│   │   ├── hash_locations.csv            #    Dữ liệu hash vị trí
│   │   ├── api/                          #    API endpoint
│   │   ├── models/                       #    Model weights
│   │   └── utils/                        #    Hàm tiện ích
│   │
│   └── recommend/                         #    🎯 Hệ thống gợi ý địa điểm
│       ├── readme.md                     #    Tài liệu hệ thống gợi ý
│       ├── requirements.txt              #    Python dependencies
│       ├── api/                          #    API endpoint
│       ├── src/                          #    Source code thuật toán gợi ý
│       └── utils/                        #    Hàm tiện ích
│
├── docs/                                  # 📚 Tài liệu dự án
│   ├── README.md                         #    Tổng quan tài liệu
│   ├── AI-FrontEnd.md                    #    Tích hợp AI ↔ Front-End
│   ├── API_INTEGRATION_README.md         #    Hướng dẫn tích hợp API
│   ├── CHATBOT_API.md                    #    Tài liệu API Chatbot
│   ├── FRONTEND_SEARCH_DOC.md            #    Tài liệu tìm kiếm Front-End
│   ├── FrontEnd.md                       #    Tài liệu Front-End
│   ├── README_Chatbot_Image.md           #    Tài liệu nhận diện ảnh chatbot
│   ├── usecase_diagram.md                #    Sơ đồ Use Case
│   ├── user_flow_usecase.md              #    User Flow & Use Case chi tiết
│   ├── weather_api.md                    #    Tài liệu API thời tiết
│   └── BC_DoAn_Nhom.pdf                  #    Báo cáo đồ án nhóm (PDF)
│
├── .env.docker                            # Biến môi trường cho Docker
├── .gitignore                             # Git ignore rules
└── docker-compose.yml                     # Docker Compose config
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org/) (Phiên bản v18 trở lên)
- [Golang](https://go.dev/) (Phiên bản 1.22 trở lên)
- [PostgreSQL](https://www.postgresql.org/) hoặc [MySQL](https://www.mysql.com/)

---

### Khởi Chạy Backend (Go Server)
1. Di chuyển vào thư mục `BackEnd`:
   ```bash
   cd BackEnd
   ```
2. Tạo file cấu hình môi trường `.env` từ file ví dụ:
   ```bash
   cp .env.example .env
   ```
   *Cấu hình các thông tin kết nối Database và Firebase Credentials bên trong file `.env`.*

3. Tải các dependencies và khởi chạy server:
   ```bash
   go mod tidy
   go run cmd/main.go
   ```
   *Backend mặc định sẽ khởi chạy tại cổng `8080` (hoặc cổng cấu hình trong `.env`).*

---

### Khởi Chạy Frontend (React + Vite)
1. Di chuyển vào thư mục `FrontEnd`:
   ```bash
   cd ../FrontEnd
   ```
2. Cài đặt các package cần thiết:
   ```bash
   npm install
   ```
3. Khởi chạy môi trường phát triển (Development Server):
   ```bash
   npm run dev
   ```
   *Ứng dụng client sẽ chạy tại địa chỉ mặc định [http://localhost:5173](http://localhost:5173).*

---

### Chạy Với Docker (Dành Cho Client)
Nếu bạn muốn đóng gói và chạy Client nhanh chóng bằng Docker:
```bash
# Sử dụng file .env.docker để truyền biến môi trường vào container
docker compose --env-file .env.docker up --build
```
Ứng dụng sẽ tự động được build và phục vụ tại địa chỉ [http://localhost:5173](http://localhost:5173).

---

## 👥 Đội Ngũ Phát Triển (Development Team)

Dự án được xây dựng và hoàn thiện bởi nhóm sinh viên **Trường Đại Học Khoa Học Tự Nhiên - Đại Học Quốc Gia Thành Phố Hồ Chí Minh**:

- **Nguyễn Quốc Đạt** - *Trưởng Nhóm - Kỹ Sư AI / Team Leader - AI Engineer*
- **Nguyễn Thành Dự** - *Lập Trình Viên Front-End / Front-End Developer* ([GitHub](https://github.com/ThanhDu14))
- **Nguyễn Đức Duy** - *Lập Trình Viên Back-End / Back-End Developer*
- **Mai Văn Hiển** - *Lập Trình Viên Front-End / Front-End Developer*
- **Lê Quốc Hưng** - *Lập Trình Viên Back-End / Back-End Developer*
- **Nguyễn Thế Anh** - *Nhà Khoa Học Dữ Liệu / Data Scientist*
- **Nguyễn Đại Hiếu** - *Quản Lý Sản Phẩm / Product Manager*
- **Trần Văn Nguyên** - *Đảm Bảo Chất Lượng / AI Engineer*

*Cùng sự đóng góp nhiệt tình từ tất cả các thành viên trong đội ngũ phát triển.*

---

## 📄 License & Contribution

Dự án được phát triển dưới giấy phép mã nguồn mở. Mọi đóng góp (Pull Request, Bug Report) đều được hoan nghênh nhằm nâng cấp hệ thống ngày càng tối ưu và hữu ích hơn cho cộng đồng du lịch.

---
<p align="center">
  Made with ❤️ by Student Team at VNUHCM-US
</p>
