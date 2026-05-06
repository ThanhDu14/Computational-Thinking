package review

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupReviewRoutes(router *gin.RouterGroup, authClient *auth.Client, db *gorm.DB) {
	// Route công khai - xem review không cần đăng nhập
	router.GET("/location/:location_id", GetReviewsByLocationHandler(db))

	// Routes yêu cầu đăng nhập
	protected := router.Group("/")
	protected.Use(middlewares.VerifyUserToken(authClient))
	{
		protected.POST("/create", CreateReviewHandler(db))
		protected.GET("/my-reviews", GetMyReviewsHandler(db))
		protected.PUT("/update/:review_id", UpdateReviewHandler(db))
		protected.DELETE("/delete/:review_id", DeleteReviewHandler(db))
		protected.POST("/upload-image", UploadReviewImageHandler())
	}
}
