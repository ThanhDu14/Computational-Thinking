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

func ProcessLocalRegister(db *gorm.DB, username, password string) (*User, error) {
	var user User
	err := db.Where("username = ?", username).First(&user).Error

	if err == nil {
		return nil, errors.New("username_already_exists")
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		hashedPassword, errHash := utils.HashPassword(password)
		if errHash != nil {
			return nil, errors.New("cannot_hash_password")
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
			return nil, err
		}
		return &newUser, nil
	}

	return nil, err
}

func ProcessLocalLogin(db *gorm.DB, username, password string) (*User, string, error) {
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
