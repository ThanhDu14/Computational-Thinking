package location

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupLocationRoutes(router *gin.RouterGroup, authClient *auth.Client, db *gorm.DB) {
	protected := router.Group("/")
	protected.Use(middlewares.VerifyUserToken(authClient))
	{
		protected.GET("/filter", FilterLocationHandler(db))
		protected.GET("/search", SearchLocationHandler(db))
		protected.GET("/all", GetAllLocationsHandler(db))
		protected.GET("/:id", GetLocationDetailHandler(db))
	}
}
