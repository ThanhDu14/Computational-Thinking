# CLAUDE.md — SmartTravel Project Guide

> Tài liệu này giúp Claude Code hiểu rõ dự án **SmartTravel** — Hệ Thống Gợi Ý Tham Quan, để hỗ trợ code chính xác và hiệu quả.

---

## 1. Tổng Quan Dự Án

**SmartTravel** là ứng dụng web du lịch thông minh tích hợp AI Concierge, gợi ý địa điểm cá nhân hóa và quản lý wishlist. Dự án phục vụ cho môn học **Tư Duy Tính Toán** — Học kỳ 2, Năm 2.

### Tính năng chính:
- 🔐 Xác thực người dùng (Firebase Auth + Local Auth qua Go backend)
- 🤖 AI Concierge — Chatbot hỗ trợ gợi ý & lên kế hoạch hành trình
- 📍 Khám phá & tìm kiếm địa điểm tham quan (Hà Nội, Đà Lạt, Thanh Hóa)
- 💡 Gợi ý cá nhân hóa dựa trên sở thích
- ❤️ Wishlist — Lưu địa điểm yêu thích
- 🗺️ Trip Planner — Drag & drop lịch trình
- 🌐 Đa ngôn ngữ (Tiếng Việt / English via i18next)
- 🌙 Dark / Light Mode
- ⭐ Hệ thống đánh giá (Reviews)
- 📝 Blog & Liên hệ

---

## 2. Tech Stack

### Frontend (React + Vite)
| Package | Phiên bản | Mục đích |
|---------|-----------|----------|
| React | ^19.2 | UI Framework |
| Vite | ^8.0 | Build tool & Dev server |
| React Router DOM | ^7.13 | Client-side routing |
| Tailwind CSS | ^4.2 | Utility-first styling |
| Framer Motion | ^12.38 | Animations & transitions |
| Firebase | ^12.11 | Authentication |
| i18next | ^26.0 | Internationalization |
| Lucide React | ^1.7 | Icon library |
| @hello-pangea/dnd | ^18.0 | Drag & drop (Trip Planner) |
| NProgress | ^0.2 | Top loading bar |

### Backend (Go + Gin)
| Package | Mục đích |
|---------|----------|
| Go 1.26 | Ngôn ngữ chính |
| Gin (gin-gonic/gin) | HTTP Web framework |
| GORM + PostgreSQL | ORM & Database |
| Firebase Admin SDK | Xác thực Firebase token |
| golang-jwt/jwt | JWT token cho local auth |
| golang.org/x/crypto | Bcrypt hash password |
| gin-contrib/cors | CORS middleware |
| joho/godotenv | Load biến môi trường .env |

### Database
- **PostgreSQL** — Relational database chính
- Schema file: `Database/schema.sql`

### DevOps
- **Docker** — Multi-stage build (Node builder → Nginx runner)
- **Docker Compose** — Orchestration
- **Nginx** — Serve static files & hỗ trợ React Router (SPA)
- **GitHub Actions** — CI/CD tự động build & push Docker image

---

## 3. Cấu Trúc Thư Mục

