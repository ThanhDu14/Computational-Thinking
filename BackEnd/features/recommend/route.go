package recommend

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

// SetupRecommendRoutes đăng ký các API cho Recommendation (proxy sang AI Server)
func SetupRecommendRoutes(rg *gin.RouterGroup, authClient *auth.Client) {
	// Tất cả route đều yêu cầu xác thực Firebase Token / Local JWT
	rg.Use(middlewares.VerifyUserToken(authClient))

	// 1. Lấy gợi ý lịch trình (predict)
	rg.POST("", RecommendHandler())

	// 2. Lưu lịch trình lên Supabase
	rg.POST("/save", SavePlanHandler())

	// 3. Lấy lịch sử lịch trình
	rg.GET("/history", GetHistoryHandler())

	// 4. Lấy chi tiết một lịch trình
	rg.GET("/plan/:plan_id", GetPlanHandler())

	// 5. Xóa một lịch trình
	rg.DELETE("/plan/:plan_id", DeletePlanHandler())
}
