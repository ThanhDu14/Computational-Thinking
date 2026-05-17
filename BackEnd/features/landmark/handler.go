package landmark

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"smart-travel-backend/config"
	"smart-travel-backend/utils"

	"github.com/gin-gonic/gin"
)

// Hàm proxy JSON sang AI Server cho module Landmark
func proxyToAI(c *gin.Context, method string, aiPath string) {
	aiBaseURL := config.GetEnv("AI_ENDPOINT", "http://localhost:8000")
	targetURL := aiBaseURL + aiPath

	req, err := http.NewRequest(method, targetURL, nil)
	if err != nil {
		log.Printf("[LANDMARK] ❌ Lỗi tạo request: %v", err)
		utils.RespondError(c, http.StatusInternalServerError, "Lỗi server nội bộ", nil)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Secret", config.GetEnv("AI_INTERNAL_SECRET", "super_secret_key_123"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[LANDMARK] ❌ Lỗi kết nối AI: %v", err)
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

// Hàm proxy multipart/form-data sang AI Server (dùng cho upload ảnh)
func proxyMultipartToAI(c *gin.Context, aiPath string) {
	aiBaseURL := config.GetEnv("AI_ENDPOINT", "http://localhost:8000")
	targetURL := aiBaseURL + aiPath

	// Lấy file từ request Frontend
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		log.Printf("[LANDMARK] ❌ Không lấy được file ảnh: %v", err)
		utils.RespondError(c, http.StatusBadRequest, "Không tìm thấy file ảnh trong request", nil)
		return
	}
	defer file.Close()

	// Tạo multipart body mới để forward sang AI
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	// Copy file vào multipart với Content-Type chuẩn
	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", fmt.Sprintf(`form-data; name="file"; filename="%s"`, header.Filename))
	
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	h.Set("Content-Type", contentType)

	part, err := writer.CreatePart(h)
	if err != nil {
		log.Printf("[LANDMARK] ❌ Lỗi tạo multipart: %v", err)
		utils.RespondError(c, http.StatusInternalServerError, "Lỗi server nội bộ", nil)
		return
	}

	if _, err = io.Copy(part, file); err != nil {
		log.Printf("[LANDMARK] ❌ Lỗi copy file: %v", err)
		utils.RespondError(c, http.StatusInternalServerError, "Lỗi server nội bộ", nil)
		return
	}

	writer.Close()

	// Tạo request sang AI
	req, err := http.NewRequest("POST", targetURL, &buf)
	if err != nil {
		log.Printf("[LANDMARK] ❌ Lỗi tạo request: %v", err)
		utils.RespondError(c, http.StatusInternalServerError, "Lỗi server nội bộ", nil)
		return
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("X-Internal-Secret", config.GetEnv("AI_INTERNAL_SECRET", "super_secret_key_123"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[LANDMARK] ❌ Lỗi kết nối AI: %v", err)
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

// 1. Kiểm tra trạng thái hệ thống Landmark
func HealthHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		proxyToAI(c, "GET", "/landmark/health")
	}
}

// 2. Lấy danh sách nhãn địa danh
func LabelsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		proxyToAI(c, "GET", "/landmark/labels")
	}
}

// 3. Nhận diện địa danh từ hình ảnh (multipart/form-data)
func PredictHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		proxyMultipartToAI(c, "/landmark/predict")
	}
}
