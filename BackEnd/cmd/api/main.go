package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"smart-travel-backend/config"
	"smart-travel-backend/features/auth"
	"smart-travel-backend/features/chatbot"
	"smart-travel-backend/features/contact"

	"smart-travel-backend/features/location"
	"smart-travel-backend/features/profile"
	"smart-travel-backend/features/recommend"
	"smart-travel-backend/features/review"
	"smart-travel-backend/features/weather"
	"smart-travel-backend/features/wishlist"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()

	// 1. Khởi tạo Database
	db := config.InitDatabase()
	log.Println("Đã kết nối Database thành công!")

	// 2. Khởi tạo Firebase
	authClient := config.InitFirebase()

	// 3. Khởi tạo Router Gin
	router := gin.Default()

	// Inject DB vào Context để Middleware (VerifyUserToken) có thể dùng
	router.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// Cấu hình CORS - Đóng vai trò bảo vệ hệ thống khi Deploy
	frontendURL := config.GetEnv("FRONTEND_URL", "http://localhost:3000")
	router.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			if gin.Mode() == gin.DebugMode {
				return true
			}
			return origin == frontendURL || origin == "http://localhost:3000"
		},
		AllowMethods:  []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Pinggy-No-Screen", "ngrok-skip-browser-warning"},
		ExposeHeaders: []string{"Content-Length"},
		MaxAge:        12 * time.Hour,
	}))

	// 4. Đăng ký Routes
	authGroup := router.Group("/api/auth")
	{
		auth.SetupAuthRoutes(authGroup, authClient, db)
	}

	contactGroup := router.Group("/api/contact")
	{
		contact.SetupContactRoutes(contactGroup, authClient)
	}

	profileGroup := router.Group("/api/profile")
	{
		profile.SetupProfileRoutes(profileGroup, authClient, db)
	}

	reviewGroup := router.Group("/api/review")
	{
		review.SetupReviewRoutes(reviewGroup, authClient, db)
	}

	wishlistGroup := router.Group("/api/wishlist")
	{
		wishlist.SetupWishlistRoutes(wishlistGroup, authClient, db)
	}

	locationGroup := router.Group("/api/location")
	{
		location.SetupLocationRoutes(locationGroup, db)
	}

	chatbotGroup := router.Group("/api/chatbot")
	{
		chatbot.SetupChatbotRoutes(chatbotGroup, authClient)
	}

	recommendGroup := router.Group("/api/recommend")
	{
		recommend.SetupRecommendRoutes(recommendGroup, authClient)
	}

	weatherGroup := router.Group("/api/weather")
	{
		weather.SetupWeatherRoutes(weatherGroup)
	}

	// 5. Khởi tạo Http Server
	port := config.GetEnv("SERVER_PORT", "8080")
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Chạy server trên một luồng lùi (Goroutine)
	go func() {
		log.Printf("Server đang chạy tại: http://13.229.155.181:%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Lỗi khi chạy server: %v", err)
		}
	}()

	// 6. Graceful Shutdown listener
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit // Block chương trình lại tại đây cho đến khi có tín hiệu tắt

	log.Println("Đang chuẩn bị tắt server...")

	// Tạo Context để cho các request đang dở có thêm 5 giây để hoàn thành
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server tắt bất thường:", err)
	}

	log.Println("Server đã tắt an toàn.")
}
