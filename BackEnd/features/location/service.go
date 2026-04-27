package location

import (
	"context"
	"strings"

	"gorm.io/gorm"
)

func FilterLocations(ctx context.Context, db *gorm.DB, city string, categoryName string, limit int, offset int) ([]Location, int64, error) {
	var locations []Location
	var total int64

	query := db.WithContext(ctx).Model(&Location{}).Preload("Categories")

	if city != "" {
		cityNoSpace := strings.ReplaceAll(city, " ", "")
		query = query.Where("REPLACE(unaccent(city), ' ', '') ILIKE unaccent(?)", "%"+cityNoSpace+"%")
	}

	if categoryName != "" {
		query = query.Joins("JOIN locationcategories ON locationcategories.location_id = locations.location_id").
			Joins("JOIN categories ON categories.category_id = locationcategories.category_id").
			Where("unaccent(categories.category_name) ILIKE unaccent(?)", "%"+categoryName+"%")
	}

	query.Count(&total)

	err := query.Limit(limit).Offset(offset).Find(&locations).Error
	return locations, total, err
}

func GetAllLocations(ctx context.Context, db *gorm.DB, limit int, offset int) ([]Location, int64, error) {
	var locations []Location
	var total int64

	query := db.WithContext(ctx).Model(&Location{}).Preload("Categories")
	query.Count(&total)

	err := query.Limit(limit).Offset(offset).Find(&locations).Error
	return locations, total, err
}
