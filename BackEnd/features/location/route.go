package location

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupLocationRoutes(router *gin.RouterGroup, db *gorm.DB) {
	// API: api/location/filter?city=xxx&category=xxx&page=1&limit=20
	router.GET("/filter", FilterLocationHandler(db))

	router.GET("/all", GetAllLocationsHandler(db))

	// API: api/location/:id
	router.GET("/:id", GetLocationDetailHandler(db))
}
