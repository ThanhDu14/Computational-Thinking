package controllers

import (
	"log"
	"net/http"
	"smart-travel-backend/models"
	"smart-travel-backend/services"

	"github.com/gin-gonic/gin"
)

// SendContactEmail xử lý yêu cầu gửi email từ form liên hệ.
func SendContactEmail() gin.HandlerFunc {
	return func(c *gin.Context) {
		var form models.ContactForm

		if err := c.ShouldBindJSON(&form); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Dữ liệu không hợp lệ. Vui lòng điền đầy đủ thông tin (họ, tên, email, nội dung).",
			})
			return
		}

		if err := services.SendContactEmail(form); err != nil {
			log.Printf("[CONTACT] ❌ Gửi email liên hệ thất bại: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Gửi email thất bại, vui lòng thử lại.",
			})
			return
		}

		log.Printf("[CONTACT] ✅ Đã gửi email liên hệ từ %s %s (%s)", form.Ho, form.Ten, form.Email)
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Email đã được gửi thành công!",
		})
	}
}
