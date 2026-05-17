package chatbot

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

// SetupChatbotRoutes đăng ký các API cho Chatbot
func SetupChatbotRoutes(rg *gin.RouterGroup, authClient *auth.Client) {
	// Group các route cần xác thực bằng Firebase Token/Local JWT
	protected := rg.Group("/")
	protected.Use(middlewares.VerifyUserToken(authClient))
	{
		// 1. Tạo đoạn chat mới
		protected.POST("/chat/new", NewChatHandler())
		
		// 2. Gửi tin nhắn
		protected.POST("/chat", ChatHandler())
		
		// 3. Lấy lịch sử chat
		protected.GET("/chat/:user_id/:session_id/history", GetHistoryHandler())
		
		// 4. Lấy danh sách session (Sidebar)
		protected.GET("/sessions", GetSessionsHandler())
		
		// 5. Xóa hội thoại
		protected.DELETE("/chat/:session_id", DeleteSessionHandler())
	}
}
