package destination

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Destination struct {
	ID            uuid.UUID      `gorm:"column:destination_id;primaryKey;default:uuid_generate_v4()" json:"id"`
	LocationName  string         `gorm:"column:location_name;type:varchar(255);not null" json:"location_name"`
	Address       string         `gorm:"column:address;type:text" json:"address"`
	OverallRating string         `gorm:"column:overall_rating;type:varchar(20)" json:"overall_rating"`
	RatingCount   string         `gorm:"column:rating_count;type:varchar(20)" json:"rating_count"`
	OpeningHours  string         `gorm:"column:opening_hours;type:varchar(255)" json:"opening_hours"`
	Description   string         `gorm:"column:description;type:text" json:"description"`
	Images        datatypes.JSON `gorm:"column:images;type:jsonb;default:'[]'" json:"images"`
	Category      datatypes.JSON `gorm:"column:category;type:jsonb;default:'[]'" json:"category"`
	City          string         `gorm:"column:city;type:varchar(100);index" json:"city"`
	CreatedAt     time.Time      `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (Destination) TableName() string {
	return "destinations"
}
