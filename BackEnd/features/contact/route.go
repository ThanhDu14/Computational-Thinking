package contact

import (
	"github.com/gin-gonic/gin"
)

func SetupContactRoutes(rg *gin.RouterGroup) {
	rg.POST("/send-email", SendContactEmailHandler())
}
