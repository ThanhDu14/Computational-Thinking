package model

import "time"

// User là domain model - map thẳng với bảng users trong DB
type User struct {
	UserID      string    `gorm:"column:user_id;primaryKey;type:uuid"`
	FirebaseUID *string   `gorm:"column:firebase_uid"`
	Email       *string   `gorm:"column:email"`
	Username    string    `gorm:"column:username;not null"`
	Password    string    `gorm:"column:password;not null"`
	Name        *string   `gorm:"column:name"`
	AvatarURL   *string   `gorm:"column:avatar_url"`
	PhoneNumber *string   `gorm:"column:phone_number"`
	Provider    *string   `gorm:"column:provider"`
	Role        *string   `gorm:"column:role"`
	ID          string    `gorm:"column:id;type:uuid"` // Cột id xuất hiện ở cuối hình 2 của bạn
	CreatedAt   time.Time `gorm:"column:created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at"`
}