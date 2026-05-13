package utils

import (
	"github.com/gin-gonic/gin"
)

// APIResponse là cấu trúc chuẩn cho mọi phản hồi từ Server
type APIResponse struct {
	Status  string      `json:"status"`
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// Respond là hàm helper trung tâm để gửi JSON
func Respond(c *gin.Context, httpCode int, status string, message string, data interface{}) {
	c.JSON(httpCode, APIResponse{
		Status:  status,
		Code:    httpCode,
		Message: message,
		Data:    data,
	})
}

// RespondSuccess trả về phản hồi thành công (thường là 200 hoặc 201)
func RespondSuccess(c *gin.Context, httpCode int, message string, data interface{}) {
	Respond(c, httpCode, "success", message, data)
}

// RespondError trả về phản hồi lỗi
func RespondError(c *gin.Context, httpCode int, message string, data interface{}) {
	Respond(c, httpCode, "error", message, data)
}
