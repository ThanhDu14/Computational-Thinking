package review

import (
	"time"

	"github.com/google/uuid"
)

type Review struct {
	ReviewID   uuid.UUID     `gorm:"column:review_id;primaryKey;default:uuid_generate_v4()" json:"review_id"`
	UserID     uuid.UUID     `gorm:"column:user_id;type:uuid" json:"user_id"`
	LocationID uuid.UUID     `gorm:"column:location_id;type:uuid" json:"location_id"`
	Rating     float64       `gorm:"column:rating;type:float8" json:"rating"`
	Comment    string        `gorm:"column:comment;type:text" json:"comment"`
	CreatedAt  time.Time     `gorm:"column:created_at" json:"created_at"`
	Images     []ReviewImage `gorm:"foreignKey:ReviewID;references:ReviewID" json:"images"`
}

func (Review) TableName() string {
	return "review"
}

type ReviewImage struct {
	ReviewID uuid.UUID `gorm:"column:review_id;type:uuid;primaryKey" json:"review_id"`
	Image    string    `gorm:"column:image;type:text;primaryKey" json:"image"`
}

func (ReviewImage) TableName() string {
	return "reviewimages"
}