```
Computational-Thinking/
├── BackEnd/                      # Go API server
│   ├── cmd/api/main.go           # Entrypoint — khởi tạo Gin, DB, routes
│   ├── config/
│   │   ├── database.go           # Kết nối PostgreSQL qua GORM
│   │   ├── env.go                # Load biến môi trường
│   │   └── firebase.go           # Khởi tạo Firebase Admin SDK
│   ├── features/                 # Feature-based modules
│   │   ├── auth/                 # Authentication (handler, service, model, route)
│   │   └── contact/              # Contact form (handler, service, model, route)
│   ├── middlewares/
│   │   └── auth_middleware.go    # JWT/Firebase token verification
│   ├── utils/
│   │   └── auth_utils.go         # JWT helpers
│   ├── go.mod / go.sum
│   └── .env.example
│
├── FrontEnd/                     # React SPA
│   ├── src/
│   │   ├── App.jsx               # Root routing
│   │   ├── main.jsx              # App entry + providers
│   │   ├── firebase.js           # Firebase client config
│   │   ├── components/
│   │   │   ├── AiConcierge/      # Floating Chat Widget
│   │   │   ├── common/           # Button, GlassCard, Skeleton, ProtectedRoute, TopProgressBar
│   │   │   ├── layout/           # Navbar, Footer, Layout (with Outlet)
│   │   │   ├── places/           # PlaceCard, TripPlanner
│   │   │   ├── recommendation/   # Recommendation components
│   │   │   └── reviews/          # Review system components
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Auth state & Firebase listener
│   │   │   ├── ProfileContext.jsx # User profile data
│   │   │   ├── ThemeContext.jsx   # Dark/Light mode toggle
│   │   │   └── WishlistContext.jsx# Wishlist state management
│   │   ├── services/
│   │   │   ├── api.js             # Axios/fetch base config (VITE_API_BASE_URL)
│   │   │   ├── authService.js     # Auth API calls
│   │   │   ├── contactService.js  # Contact form API
│   │   │   ├── locationService.js # Location/destination API
│   │   │   ├── profileService.js  # User profile API
│   │   │   └── reviewService.js   # Review CRUD API
│   │   ├── pages/
│   │   │   ├── Home/              # Landing page
│   │   │   ├── Destinations/      # Browse destinations
│   │   │   ├── PlaceDetail/       # Single place detail view
│   │   │   ├── Search/            # Search results
│   │   │   ├── Recommendations/   # AI-powered recommendations
│   │   │   ├── AiConcierge/       # Full AI chat page
│   │   │   ├── Wishlist/          # Saved places
│   │   │   ├── Settings/          # User settings & profile
│   │   │   ├── Blog/              # Blog list + BlogDetail
│   │   │   ├── Contact/           # Contact form
│   │   │   └── About/             # About page
│   │   ├── data/                  # Static JSON data (Hà Nội, Đà Lạt, Thanh Hóa)
│   │   ├── hooks/                 # Custom hooks (useTheme)
│   │   ├── i18n/                  # i18next config
│   │   ├── locales/               # Translation files (en/, vi/)
│   │   ├── styles/                # CSS modules/files
│   │   ├── utils/                 # Helper utilities
│   │   ├── UI/                    # AuthPage (Login/Register)
│   │   └── assets/                # Static assets (images, etc.)
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── package.json
│
├── Database/
│   └── schema.sql                # PostgreSQL schema (UUID, Users, Locations, Plans, Reviews...)
│
├── docker-compose.yml
├── .env.docker
└── .github/workflows/            # CI/CD pipeline
```

---

## 4. Kiến Trúc & Patterns

### Backend Architecture (Feature-based)
Mỗi feature trong `BackEnd/features/` theo pattern:
- `model.go` — Struct định nghĩa (GORM model)
- `handler.go` — HTTP handler (nhận request, gọi service, trả response)
- `service.go` — Business logic (tương tác DB, xử lý data)
- `route.go` — Đăng ký routes cho Gin router group

### Frontend Architecture
- **State Management:** React Context API (AuthContext, ThemeContext, WishlistContext, ProfileContext)
- **Routing:** React Router DOM v7 với Layout pattern (Outlet)
- **Public routes:** `/home`, `/destinations`, `/place/:id`, `/search`, `/about`, `/blog`, `/blog/:id`
- **Protected routes (cần đăng nhập):** `/recommendations`, `/contact`, `/ai-concierge`, `/wishlist`, `/settings`
- **Auth routes (không Layout):** `/login`, `/register`
- **API calls:** Tách riêng trong `services/` — KHÔNG hardcode fetch trong component
- **Styling:** Tailwind CSS v4 + CSS files trong `styles/`
- **Animation:** Framer Motion cho transitions & micro-interactions

### Auth Flow (Dual Auth)
1. **Firebase Auth (Cửa 1):** Đăng nhập Google/Email qua Firebase SDK → Firebase UID
2. **Local Auth (Cửa 2):** Đăng ký username/password → hash bcrypt → JWT token
3. Backend middleware xác thực cả Firebase token và JWT token

### Database Schema
Key tables: `Users`, `Locations`, `Categories`, `LocationCategories`, `Plans`, `PlanDay`, `PlanItem`, `Review`, `ImageUpload`, `ImageIdentifiedLocation`, `UserTripRequest`, `PlanTemplate`

---

## 5. Lệnh Thực Thi

```bash
# Khởi động Frontend (dev)
cd FrontEnd && npm run dev
# → http://localhost:5173

# Khởi động Backend (dev)
cd BackEnd && go run cmd/api/main.go
# → http://localhost:8000

# Docker
docker compose --env-file .env.docker up --build -d

# Build Frontend
cd FrontEnd && npm run build

# Lint Frontend
cd FrontEnd && npm run lint
```

---

## 6. Biến Môi Trường

### Frontend (`FrontEnd/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
> ⚠️ Biến `VITE_` được inject lúc build (không phải runtime). Docker cần truyền qua `build-args`.

### Backend (`BackEnd/.env`)
```env
DB_HOST=...
DB_PORT=5432
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
FIREBASE_CREDENTIALS_PATH=...
```

> 🚨 **KHÔNG BAO GIỜ** hardcode API keys hoặc credentials vào source code.

---

## 7. Quy Tắc Khi Viết Code

