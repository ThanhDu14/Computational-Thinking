package routes

import (
	"smart-travel-backend/controllers"
	"smart-travel-backend/middlewares"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupAuthRoutes(rg *gin.RouterGroup, authClient *auth.Client, db *gorm.DB) {
	// Firebase Auth (SSO)
	rg.POST("/google", controllers.GoogleAuth(authClient, db))
	rg.POST("/logout", middlewares.VerifyUserToken(authClient), controllers.Logout(authClient))

	// Local Auth (Username/Password)
	rg.POST("/local/register", controllers.LocalRegister(db))
	rg.POST("/local/login", controllers.LocalLogin(db))
}
