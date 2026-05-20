package chatbot

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

// SetupChatbotRoutes đăng ký các API cho Chatbot
func SetupChatbotRoutes(rg *gin.RouterGroup, authClient *auth.Client) {
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

		// 6. Đổi tên phiên trò chuyện
		protected.PATCH("/sessions/:session_id/title", RenameSessionHandler())

		// 7. Gửi tin nhắn bằng hình ảnh qua link URL (JSON)
		protected.POST("/chat/image", ChatImageUrlHandler())

		// 8. Gửi tin nhắn bằng hình ảnh qua upload file (Multipart/form-data)
		protected.POST("/chat/upload-image", ChatImageUploadHandler())
	}
}
