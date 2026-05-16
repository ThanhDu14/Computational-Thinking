package wishlist

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ===== DTO (Data Transfer Object) =====

// AddWishlistInput là dữ liệu nhận từ Frontend khi thêm địa điểm vào wishlist
type AddWishlistInput struct {
	LocationID string `json:"location_id" binding:"required"`
}

// WishlistResponse là cấu trúc trả về cho Frontend
type WishlistResponse struct {
	LocationID uuid.UUID `json:"location_id"`
}

// ===== SERVICE FUNCTIONS =====

// AddToWishlistService thêm một địa điểm vào wishlist của user
func AddToWishlistService(db *gorm.DB, userID string, input AddWishlistInput) (*Wishlist, error) {
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("user_id không hợp lệ")
	}
	parsedLocationID, err := uuid.Parse(input.LocationID)
	if err != nil {
		return nil, errors.New("location_id không hợp lệ")
	}

	// Kiểm tra xem địa điểm đã có trong wishlist chưa
	var existing Wishlist
	if err := db.Where("user_id = ? AND location_id = ?", parsedUserID, parsedLocationID).First(&existing).Error; err == nil {
		return nil, errors.New("địa điểm này đã có trong wishlist của bạn")
	}

	wishlist := Wishlist{
		UserID:     parsedUserID,
		LocationID: parsedLocationID,
	}

	if err := db.Create(&wishlist).Error; err != nil {
		return nil, errors.New("không thể thêm vào wishlist: " + err.Error())
	}

	return &wishlist, nil
}

// GetMyWishlistService lấy danh sách wishlist của user hiện tại
func GetMyWishlistService(db *gorm.DB, userID string) ([]Wishlist, error) {
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("user_id không hợp lệ")
	}

	var wishlists []Wishlist
	if err := db.Where("user_id = ?", parsedUserID).
		Find(&wishlists).Error; err != nil {
		return nil, errors.New("lỗi khi truy xuất danh sách wishlist")
	}

	return wishlists, nil
}

// RemoveFromWishlistService xóa một địa điểm khỏi wishlist của user
func RemoveFromWishlistService(db *gorm.DB, userID string, locationID string) error {
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("user_id không hợp lệ")
	}
	parsedLocationID, err := uuid.Parse(locationID)
	if err != nil {
		return errors.New("location_id không hợp lệ")
	}

	result := db.Where("user_id = ? AND location_id = ?", parsedUserID, parsedLocationID).Delete(&Wishlist{})
	if result.Error != nil {
		return errors.New("không thể xóa khỏi wishlist: " + result.Error.Error())
	}
	if result.RowsAffected == 0 {
		return errors.New("không tìm thấy địa điểm này trong wishlist của bạn")
	}

	return nil
}

// CheckWishlistService kiểm tra xem một địa điểm có trong wishlist của user không
func CheckWishlistService(db *gorm.DB, userID string, locationID string) (bool, error) {
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return false, errors.New("user_id không hợp lệ")
	}
	parsedLocationID, err := uuid.Parse(locationID)
	if err != nil {
		return false, errors.New("location_id không hợp lệ")
	}

	var count int64
	if err := db.Model(&Wishlist{}).
		Where("user_id = ? AND location_id = ?", parsedUserID, parsedLocationID).
		Count(&count).Error; err != nil {
		return false, errors.New("lỗi khi kiểm tra wishlist")
	}

	return count > 0, nil
}
