package location

import (
	"context"
	"strings"

	"gorm.io/gorm"
)

func FilterLocations(ctx context.Context, db *gorm.DB, city string, categoryName string, limit int, offset int) ([]Location, int64, error) {
	var locations []Location
	var total int64

	query := db.WithContext(ctx).Model(&Location{}).Preload("Categories").Preload("Images")

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

	query := db.WithContext(ctx).Model(&Location{}).Preload("Categories").Preload("Images")
	query.Count(&total)

	err := query.Limit(limit).Offset(offset).Find(&locations).Error
	return locations, total, err
}

func GetLocationByID(ctx context.Context, db *gorm.DB, id string) (*Location, error) {
	var location Location
	err := db.WithContext(ctx).Model(&Location{}).Preload("Categories").Preload("Images").Where("location_id = ?", id).First(&location).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

func SearchLocations(ctx context.Context, db *gorm.DB, keyword string, city string, categoryName string, limit int, offset int) ([]Location, int64, error) {
	var locations []Location
	var total int64

	query := db.WithContext(ctx).Model(&Location{}).Preload("Categories").Preload("Images")

	query = query.Where("unaccent(name) ILIKE unaccent(?)", "%"+keyword+"%")

	if city != "" {
		cityNoSpace := strings.ReplaceAll(city, " ", "")
		query = query.Where("REPLACE(unaccent(city), ' ', '') ILIKE unaccent(?)", "%"+cityNoSpace+"%")
	}

	if categoryName != "" {
		query = query.Where(
			"location_id IN (SELECT lc.location_id FROM locationcategories lc "+
				"JOIN categories c ON c.category_id = lc.category_id "+
				"WHERE unaccent(c.category_name) ILIKE unaccent(?))", "%"+categoryName+"%",
		)
	}

	query.Count(&total)

	err := query.Order("rating DESC").Limit(limit).Offset(offset).Find(&locations).Error
	return locations, total, err
}