### General
- Kiểm tra cấu trúc thư mục và hàm/service đã có sẵn TRƯỚC khi viết code mới
- Chỉ sửa đúng phần cần sửa, **KHÔNG** tự ý xóa comments, docstring, hoặc logic đang hoạt động ổn định
- Thêm `log` (backend) hoặc `console.log` (frontend) khi thêm tính năng mới để debug

### Backend (Go + Gin)
- Tuân thủ feature-based architecture: `model.go` → `service.go` → `handler.go` → `route.go`
- Logic nghiệp vụ ĐẶT TRONG `service.go`, handler chỉ parse request và trả response
- Xử lý lỗi bằng `c.JSON()` với HTTP status code rõ ràng
- Sử dụng GORM conventions cho database operations

### Frontend (React + Vite)
- Functional Components + Hooks only (KHÔNG class components)
- API calls phải qua `services/` — KHÔNG fetch trực tiếp trong component
- Styling: Tailwind CSS v4 + custom CSS khi cần
- Animation: Framer Motion
- i18n: Dùng `useTranslation()` hook cho mọi text hiển thị
- UI phải **premium, glassmorphism, responsive** — KHÔNG thiết kế qua loa
- Dark Mode phải được hỗ trợ (ThemeContext)
- Chia nhỏ component tái sử dụng: GlassCard, Skeleton, Button...

### Naming Conventions
- **Go:** PascalCase cho exported, camelCase cho unexported
- **React components:** PascalCase (`HomePage.jsx`, `PlaceCard.jsx`)
- **Services/utils:** camelCase (`authService.js`, `locationService.js`)
- **CSS files:** kebab-case hoặc match component name
- **Routes:** kebab-case (`/ai-concierge`, `/place/:id`)

---

## 8. Database Quick Reference

```sql
-- Core tables
Users (user_id UUID, firebase_uid, email, username, password, name, provider, role, phone_number, avatar_url, preferences JSONB)
Locations (location_id UUID, name, latitude, longitude, duration_minutes, opening_hours_json, address, rating, count_rating, description)
Categories (category_id UUID, category_name, description)
LocationCategories (location_id, category_id) -- Many-to-many
Review (review_id UUID, user_id, location_id, rating, comment, created_at)

-- Planning
Plans (plan_id UUID, user_id, start_date, end_date, generation_source)
PlanDay (plan_day_id UUID, plan_id, day_seq, date)
PlanItem (item_id UUID, day_id, location_id, start_time, end_time, order_index)

-- Others
LocationDistanceMatrix, ImageUpload, ImageIdentifiedLocation, UserTripRequest, PlanTemplate
```

---

## 9. Phân Công & Quy Trình Làm Việc

> ⚠️ **QUAN TRỌNG:** Mình (user) chỉ làm việc bên phía **Frontend**. KHÔNG chỉnh sửa code Backend trừ khi được yêu cầu rõ ràng.

> ⚠️ **QUAN TRỌNG:** Trò Chuyện với mình bằng tiếng Việt.
### Quy trình nhận API từ Backend:
1. **Backend team** sẽ gửi file `.md` mô tả API endpoints (method, URL, request/response format, auth requirements...).
2. Mình đọc file `.md` đó và **viết service tương ứng** trong `FrontEnd/src/services/`.
3. Sau đó tích hợp service vào các component/page cần dùng.

### Khi Claude hỗ trợ:
- **Mặc định chỉ sửa code trong `FrontEnd/`** — không động vào `BackEnd/` hay `Database/`.
- Khi mình gửi file `.md` mô tả API → Claude giúp viết service file trong `FrontEnd/src/services/` theo đúng pattern đã có (xem `api.js`, `authService.js`, `locationService.js` làm mẫu).
- Nếu cần mock data để phát triển UI khi API chưa sẵn sàng → dùng JSON trong `FrontEnd/src/data/` hoặc tạo mock trong service.

---

## 10. Lưu Ý Quan Trọng

1. **Dual Auth System:** Users table hỗ trợ cả Firebase Auth và Local Auth (username/password). Field `provider` phân biệt nguồn đăng nhập.
2. **Static Data fallback:** Dữ liệu địa điểm có bản JSON local trong `FrontEnd/src/data/` (Hà Nội, Đà Lạt, Thanh Hóa) để dùng khi API chưa ready.
3. **SPA Routing:** Nginx config (`nginx.conf`) đã handle `try_files` cho React Router.
4. **i18n:** Mọi text hiển thị cần qua hệ thống translation (`locales/en/`, `locales/vi/`).
5. **Responsive:** Mobile-first, sidebar drawer, đảm bảo hoạt động trên mọi kích thước màn hình.
6. **Scope làm việc:** Chỉ Frontend — Backend là read-only reference để hiểu API contract.
