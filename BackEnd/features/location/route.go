package location

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupLocationRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	locationGroup := rg.Group("/location")
	{
		// API: api/location/filter?city=xxx&category=xxx&page=1&limit=20
		locationGroup.GET("/filter", FilterLocationHandler(db))

		// API: api/location/search?q=xxx&city=xxx&category=xxx&page=1&limit=20
		locationGroup.GET("/search", SearchLocationHandler(db))
		
		locationGroup.GET("/all", GetAllLocationsHandler(db))

		// API: api/location/:id
		locationGroup.GET("/:id", GetLocationDetailHandler(db))
	}
}
