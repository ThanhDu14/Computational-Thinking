package wishlist

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupWishlistRoutes(router *gin.RouterGroup, authClient *auth.Client, db *gorm.DB) {
	protected := router.Group("/")
	protected.Use(middlewares.VerifyUserToken(authClient))
	{
		protected.POST("/add", AddToWishlistHandler(db))
		protected.GET("/my-wishlist", GetMyWishlistHandler(db))
		protected.DELETE("/remove/:location_id", RemoveFromWishlistHandler(db))
		protected.GET("/check/:location_id", CheckWishlistHandler(db))
	}
}
