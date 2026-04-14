package auth

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID uuid.UUID `gorm:"column:user_id;primaryKey;default:uuid_generate_v4()" json:"id"`
	// Dữ liệu từ Firebase
	FirebaseUID *string `gorm:"column:firebase_uid" json:"firebase_uid"`
	Email       *string `gorm:"column:email" json:"email"`

	// Dữ liệu Tự code Auth Local
	Username *string `gorm:"column:username" json:"username"`
	Password *string `gorm:"column:password" json:"-"`

	// Dữ liệu dùng chung
	Name      string    `gorm:"column:name" json:"name"`
	Provider  string    `gorm:"column:provider" json:"provider"`
	Role      string    `gorm:"column:role" json:"role"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
}
