package recommend

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

// Hàm proxy chung sang AI Server cho module Recommend
func proxyToAI(c *gin.Context, method string, aiPath string, customBody []byte) {
	aiBaseURL := config.GetEnv("AI_ENDPOINT", "http://localhost:8000")
	targetURL := aiBaseURL + aiPath

	var bodyReader io.Reader
	var debugBody string // DEBUG: lưu lại body để log

	if customBody != nil {
		bodyReader = bytes.NewBuffer(customBody)
		debugBody = string(customBody)
	} else if method == "POST" || method == "PUT" || method == "PATCH" {
		bodyBytes, err := io.ReadAll(c.Request.Body)
		if err == nil {
			bodyReader = bytes.NewBuffer(bodyBytes)
			debugBody = string(bodyBytes)
		} else {
			log.Printf("[RECOMMEND] ⚠️ Lỗi đọc request body từ client: %v", err)
			debugBody = "(đọc body thất bại)"
		}
	}

	// DEBUG: Log request đang được forward sang AI
	log.Printf("[RECOMMEND] 🔄 Proxy %s %s | Content-Type từ client: %s | Body: %s",
		method, targetURL, c.ContentType(), debugBody)

	req, err := http.NewRequest(method, targetURL, bodyReader)
	if err != nil {
		log.Printf("[RECOMMEND] ❌ Lỗi tạo request: %v", err)
		utils.RespondError(c, http.StatusInternalServerError, "Lỗi server nội bộ", nil)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Secret", config.GetEnv("AI_INTERNAL_SECRET", "super_secret_key_123"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[RECOMMEND] ❌ Lỗi kết nối AI: %v", err)
		utils.RespondError(c, http.StatusBadGateway, "Không thể kết nối đến hệ thống AI", nil)
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Lỗi xử lý phản hồi từ AI", nil)
		return
	}

	// DEBUG: Log response từ AI server khi có lỗi (status >= 400)
	if resp.StatusCode >= 400 {
		log.Printf("[RECOMMEND] ⚠️ AI Server trả lỗi %d | Response body: %s", resp.StatusCode, string(respBody))
	}

	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), respBody)
}

// 1. Lấy gợi ý lịch trình (Predict - không lưu DB)
func RecommendHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Forward nguyên request body sang AI /recommend
		proxyToAI(c, "POST", "/recommend", nil)
	}
}

// 2. Lưu lịch trình lên Supabase
func SavePlanHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserID(c)
		// Forward body sang AI /recommend/save/{user_id}
		proxyToAI(c, "POST", "/recommend/save/"+userID, nil)
	}
}

// 3. Lấy lịch sử lịch trình của user
func GetHistoryHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserID(c)
		proxyToAI(c, "GET", "/recommend/history/"+userID, nil)
	}
}

// 4. Lấy chi tiết một lịch trình cụ thể
func GetPlanHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		planID := c.Param("plan_id")
		proxyToAI(c, "GET", "/recommend/plan/"+planID, nil)
	}
}

// 5. Xóa một lịch trình
func DeletePlanHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		planID := c.Param("plan_id")
		proxyToAI(c, "DELETE", "/recommend/plan/"+planID, nil)
	}
}

// Đảm bảo package sử dụng json (tránh lỗi unused import khi build)
var _ = json.Marshal
