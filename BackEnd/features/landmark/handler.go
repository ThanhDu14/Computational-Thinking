package landmark

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"smart-travel-backend/config"
	"smart-travel-backend/utils"
	"time"

	"github.com/gin-gonic/gin"
)

// Hàm proxy JSON sang AI Server cho module Landmark
func proxyToAI(c *gin.Context, method string, aiPath string, customBody []byte) {
	aiBaseURL := config.GetEnv("AI_ENDPOINT", "http://localhost:8000")
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

// 1. Kiểm tra trạng thái hệ thống Landmark
func HealthHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		proxyToAI(c, "GET", "/landmark/health", nil)
	}
}

// 2. Lấy danh sách nhãn địa danh
func LabelsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		proxyToAI(c, "GET", "/landmark/labels", nil)
	}
}

// 3. Nhận diện địa danh từ hình ảnh (Dùng link URL - JSON)
func PredictUrlHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var reqBody map[string]interface{}
		if err := c.ShouldBindJSON(&reqBody); err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Dữ liệu JSON không hợp lệ", nil)
			return
		}

		jsonBody, _ := json.Marshal(reqBody)

		// Gọi proxy sang AI Server (AI Server nhận JSON)
		proxyToAI(c, "POST", "/landmark/predict", jsonBody)
	}
}

// 4. Nhận diện địa danh từ hình ảnh (Upload qua Cloudinary) - Chỉ trả về Link
func PredictUploadHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Lấy file ảnh từ request
		file, header, err := c.Request.FormFile("file")
		if err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Không tìm thấy file ảnh trong request", nil)
			return
		}
		defer file.Close()

		// 2. Upload ảnh lên Cloudinary
		filename := fmt.Sprintf("landmark_%d_%s", time.Now().Unix(), header.Filename)
		imageURL, err := utils.UploadLandmarkImageToCloudinary(file, filename)
		if err != nil {
			log.Printf("[LANDMARK] ❌ Lỗi upload ảnh lên Cloudinary: %v", err)
			utils.RespondError(c, http.StatusInternalServerError, "Lỗi upload ảnh lên Cloud", nil)
			return
		}

		// 3. Trả về link URL cho Frontend (Frontend sẽ tự lấy link này gọi tiếp vào /landmark/predict)
		utils.RespondSuccess(c, http.StatusOK, "Upload ảnh thành công", gin.H{
			"image_url": imageURL,
		})
	}
}
