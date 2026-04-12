package main

import (
	"log"
	"smart-travel-backend/config"
	"smart-travel-backend/routes"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()

	// 1. Khởi tạo Database
	db := config.InitDatabase()
	log.Println("Đang đồng bộ hóa cấu trúc Database...")

	// 2. Khởi tạo Firebase
	authClient := config.InitFirebase()

	// 3. Khởi tạo Router Gin
	router := gin.Default()

	// Cấu hình CORS - cho phép Frontend gọi API từ mọi domain
	router.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:    []string{"Origin", "Content-Type", "Authorization", "X-Pinggy-No-Screen"},
		ExposeHeaders:   []string{"Content-Length"},
		MaxAge:          12 * time.Hour,
	}))

	// 4. Đăng ký Routes
	authGroup := router.Group("/api/auth")
	{
		routes.SetupAuthRoutes(authGroup, authClient, db)
	}

	contactGroup := router.Group("/api/contact")
	{
		routes.SetupContactRoutes(contactGroup)
	}

	// 5. Chạy server
	port := config.GetEnv("SERVER_PORT", "8080")
	log.Printf("🚀 Server đang chạy tại: http://localhost:%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Lỗi khi chạy server: %v", err)
	}
}
