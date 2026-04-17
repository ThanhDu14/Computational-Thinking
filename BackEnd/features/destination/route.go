package destination

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupDestinationRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	destinationGroup := rg.Group("/destination")
	{
		// Cấu trúc: api/destination/filter/:city
		destinationGroup.GET("/filter/:city", FilterDestinationHandler(db))
		
		// Optional: api/destination/all
		destinationGroup.GET("/all", GetAllDestinationsHandler(db))
	}
}
