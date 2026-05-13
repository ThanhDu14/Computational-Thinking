# 🌏 SmartTravel — Hệ Thống Gợi Ý Tham Quan

> Ứng dụng web du lịch thông minh tích hợp AI Concierge, gợi ý địa điểm cá nhân hóa và quản lý wishlist — được xây dựng với React 19, Vite, Firebase và Docker.

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc project](#-cấu-trúc-project)
- [Cài đặt & Chạy locally](#-cài-đặt--chạy-locally)
- [Chạy với Docker](#-chạy-với-docker)
- [Biến môi trường](#-biến-môi-trường)
- [CI/CD](#-cicd)
- [Thành viên nhóm](#-thành-viên-nhóm)

---

## 🎯 Giới thiệu

**SmartTravel** là một nền tảng du lịch thông minh giúp người dùng khám phá, lên kế hoạch và lưu lại các địa điểm tham quan yêu thích. Ứng dụng hỗ trợ đa ngôn ngữ (Tiếng Việt / English), Dark/Light mode và tích hợp chatbot AI hỗ trợ gợi ý hành trình.

---

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 🔐 **Xác thực người dùng** | Đăng ký / Đăng nhập qua Firebase Authentication |
| 🤖 **AI Concierge** | Chatbot AI hỗ trợ gợi ý địa điểm và lên kế hoạch hành trình |
| 📍 **Khám phá địa điểm** | Duyệt, tìm kiếm và xem chi tiết các điểm tham quan |
| 💡 **Gợi ý cá nhân hóa** | Hệ thống gợi ý dựa trên sở thích người dùng |
| ❤️ **Wishlist** | Lưu và quản lý danh sách địa điểm yêu thích |
| 🗺️ **Trip Planner** | Drag & drop lên kế hoạch lịch trình |
| 🌐 **Đa ngôn ngữ** | Hỗ trợ Tiếng Việt và English (i18next) |
| 🌙 **Dark / Light Mode** | Chuyển đổi giao diện theo sở thích |
| ⚙️ **Trang Settings** | Quản lý thông tin cá nhân và tùy chọn |
| 📝 **Blog** | Bài viết và tips du lịch |
| 📬 **Liên hệ** | Form gửi phản hồi đến đội ngũ |

---

## 🛠️ Công nghệ sử dụng

### Frontend
| Package | Phiên bản | Mục đích |
|---------|-----------|----------|
| React | ^19.2 | UI Framework |
| Vite | ^8.0 | Build tool & Dev server |
| React Router DOM | ^7.13 | Client-side routing |
| Tailwind CSS | ^4.2 | Utility-first styling |
| Framer Motion | ^12.38 | Animations & transitions |
| Firebase | ^12.11 | Authentication & backend |
| i18next | ^26.0 | Internationalization |
| Lucide React | ^1.7 | Icon library |
| @hello-pangea/dnd | ^18.0 | Drag & drop (Trip Planner) |
| NProgress | ^0.2 | Top loading bar |

### DevOps & Infrastructure
- **Docker** — Multi-stage build (Node builder → Nginx runner)
- **Docker Compose** — Orchestration container
- **Nginx** — Serve static files & hỗ trợ React Router
- **GitHub Actions** — CI/CD tự động build & push image

---

## 📁 Cấu trúc project

```
Computational-Thinking/
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml   # CI/CD pipeline
├── FrontEnd/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AiConcierge/      # Floating Chat Widget
│   │   │   ├── common/           # Button, GlassCard, Skeleton, ...
│   │   │   ├── layout/           # Navbar, Footer, Layout
│   │   │   └── places/           # PlaceCard, TripPlanner
│   │   ├── context/              # AuthContext, ThemeContext, WishlistContext
│   │   ├── data/                 # JSON dữ liệu địa điểm (Hà Nội, Đà Lạt, Thanh Hóa)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── i18n/                 # Cấu hình i18next
│   │   ├── locales/
│   │   │   ├── en/               # English translations
│   │   │   └── vi/               # Vietnamese translations
│   │   ├── pages/
│   │   │   ├── About/
│   │   │   ├── AiConcierge/
│   │   │   ├── Blog/
│   │   │   ├── Contact/
│   │   │   ├── Destinations/
│   │   │   ├── Home/
│   │   │   ├── PlaceDetail/
│   │   │   ├── Recommendations/
│   │   │   ├── Search/
│   │   │   ├── Settings/
│   │   │   └── Wishlist/
│   │   ├── services/             # authService, contactService
│   │   ├── UI/                   # AuthPage
│   │   └── firebase.js           # Firebase config
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
└── .env.docker                   # Biến môi trường cho Docker
```

---

## 🚀 Cài đặt & Chạy locally

### Yêu cầu
- Node.js >= 18
- npm >= 9

### Các bước

```bash
# 1. Clone repository
git clone https://github.com/ThanhDu14/Computational-Thinking.git
cd Computational-Thinking

# 2. Vào thư mục FrontEnd
cd FrontEnd

# 3. Cài dependencies
npm install

# 4. Tạo file .env (xem mục Biến môi trường bên dưới)
cp .env.example .env
# → Điền các giá trị Firebase vào .env

# 5. Chạy dev server
npm run dev
```

Truy cập tại: **http://localhost:5173**

---

## 🐳 Chạy với Docker

### Yêu cầu
- Docker & Docker Compose đã được cài đặt

### Các bước

```bash
# 1. Tạo file .env.docker ở root project
# (Xem mục Biến môi trường bên dưới)

# 2. Build & run container
docker compose --env-file .env.docker up --build -d

# 3. Truy cập
# http://localhost:5173
```

```bash
# Dừng container
docker compose down

# Xem logs
docker compose logs -f frontend
```

---

## 🔑 Biến môi trường

Tạo file `.env` (cho dev local) hoặc `.env.docker` (cho Docker) với nội dung sau:

```env
VITE_API_BASE_URL=http://localhost:8000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Lưu ý**: Biến `VITE_` được Vite nhúng vào bundle **lúc build**, không phải lúc runtime. Khi dùng Docker, các biến này phải được truyền qua `build-args`.

---

## ⚙️ CI/CD

Pipeline GitHub Actions tự động kích hoạt khi có commit lên nhánh `main` với thay đổi trong `FrontEnd/`.

**Luồng hoạt động:**
```
Push to main (FrontEnd/**)
    ↓
Login DockerHub
    ↓
Build multi-stage Docker image
    ↓
Push image với 2 tags:
  - :latest
  - :<commit-sha>  (để dễ rollback)
```

### GitHub Secrets cần thiết

| Secret | Mô tả |
|--------|-------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `VITE_API_BASE_URL` | URL của Backend API |
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |

---

## 👥 Thành viên nhóm

| Tên | GitHub | Vai trò |
|-----|--------|---------|
| Thanh Du | [@ThanhDu14](https://github.com/ThanhDu14) | Frontend Developer |
| *(Em Du)* | — | Frontend Developer |

---

## 📄 License

Dự án này được thực hiện cho môn học **Tư Duy Tính Toán** — Học kỳ 2, Năm 2.