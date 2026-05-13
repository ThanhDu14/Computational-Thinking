package profile

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupProfileRoutes(router *gin.RouterGroup, authClient *auth.Client, db *gorm.DB) {
	profileGroup := router.Group("/")

	// Gắn middleware để bắt buộc phải có token hợp lệ
	profileGroup.Use(middlewares.VerifyUserToken(authClient))
	{
		profileGroup.POST("/upload-avatar", UploadAvatarHandler())
		profileGroup.PUT("/update-info", UpdateProfileHandler(db))
		profileGroup.GET("/get-info", GetMyProfileHandler(db))
	}
}
