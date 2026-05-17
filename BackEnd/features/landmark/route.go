package landmark

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

// SetupLandmarkRoutes đăng ký các API cho Landmark Recognizer (proxy sang AI Server)
func SetupLandmarkRoutes(rg *gin.RouterGroup, authClient *auth.Client) {
	// Tất cả route đều yêu cầu xác thực Firebase Token / Local JWT
	rg.Use(middlewares.VerifyUserToken(authClient))

	// 1. Kiểm tra trạng thái AI (Health)
	rg.GET("/health", HealthHandler())

	// 2. Xem danh sách nhãn hỗ trợ
	rg.GET("/labels", LabelsHandler())

	// 3. Nhận diện địa danh qua ảnh
	rg.POST("/predict", PredictHandler())
}
