package contact

import (
	"log"
	"net/http"
	"smart-travel-backend/utils"

	"github.com/gin-gonic/gin"
)

// SendContactEmailHandler xử lý yêu cầu gửi email từ form liên hệ.
func SendContactEmailHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var form ContactForm

		if err := c.ShouldBindJSON(&form); err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Dữ liệu không hợp lệ. Vui lòng điền đầy đủ thông tin (họ, tên, email, nội dung).", nil)
			return
		}

		if err := SendContactEmail(form); err != nil {
			log.Printf("[CONTACT] ❌ Gửi email liên hệ thất bại: %v", err)
			utils.RespondError(c, http.StatusInternalServerError, "Gửi email thất bại, vui lòng thử lại.", nil)
			return
		}

		log.Printf("[CONTACT] ✅ Đã gửi email liên hệ từ %s %s (%s)", form.Ho, form.Ten, form.Email)
		utils.RespondSuccess(c, http.StatusOK, "Email đã được gửi thành công!", nil)
	}
}
