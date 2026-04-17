package profile

import (
	"encoding/json"
	"errors"
	"strings"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// DTO định nghĩa các trường nhận từ Frontend
type UpdateProfileInput struct {
	Avatar            string   `json:"avatar"` // URL ảnh
	DisplayName       string   `json:"display_name"`
	PhoneNumber       string   `json:"phone_number"`
	Bio               string   `json:"bio"`
	TravelPreferences []string `json:"travel_preferences"` // Mảng sở thích
	Email             string   `json:"email"`
}

func UpdateUserProfileService(db *gorm.DB, lookupField string, lookupValue string, input UpdateProfileInput) error {
	var user User

	// Tìm user theo field tương ứng (user_id hoặc firebase_uid)
	if err := db.Where(lookupField+" = ?", lookupValue).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("không tìm thấy người dùng này")
		}
		return errors.New("lỗi truy xuất cơ sở dữ liệu")
	}

	// 2. Chẩn bị bộ dữ liệu cập nhật
	updates := make(map[string]interface{})

	if input.Avatar != "" {
		updates["avatar"] = input.Avatar
	}
	if input.DisplayName != "" {
		updates["display_name"] = input.DisplayName
	}
	if input.PhoneNumber != "" {
		updates["phone_number"] = input.PhoneNumber
	}
	if input.Bio != "" {
		updates["bio"] = input.Bio
	}

	// Mảng sở thích
	if len(input.TravelPreferences) > 0 {
		if bytes, err := json.Marshal(input.TravelPreferences); err == nil {
			updates["travel_preferences"] = datatypes.JSON(bytes)
		}
	}

	// 3. Xử lý Email và kiểm tra thực tế
	if input.Email != "" {
		// Kiểm tra Google login
		if user.Provider != "local" && user.Email != nil && *user.Email != input.Email {
			return errors.New("tài khoản đăng nhập bằng Google không thể thay đổi email")
		}

		// Nếu đổi sang email khác email hiện tại, hãy kiểm tra trùng lặp chủ động
		if user.Email == nil || *user.Email != input.Email {
			var otherUser User
			// Tìm xem có user KHÁC mang email này không
			err := db.Where("email = ? AND user_id <> ?", input.Email, user.ID).First(&otherUser).Error
			if err == nil {
				return errors.New("email_already_used_by_another")
			}
		}
		updates["email"] = input.Email
	}

	// 4. Lưu thay đổi bằng Updates (Chỉ cập nhật các field thay đổi, tránh lỗi Save nhầm ID/Username)
	if len(updates) > 0 {
		if err := db.Model(&user).Updates(updates).Error; err != nil {
			if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique constraint") {
				return errors.New("dữ liệu cập nhật bị trùng lặp với tài khoản khác (vui lòng kiểm tra email)")
			}
			return errors.New("không thể lưu thông tin cập nhật: " + err.Error())
		}
	}

	return nil
}
