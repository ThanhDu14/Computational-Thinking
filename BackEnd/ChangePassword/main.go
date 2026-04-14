package main

import (
	"log"
	"net/http"

	"change-password/config"
	"change-password/handler"
	"change-password/middleware"
	"change-password/model"
	"change-password/repository"
	"change-password/service"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Load config
	cfg := config.Load()

	// Init DB
	db := config.InitDatabase()
	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	// Tự động đồng bộ cấu trúc bảng (An toàn, không mất dữ liệu)
	db.AutoMigrate(&model.User{})

	// Wire up layers
	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, cfg)
	authHandler := handler.NewAuthHandler(authService)

	// Router
	r := gin.Default()

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.JWTAuth(cfg.JWTSecret))
	{
		api.PUT("/users/change-password", authHandler.ChangePassword)
		// TODO: future OTP flow
		// api.POST("/users/request-otp",    authHandler.RequestOTP)
		// api.PUT("/users/change-password-otp", authHandler.ChangePasswordWithOTP)
	}

	log.Printf("Server running on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}