package routes

import (
	"smart-travel-backend/controllers"

	"github.com/gin-gonic/gin"
)

func SetupContactRoutes(rg *gin.RouterGroup) {
	rg.POST("/send-email", controllers.SendContactEmail())
}
