package middlewares

import (
	"context"
	"net/http"
	"smart-travel-backend/utils"
	"strings"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

func VerifyUserToken(authClient *auth.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Thiếu header Authorization"})
			return
		}
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Định dạng Token sai"})
			return
		}
		idToken := parts[1]

		// Thử verify qua hệ thống JWT nội bộ (Local) trước
		if claims, err := utils.ParseJWT(idToken); err == nil {
			c.Set("user_id", claims["user_id"])
			c.Set("username", claims["username"])
			c.Set("auth_provider", "local")
			c.Next()
			return
		}

		// Nếu không phải JWT Local, fallback thư viện Firebase xem có phải SSO (Cửa 1) không
		token, err := authClient.VerifyIDToken(context.Background(), idToken)
		if err == nil {
			c.Set("firebase_uid", token.UID)
			c.Set("auth_provider", "firebase")
			c.Next()
			return
		}

		// Cả 2 đều trượt
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token không hợp lệ hoặc đã hết hạn session (6 tiếng)"})
	}
}
