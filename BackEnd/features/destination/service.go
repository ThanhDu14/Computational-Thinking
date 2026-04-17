package destination

import (
	"gorm.io/gorm"
)

func FilterDestinations(db *gorm.DB, city string, category string) ([]Destination, error) {
	var destinations []Destination

	query := db.Model(&Destination{})

	// Lọc theo thành phố (City) - Nếu rỗng thì bỏ qua
	if city != "" {
		query = query.Where("city ILIKE ?", "%"+city+"%")
	}

	// Lọc theo thể loại (Category) - Sử dụng toán tử @> cho JSONB if using Postgres
	// Tuy nhiên để an toàn và linh hoạt, ta có thể lọc cơ bản bằng LIKE nếu là text, 
	// hoặc JSONB logic nếu chắc chắn là Postgres.
	if category != "" {
		query = query.Where("category::text ILIKE ?", "%"+category+"%")
	}

	err := query.Find(&destinations).Error
	return destinations, err
}

func GetAllDestinations(db *gorm.DB) ([]Destination, error) {
	var destinations []Destination
	err := db.Find(&destinations).Error
	return destinations, err
}
