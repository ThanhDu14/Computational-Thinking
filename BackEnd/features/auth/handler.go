package auth

import (
	"net/http"
	"strings"

	fbauth "firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// extractProvider lấy provider từ Firebase Token claims
func extractProvider(claims map[string]interface{}) string {
	if firebase, ok := claims["firebase"].(map[string]interface{}); ok {
		if p, ok := firebase["sign_in_provider"].(string); ok {
			return p
		}
	}
	return "unknown"
}

func GoogleAuth(authClient *fbauth.Client, db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Thiếu hoặc sai định dạng Token"})
			return
		}
		idToken := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := authClient.VerifyIDToken(c.Request.Context(), idToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token không hợp lệ hoặc đã hết hạn"})
			return
		}

		uid := token.UID
		email, _ := token.Claims["email"].(string)
		name, _ := token.Claims["name"].(string)
		provider := extractProvider(token.Claims)

		if name == "" && email != "" {
			name = strings.Split(email, "@")[0]
		}

		userData, err := ProcessLogin(db, uid, email, name, provider)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Không thể xử lý dữ liệu người dùng tại Server",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Đăng nhập / Đăng ký Google thành công",
			"data": gin.H{
				"db_id":        userData.ID,
				"firebase_uid": userData.FirebaseUID,
				"email":        userData.Email,
				"name":         userData.Name,
				"role":         userData.Role,
			},
		})
	}
}

func Logout(authClient *fbauth.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		authProvider, _ := c.Get("auth_provider")

		// Nếu là Local JWT, chỉ cần báo thành công (Client tự xóa token dưới máy)
		if authProvider == "local" {
			c.JSON(http.StatusOK, gin.H{
				"status":  "success",
				"message": "Đăng xuất tài khoản nội bộ (Local) thành công",
			})
			return
		}

		// Nếu là Firebase, gọi thao tác thu hồi toàn bộ token trên mạng lưới Google
		if authProvider == "firebase" {
			uidValue, exist := c.Get("firebase_uid")
			if !exist {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy Firebase UID"})
				return
			}
			uid := uidValue.(string)

			err := ProcessLogout(c.Request.Context(), authClient, uid)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"status":  "error",
					"message": "Không thể hoàn tất thu hồi phiên đăng nhập Firebase",
				})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"status":  "success",
				"message": "Thu hồi token Google (Firebase) thành công!",
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{"error": "Không xác định được luồng Đăng xuất"})
	}
}

type LocalRegisterInput struct {
	Username        string `json:"username" binding:"required"`
	Password        string `json:"password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

func LocalRegister(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input LocalRegisterInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu đầu vào không hợp lệ", "details": err.Error()})
			return
		}

		if input.Password != input.ConfirmPassword {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Mật khẩu xác nhận không khớp"})
			return
		}

		userData, err := ProcessLocalRegister(db, input.Username, input.Password)
		if err != nil {
			if err.Error() == "username_already_exists" {
				c.JSON(http.StatusConflict, gin.H{"status": "error", "message": "Tên đăng nhập đã tồn tại"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Lỗi hệ thống khi tạo tài khoản"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"status":  "success",
			"message": "Đăng ký thành công",
			"data": gin.H{
				"id":       userData.ID,
				"username": userData.Username,
				"name":     userData.Name,
				"role":     userData.Role,
			},
		})
	}
}

type LocalLoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func LocalLogin(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input LocalLoginInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Thiếu thông tin đăng nhập", "details": err.Error()})
			return
		}

		userData, token, err := ProcessLocalLogin(db, input.Username, input.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Sai tên đăng nhập hoặc mật khẩu"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Đăng nhập thành công",
			"data": gin.H{
				"id":       userData.ID,
				"username": userData.Username,
				"name":     userData.Name,
				"role":     userData.Role,
				"token":    token,
			},
		})
	}
}
