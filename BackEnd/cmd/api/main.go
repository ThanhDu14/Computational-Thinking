package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"smart-travel-backend/config"
	"smart-travel-backend/features/auth"
	"smart-travel-backend/features/contact"
<<<<<<< HEAD
=======
	"smart-travel-backend/features/profile"
>>>>>>> 848b307b5f2059651cbc4b70072229e34580bb51
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()

	// 1. Khởi tạo Database
	db := config.InitDatabase()
<<<<<<< HEAD
	log.Println("Đang đồng bộ hóa cấu trúc Database...")
=======
	log.Println("Đã kết nối Database thành công!")
>>>>>>> 848b307b5f2059651cbc4b70072229e34580bb51

	// 2. Khởi tạo Firebase
	authClient := config.InitFirebase()

	// 3. Khởi tạo Router Gin
	router := gin.Default()

	// Cấu hình CORS - Chỉ cho phép Frontend được khai báo gọi API
	frontendURL := config.GetEnv("FRONTEND_URL", "http://localhost:3000")
<<<<<<< HEAD
	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{frontendURL},
		AllowMethods:  []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Authorization"},
=======

	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{frontendURL, "http://localhost:3000"},
		AllowMethods:  []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Authorization", "X-Pinggy-No-Screen", "ngrok-skip-browser-warning"},
>>>>>>> 848b307b5f2059651cbc4b70072229e34580bb51
		ExposeHeaders: []string{"Content-Length"},
		MaxAge:        12 * time.Hour,
	}))

<<<<<<< HEAD
=======
	/*
		// Cấu hình CORS - Bắt buộc phải thêm các Header của Pinggy thì trình duyệt mới cho phép Preflight OPTIONS
		frontendURL := config.GetEnv("FRONTEND_URL", "http://localhost:3000")
		router.Use(cors.New(cors.Config{
			AllowOrigins:  []string{frontendURL, "http://localhost:5173", "http://localhost:3000"},
			AllowMethods:  []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:  []string{"Origin", "Content-Type", "Authorization", "X-Pinggy-No-Screen", "ngrok-skip-browser-warning"},
			ExposeHeaders: []string{"Content-Length"},
			MaxAge:        12 * time.Hour,
		}))
	*/

>>>>>>> 848b307b5f2059651cbc4b70072229e34580bb51
	// 4. Đăng ký Routes
	authGroup := router.Group("/api/auth")
	{
		auth.SetupAuthRoutes(authGroup, authClient, db)
	}

	contactGroup := router.Group("/api/contact")
	{
		contact.SetupContactRoutes(contactGroup)
	}

<<<<<<< HEAD
=======
	profileGroup := router.Group("/api/profile")
	{
		profile.SetupProfileRoutes(profileGroup, authClient, db)
	}

>>>>>>> 848b307b5f2059651cbc4b70072229e34580bb51
	// 5. Khởi tạo Http Server
	port := config.GetEnv("SERVER_PORT", "8080")
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Chạy server trên một luồng lùi (Goroutine)
	go func() {
<<<<<<< HEAD
		log.Printf("Server đang chạy tại: http://localhost:%s", port)
=======
		log.Printf("Server đang chạy tại: http://13.229:155:181:%s", port)
>>>>>>> 848b307b5f2059651cbc4b70072229e34580bb51
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
