package landmark

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

// SetupLandmarkRoutes đăng ký các API cho Landmark Recognizer (proxy sang AI Server)
func SetupLandmarkRoutes(rg *gin.RouterGroup, authClient *auth.Client) {
	// Tất cả route đều yêu cầu xác thực Firebase Token / Local JWT
	protected := rg.Group("/")
	protected.Use(middlewares.VerifyUserToken(authClient))
	{
		// 1. Kiểm tra trạng thái hệ thống
		protected.GET("/health", HealthHandler())

		// 2. Lấy danh sách nhãn địa danh
		protected.GET("/labels", LabelsHandler())

		// 3. Nhận diện địa danh từ hình ảnh
		protected.POST("/predict", PredictHandler())
	}
}
