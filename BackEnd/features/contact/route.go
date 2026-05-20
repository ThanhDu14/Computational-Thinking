package contact

import (
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

func SetupContactRoutes(rg *gin.RouterGroup, authClient *auth.Client) {
	protected := rg.Group("/")
	protected.Use(middlewares.VerifyUserToken(authClient))
	{
		protected.POST("/send-email", SendContactEmailHandler())
	}
}
