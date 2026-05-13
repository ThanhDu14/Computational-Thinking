package profile

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type User struct {
	ID          uuid.UUID `gorm:"column:user_id;primaryKey;default:uuid_generate_v4()" json:"id"`
	FirebaseUID *string   `gorm:"column:firebase_uid" json:"firebase_uid"`
	Email       *string   `gorm:"column:email;type:varchar(100);unique" json:"email"`
	Username    *string   `gorm:"column:username" json:"username"`
	Password    *string   `gorm:"column:password" json:"-"`
	Name        string    `gorm:"column:name" json:"name"`
	Provider    string    `gorm:"column:provider" json:"provider"`
	Role        string    `gorm:"column:role" json:"role"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at" json:"updated_at"`

	Avatar            string         `gorm:"type:text" json:"avatar"`
	DisplayName       string         `gorm:"type:varchar(100)" json:"display_name"`
	PhoneNumber       string         `gorm:"type:varchar(20)" json:"phone_number"`
	Bio               string         `gorm:"type:text" json:"bio"`
	TravelPreferences datatypes.JSON `gorm:"type:jsonb;default:'[]'" json:"travel_preferences"`
}

func (User) TableName() string {
	return "users"
}
