package location

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupLocationRoutes(router *gin.RouterGroup, db *gorm.DB) {
	router.GET("/filter", FilterLocationHandler(db))
	router.GET("/search", SearchLocationHandler(db))
	router.GET("/all", GetAllLocationsHandler(db))
	router.GET("/:id", GetLocationDetailHandler(db))
}
