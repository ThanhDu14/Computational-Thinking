package recommend

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

// SetupRecommendRoutes đăng ký các API cho Recommendation (proxy sang AI Server)
func SetupRecommendRoutes(rg *gin.RouterGroup, authClient *auth.Client) {
	// Tất cả route đều yêu cầu xác thực Firebase Token / Local JWT
	protected := rg.Group("/")
	protected.Use(middlewares.VerifyUserToken(authClient))
	{
		// 1. Lấy gợi ý lịch trình (predict)
		protected.POST("", RecommendHandler())

		// 2. Lưu lịch trình lên Supabase
		protected.POST("/save", SavePlanHandler())

		// 3. Lấy lịch sử lịch trình
		protected.GET("/history", GetHistoryHandler())

		// 4. Lấy chi tiết một lịch trình
		protected.GET("/plan/:plan_id", GetPlanHandler())

		// 5. Xóa một lịch trình
		protected.DELETE("/plan/:plan_id", DeletePlanHandler())
	}
}
