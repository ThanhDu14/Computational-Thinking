package auth

import (
	"smart-travel-backend/middlewares"

	fbauth "firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupAuthRoutes(rg *gin.RouterGroup, authClient *fbauth.Client, db *gorm.DB) {
	// Firebase Auth (SSO)
	rg.POST("/google", GoogleAuth(authClient, db))
	rg.POST("/logout", middlewares.VerifyUserToken(authClient), Logout(authClient))

	// Local Auth (Username/Password)
	rg.POST("/local/register", LocalRegister(db))
	rg.POST("/local/login", LocalLogin(db))

	// Change Password (chỉ Local user, cần xác thực JWT)
	rg.PUT("/change-password", middlewares.VerifyUserToken(authClient), ChangePassword(db))
}
