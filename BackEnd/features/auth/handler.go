package auth

import (
	"net/http"
	"strings"

	"smart-travel-backend/utils"

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
			utils.RespondError(c, http.StatusBadRequest, "Thiếu hoặc sai định dạng Token", nil)
			return
		}
		idToken := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := authClient.VerifyIDToken(c.Request.Context(), idToken)
		if err != nil {
			utils.RespondError(c, http.StatusUnauthorized, "Token không hợp lệ hoặc đã hết hạn", nil)
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
			utils.RespondError(c, http.StatusInternalServerError, "Không thể xử lý dữ liệu người dùng tại Server", nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Đăng nhập / Đăng ký Google thành công", gin.H{
			"db_id":        userData.ID,
			"firebase_uid": userData.FirebaseUID,
			"email":        userData.Email,
			"name":         userData.Name,
			"role":         userData.Role,
		})
	}
}

func Logout(authClient *fbauth.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		authProvider, _ := c.Get("auth_provider")

		// Nếu là Local JWT, chỉ cần báo thành công (Client tự xóa token dưới máy)
		if authProvider == "local" {
			utils.RespondSuccess(c, http.StatusOK, "Đăng xuất tài khoản nội bộ (Local) thành công", nil)
			return
		}

		// Nếu là Firebase, gọi thao tác thu hồi toàn bộ token trên mạng lưới Google
		if authProvider == "firebase" {
			uidValue, exist := c.Get("firebase_uid")
			if !exist {
				utils.RespondError(c, http.StatusInternalServerError, "Không thể lấy Firebase UID", nil)
				return
			}
			uid := uidValue.(string)

			err := ProcessLogout(c.Request.Context(), authClient, uid)
			if err != nil {
				utils.RespondError(c, http.StatusInternalServerError, "Không thể hoàn tất thu hồi phiên đăng nhập Firebase", nil)
				return
			}
			utils.RespondSuccess(c, http.StatusOK, "Thu hồi token Google (Firebase) thành công!", nil)
			return
		}

		utils.RespondError(c, http.StatusBadRequest, "Không xác định được luồng Đăng xuất", nil)
	}
}

type LocalRegisterInput struct {
	Username        string `json:"username" binding:"required"`
	Password        string `json:"password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

func LocalRegister(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input LocalRegisterInput
		if err := c.ShouldBindJSON(&input); err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Dữ liệu đầu vào không hợp lệ: "+err.Error(), nil)
			return
		}

		if input.Password != input.ConfirmPassword {
			utils.RespondError(c, http.StatusBadRequest, "Mật khẩu xác nhận không khớp", nil)
			return
		}

		userData, token, err := ProcessLocalRegister(db, input)
		if err != nil {
			if err.Error() == "username_already_exists" {
				utils.RespondError(c, http.StatusConflict, "Tên đăng nhập đã tồn tại", nil)
				return
			}
			utils.RespondError(c, http.StatusInternalServerError, "Lỗi hệ thống khi tạo tài khoản", nil)
			return
		}

		utils.RespondSuccess(c, http.StatusCreated, "Đăng ký thành công", gin.H{
			"id":       userData.ID,
			"username": userData.Username,
			"name":     userData.Name,
			"role":     userData.Role,
			"token":    token,
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
			utils.RespondError(c, http.StatusBadRequest, "Thiếu thông tin đăng nhập: "+err.Error(), nil)
			return
		}

		userData, token, err := ProcessLocalLogin(db, input)
		if err != nil {
			utils.RespondError(c, http.StatusUnauthorized, "Sai tên đăng nhập hoặc mật khẩu", nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Đăng nhập thành công", gin.H{
			"id":       userData.ID,
			"username": userData.Username,
			"name":     userData.Name,
			"role":     userData.Role,
			"token":    token,
		})
	}
}

// DTO cho ChangePassword
type ChangePasswordInput struct {
	OldPassword     string `json:"old_password"      binding:"required,min=8"`
	NewPassword     string `json:"new_password"      binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password"  binding:"required,min=8"`
}

// ChangePassword handler cho route PUT /api/auth/change-password

func ChangePassword(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lấy userID từ context (middleware đã set "user_id")
		userID, exists := c.Get("user_id")
		if !exists {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được người dùng", nil)
			return
		}

		var input ChangePasswordInput
		if err := c.ShouldBindJSON(&input); err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Dữ liệu đầu vào không hợp lệ: "+err.Error(), nil)
			return
		}

		err := ProcessChangePassword(db, userID.(string), input)
		if err != nil {
			status, msg := mapChangePasswordError(err)
			utils.RespondError(c, status, msg, nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Đổi mật khẩu thành công", nil)
	}
}

// mapChangePasswordError ánh xạ domain error → HTTP status + message tiếng Việt
func mapChangePasswordError(err error) (int, string) {
	switch err.Error() {
	case "wrong_old_password":
		return http.StatusUnauthorized, "Mật khẩu cũ không đúng"
	case "password_mismatch":
		return http.StatusBadRequest, "Mật khẩu xác nhận không khớp"
	case "same_password":
		return http.StatusBadRequest, "Mật khẩu mới phải khác mật khẩu cũ"
	case "user_not_found":
		return http.StatusNotFound, "Không tìm thấy người dùng"
	case "no_password_set":
		return http.StatusBadRequest, "Tài khoản Google không có mật khẩu để đổi"
	default:
		return http.StatusInternalServerError, "Lỗi hệ thống"
	}
}
