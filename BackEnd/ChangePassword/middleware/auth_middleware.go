package middleware

import (
	"errors"
	"net/http"
	"strings"

	"change-password/apperr"
	"change-password/service"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const UserIDKey = "userID"

// JWTAuth middleware xác thực Bearer token từ header Authorization
func JWTAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			respondUnauthorized(c, "missing authorization header")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
			respondUnauthorized(c, "invalid authorization format, expected: Bearer <token>")
			return
		}

		tokenStr := parts[1]
		claims := &service.Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, apperr.ErrInvalidToken
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			if errors.Is(err, jwt.ErrTokenExpired) {
				respondUnauthorized(c, "token has expired")
				return
			}
			respondUnauthorized(c, "invalid token")
			return
		}

		// Gắn userID vào context để handler dùng
		c.Set(UserIDKey, claims.UserID)
		c.Next()
	}
}

func respondUnauthorized(c *gin.Context, msg string) {
	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
		"success": false,
		"error":   msg,
	})
}