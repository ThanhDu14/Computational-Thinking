package auth

import (
	"context"
	"errors"
	"log"
	"smart-travel-backend/utils"
	"time"

	fbauth "firebase.google.com/go/v4/auth"
	"gorm.io/gorm"
)

func ProcessRegister(db *gorm.DB, uid string, email string, name string, provider string) (*User, error) {
	var user User

	err := db.Where("email = ? OR firebase_uid = ?", email, uid).First(&user).Error

	if err == nil {
		return nil, errors.New("user_already_exists")
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		var emailPtr *string
		if email != "" {
			emailPtr = &email
		}

		newUser := User{
			FirebaseUID: &uid,
			Email:       emailPtr,
			Name:        name,
			Provider:    provider,
			Role:        "tourist",
			CreatedAt:   time.Now(),
		}

		if err := db.Create(&newUser).Error; err != nil {
			log.Println("Lỗi khi Create User trong DB:", err)
			return nil, err
		}
		return &newUser, nil
	}

	return nil, err
}

func ProcessLogin(db *gorm.DB, uid, email, name, provider string) (*User, error) {
	var user User
	err := db.Where("firebase_uid = ?", uid).First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("Phát hiện người dùng mới: %s. Đang tiến hành tạo hồ sơ...", email)
			var emailPtr *string
			if email != "" {
				emailPtr = &email
			}
			newUser := User{
				FirebaseUID: &uid,
				Email:       emailPtr,
				Name:        name,
				Provider:    provider,
				Role:        "tourist",
				CreatedAt:   time.Now(),
			}
			if errCreate := db.Create(&newUser).Error; errCreate != nil {
				log.Println("Lỗi khi tạo user mới:", errCreate)
				return nil, errCreate
			}
			return &newUser, nil
		}
		return nil, err
	}

	updateNeeded := false
	if name != "" && user.Name != name {
		user.Name = name
		updateNeeded = true
	}

	if updateNeeded {
		if errSave := db.Save(&user).Error; errSave != nil {
			log.Println("Lỗi khi cập nhật thông tin user:", errSave)
		}
	}

	return &user, nil
}

func ProcessLogout(ctx context.Context, authClient *fbauth.Client, uid string) error {
	err := authClient.RevokeRefreshTokens(ctx, uid)
	if err != nil {
		log.Printf("Lỗi khi thu hồi token của user %s: %v\n", uid, err)
		return err
	}

	log.Printf("Đã thu hồi thành công phiên làm việc của user: %s\n", uid)
	return nil
}

func ProcessLocalRegister(db *gorm.DB, input LocalRegisterInput) (*User, string, error) {
	username := input.Username
	password := input.Password
	
	var user User
	err := db.Where("username = ?", username).First(&user).Error

	if err == nil {
		return nil, "", errors.New("username_already_exists")
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		hashedPassword, errHash := utils.HashPassword(password)
		if errHash != nil {
			return nil, "", errors.New("cannot_hash_password")
		}

		newUser := User{
			Username:  &username,
			Password:  &hashedPassword,
			Name:      username,
			Provider:  "local",
			Role:      "tourist",
			CreatedAt: time.Now(),
		}

		if err := db.Create(&newUser).Error; err != nil {
			log.Println("Lỗi khi tạo Local User trong DB:", err)
			return nil, "", err
		}

		// Tạo JWT token ngay sau khi đăng ký thành công
		token, err := utils.GenerateJWT(newUser.ID.String(), *newUser.Username)
		if err != nil {
			return nil, "", errors.New("cannot_generate_token")
		}

		return &newUser, token, nil
	}

	return nil, "", err
}

func ProcessLocalLogin(db *gorm.DB, input LocalLoginInput) (*User, string, error) {
	username := input.Username
	password := input.Password

	var user User
	err := db.Where("username = ?", username).First(&user).Error

	if err != nil {
		return nil, "", errors.New("invalid_credentials")
	}

	if user.Password == nil {
		return nil, "", errors.New("invalid_credentials")
	}

	if !utils.CheckPasswordHash(password, *user.Password) {
		return nil, "", errors.New("invalid_credentials")
	}
	// Khởi tạo JWT nếu khớp password
	token, err := utils.GenerateJWT(user.ID.String(), *user.Username)
	if err != nil {
		return nil, "", errors.New("cannot_generate_token")
	}

	return &user, token, nil
}

// ProcessChangePassword đổi mật khẩu cho user Local

func ProcessChangePassword(db *gorm.DB, userID string, input ChangePasswordInput) error {
	oldPassword := input.OldPassword
	newPassword := input.NewPassword
	confirmPassword := input.ConfirmPassword
	// Step 1: Lấy user từ DB theo user_id
	var user User
	err := db.Where("user_id = ?", userID).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user_not_found")
		}
		return err
	}

	// Step 2: Kiểm tra user có password không (user Google sẽ không có)
	if user.Password == nil {
		return errors.New("no_password_set")
	}

	// Step 3: Xác nhận mật khẩu cũ có đúng không
	if !utils.CheckPasswordHash(oldPassword, *user.Password) {
		return errors.New("wrong_old_password")
	}

	// Step 4: Kiểm tra new password và confirm password có khớp không
	if newPassword != confirmPassword {
		return errors.New("password_mismatch")
	}

	// Step 5: Không cho đặt lại password giống cũ
	if utils.CheckPasswordHash(newPassword, *user.Password) {
		return errors.New("same_password")
	}

	// Step 6: Hash password mới
	newHash, err := utils.HashPassword(newPassword)
	if err != nil {
		return errors.New("cannot_hash_password")
	}

	// Step 7: Update vào DB
	result := db.Model(&User{}).Where("user_id = ?", userID).Update("password", newHash)
	if result.Error != nil {
		return result.Error
	}

	return nil
}
