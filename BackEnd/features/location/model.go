package location

import (
	"time"

	"github.com/google/uuid"
)

// Location đại diện cho bảng 'location' (Khớp hoàn toàn với ảnh của bạn)
type Location struct {
	ID              uuid.UUID `gorm:"column:location_id;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name            string    `gorm:"column:name;type:varchar(255);not null" json:"name"`
	Latitude        float64   `gorm:"column:latitude;type:numeric" json:"latitude"`
	Longitude       float64   `gorm:"column:longitude;type:numeric" json:"longitude"`
	DurationMinutes int       `gorm:"column:duration_minutes;type:int4" json:"duration_minutes"`
	OpeningHours    string    `gorm:"column:opening_hours_json;type:text" json:"opening_hours"`
	Address         string    `gorm:"column:address;type:text" json:"address"`
	Rating          float64   `gorm:"column:rating;type:float8" json:"rating"`
	CountRating     int       `gorm:"column:count_rating;type:int4" json:"count_rating"`
	Description     string    `gorm:"column:description;type:text" json:"description"`
	
	City            string    `gorm:"column:city;type:varchar(100);index" json:"city"`
	
	CreatedAt       time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

	// Quan hệ Nhiều-Nhiều với Category
	Categories []Category `gorm:"many2many:locationcategories;foreignKey:ID;joinForeignKey:location_id;References:ID;joinReferences:category_id" json:"categories"`
}

func (Location) TableName() string {
	return "locations"
}

// Category đại diện cho bảng 'categories'
type Category struct {
	ID           uuid.UUID `gorm:"column:category_id;primaryKey;default:uuid_generate_v4()" json:"id"`
	CategoryName string    `gorm:"column:category_name;type:varchar(100);unique;not null" json:"category_name"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
}

func (Category) TableName() string {
	return "categories"
}

// LocationCategory đại diện cho bảng trung gian 'locationcategories'
type LocationCategory struct {
	LocationID uuid.UUID `gorm:"column:location_id;primaryKey"`
	CategoryID uuid.UUID `gorm:"column:category_id;primaryKey"`
}

func (LocationCategory) TableName() string {
	return "locationcategories"
}
