package chatbot

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

// SetupChatbotRoutes đăng ký các API cho Chatbot
func SetupChatbotRoutes(rg *gin.RouterGroup, authClient *auth.Client) {
	// Yêu cầu xác thực bằng Firebase Token/Local JWT
	rg.Use(middlewares.VerifyUserToken(authClient))

	// 1. Tạo đoạn chat mới
	rg.POST("/chat/new", NewChatHandler())
	
	// 2. Gửi tin nhắn
	rg.POST("/chat", ChatHandler())
	
	// 3. Lấy lịch sử chat
	rg.GET("/chat/:user_id/:session_id/history", GetHistoryHandler())
	
	// 4. Lấy danh sách session (Sidebar)
	rg.GET("/sessions", GetSessionsHandler())
	
	// 5. Xóa hội thoại
	rg.DELETE("/chat/:session_id", DeleteSessionHandler())

	// 6. Đổi tên phiên trò chuyện
	rg.PATCH("/sessions/:session_id/title", RenameSessionHandler())

	// 7. Gửi tin nhắn bằng hình ảnh (Vision/Landmark)
	rg.POST("/chat/image", ChatImageHandler())
}
