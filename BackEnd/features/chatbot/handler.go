package chatbot

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"smart-travel-backend/config"
	"smart-travel-backend/utils"

	"github.com/gin-gonic/gin"
)

// Hàm helper để lấy userID từ token đã được xác thực (hỗ trợ cả JWT Local và Firebase SSO)
func getUserID(c *gin.Context) string {
	if uid, exists := c.Get("user_id"); exists {
		return uid.(string)
	}
	if uid, exists := c.Get("firebase_uid"); exists {
		return uid.(string)
	}
	return "unknown_user"
}

// Hàm proxy chung sang AI Server
func proxyToAI(c *gin.Context, method string, aiPath string, customBody []byte) {
	aiBaseURL := config.GetEnv("AI_ENDPOINT", "http://13.229.155.181:8000")
	targetURL := aiBaseURL + aiPath

	var bodyReader io.Reader
	if customBody != nil {
		bodyReader = bytes.NewBuffer(customBody)
	} else if method == "POST" || method == "PUT" || method == "PATCH" {
		bodyBytes, err := io.ReadAll(c.Request.Body)
		if err == nil {
			bodyReader = bytes.NewBuffer(bodyBytes)
		}
	}

	req, err := http.NewRequest(method, targetURL, bodyReader)
	if err != nil {
		log.Printf("[CHATBOT] ❌ Lỗi tạo request: %v", err)
		utils.RespondError(c, http.StatusInternalServerError, "Lỗi server nội bộ", nil)
		return
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[CHATBOT] ❌ Lỗi kết nối AI: %v", err)
		utils.RespondError(c, http.StatusBadGateway, "Không thể kết nối đến hệ thống AI", nil)
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Lỗi xử lý phản hồi từ AI", nil)
		return
	}

	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), respBody)
}

// 1. Tạo đoạn chat mới (New Chat)
func NewChatHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserID(c)
		body := map[string]string{"user_id": userID}
		jsonBody, _ := json.Marshal(body)

		proxyToAI(c, "POST", "/chat/new", jsonBody)
	}
}

// 2. Gửi tin nhắn (Chat)
func ChatHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserID(c)

		var reqBody map[string]interface{}
		if err := c.ShouldBindJSON(&reqBody); err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Dữ liệu không hợp lệ", nil)
			return
		}

		// Ghi đè user_id bằng ID thực của user đang đăng nhập (bảo mật tuyệt đối, Frontend không thể fake ID)
		reqBody["user_id"] = userID
		jsonBody, _ := json.Marshal(reqBody)

		proxyToAI(c, "POST", "/chat", jsonBody)
	}
}

// 3. Lấy lịch sử chat (History)
func GetHistoryHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Dù Frontend truyền user_id trên URL, ta vẫn ép lấy user_id từ Token 
		// để đảm bảo an toàn tuyệt đối, gọi sang AI đúng ID thật của user.
		userID := getUserID(c)
		sessionID := c.Param("session_id")
		proxyToAI(c, "GET", "/chat/"+userID+"/"+sessionID+"/history", nil)
	}
}

// 4. Danh sách các phiên (Sidebar)
func GetSessionsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Tự động lấy danh sách của user hiện tại, bỏ qua ID từ phía Frontend để bảo mật
		userID := getUserID(c)
		proxyToAI(c, "GET", "/sessions/"+userID, nil)
	}
}

// 5. Xóa hội thoại (Delete Session)
func DeleteSessionHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID := c.Param("session_id")
		proxyToAI(c, "DELETE", "/chat/"+sessionID, nil)
	}
}
