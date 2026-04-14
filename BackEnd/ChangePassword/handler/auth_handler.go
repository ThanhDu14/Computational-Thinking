package handler

import (
	"errors"
	"net/http"

	"change-password/apperr"
	"change-password/dto"
	"change-password/middleware"
	"change-password/service"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// ChangePassword godoc
// @Summary      Đổi mật khẩu
// @Description  User đổi mật khẩu bằng cách cung cấp mật khẩu cũ và mật khẩu mới
// @Tags         users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.ChangePasswordRequest  true  "Change password payload"
// @Success      200   {object}  map[string]interface{}
// @Failure      400   {object}  map[string]interface{}
// @Failure      401   {object}  map[string]interface{}
// @Router       /api/users/change-password [put]
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	// Lấy userID từ JWT claims (đã được middleware gắn vào context)
	userID, ok := c.Get(middleware.UserIDKey)
	if !ok {
		c.JSON(http.StatusUnauthorized, errorResponse("unauthorized", "missing user identity"))
		return
	}

	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse("validation error", err.Error()))
		return
	}

	err := h.authService.ChangePassword(c.Request.Context(), userID.(string), &req)
	if err != nil {
		status, msg := mapChangePasswordError(err)
		c.JSON(status, errorResponse(msg, err.Error()))
		return
	}

	c.JSON(http.StatusOK, successResponse("password changed successfully", nil))
}

// mapChangePasswordError ánh xạ domain error → HTTP status code + message
func mapChangePasswordError(err error) (int, string) {
	switch {
	case errors.Is(err, apperr.ErrWrongPassword):
		return http.StatusUnauthorized, "wrong old password"
	case errors.Is(err, apperr.ErrPasswordMismatch):
		return http.StatusBadRequest, "passwords do not match"
	case errors.Is(err, apperr.ErrSamePassword):
		return http.StatusBadRequest, "new password must differ from old password"
	case errors.Is(err, apperr.ErrUserNotFound):
		return http.StatusNotFound, "user not found"
	default:
		return http.StatusInternalServerError, "internal server error"
	}
}

// ---- Response helpers ----

func successResponse(message string, data interface{}) gin.H {
	return gin.H{
		"success": true,
		"message": message,
		"data":    data,
	}
}

func errorResponse(message string, detail string) gin.H {
	return gin.H{
		"success": false,
		"message": message,
		"error":   detail,
	}
}