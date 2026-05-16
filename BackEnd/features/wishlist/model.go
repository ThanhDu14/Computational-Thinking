package wishlist

import (
	"github.com/google/uuid"
)

type Wishlist struct {
	UserID     uuid.UUID `gorm:"column:user_id;type:uuid;primaryKey" json:"user_id"`
	LocationID uuid.UUID `gorm:"column:location_id;type:uuid;primaryKey" json:"location_id"`
}

func (Wishlist) TableName() string {
	return "wishlist"
}
