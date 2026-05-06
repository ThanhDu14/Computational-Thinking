package review

import (
	"errors"
	"math"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ===== DTO (Data Transfer Object) =====

// CreateReviewInput là dữ liệu nhận từ Frontend khi tạo review
type CreateReviewInput struct {
	LocationID string   `json:"location_id" binding:"required"`
	Rating     float64  `json:"rating" binding:"required,min=1,max=5"`
	Comment    string   `json:"comment"`
	Images     []string `json:"images"` // Mảng URL ảnh (đã upload trước đó)
}

// UpdateReviewInput là dữ liệu nhận từ Frontend khi cập nhật review
type UpdateReviewInput struct {
	Rating  *float64 `json:"rating" binding:"omitempty,min=1,max=5"`
	Comment *string  `json:"comment"`
	Images  []string `json:"images"` // Thay thế toàn bộ ảnh cũ bằng ảnh mới
}

// ReviewResponse là cấu trúc trả về cho Frontend (bao gồm thông tin user)
type ReviewResponse struct {
	ReviewID   uuid.UUID `json:"review_id"`
	UserID     uuid.UUID `json:"user_id"`
	LocationID uuid.UUID `json:"location_id"`
	Rating     float64   `json:"rating"`
	Comment    string    `json:"comment"`
	CreatedAt  string    `json:"created_at"`
	Images     []string  `json:"images"`
}

// ===== SERVICE FUNCTIONS =====

// CreateReviewService tạo review mới cho một địa điểm
func CreateReviewService(db *gorm.DB, userID string, input CreateReviewInput) (*Review, error) {
	// Parse UUID
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("user_id không hợp lệ")
	}
	parsedLocationID, err := uuid.Parse(input.LocationID)
	if err != nil {
		return nil, errors.New("location_id không hợp lệ")
	}

	// Làm tròn rating đến 1 chữ số thập phân
	roundedRating := math.Round(input.Rating*10) / 10

	// Tạo review
	review := Review{
		UserID:     parsedUserID,
		LocationID: parsedLocationID,
		Rating:     roundedRating,
		Comment:    input.Comment,
	}

	// Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
	err = db.Transaction(func(tx *gorm.DB) error {
		// 1. Tạo review
		if err := tx.Create(&review).Error; err != nil {
			return errors.New("không thể tạo review: " + err.Error())
		}

		// 2. Tạo các bản ghi ảnh nếu có
		if len(input.Images) > 0 {
			var images []ReviewImage
			for _, imgURL := range input.Images {
				images = append(images, ReviewImage{
					ReviewID: review.ReviewID,
					Image:    imgURL,
				})
			}
			if err := tx.Create(&images).Error; err != nil {
				return errors.New("không thể lưu ảnh review: " + err.Error())
			}
			review.Images = images
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &review, nil
}

// GetReviewsByLocationService lấy danh sách review theo location_id
func GetReviewsByLocationService(db *gorm.DB, locationID string) ([]Review, error) {
	parsedLocationID, err := uuid.Parse(locationID)
	if err != nil {
		return nil, errors.New("location_id không hợp lệ")
	}

	var reviews []Review
	if err := db.Where("location_id = ?", parsedLocationID).
		Preload("Images").
		Order("created_at DESC").
		Find(&reviews).Error; err != nil {
		return nil, errors.New("lỗi khi truy xuất danh sách review")
	}

	return reviews, nil
}

// GetMyReviewsService lấy danh sách review của user hiện tại
func GetMyReviewsService(db *gorm.DB, userID string) ([]Review, error) {
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("user_id không hợp lệ")
	}

	var reviews []Review
	if err := db.Where("user_id = ?", parsedUserID).
		Preload("Images").
		Order("created_at DESC").
		Find(&reviews).Error; err != nil {
		return nil, errors.New("lỗi khi truy xuất danh sách review của bạn")
	}

	return reviews, nil
}

// UpdateReviewService cập nhật review (chỉ chủ sở hữu mới được sửa)
func UpdateReviewService(db *gorm.DB, reviewID string, userID string, input UpdateReviewInput) error {
	parsedReviewID, err := uuid.Parse(reviewID)
	if err != nil {
		return errors.New("review_id không hợp lệ")
	}
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("user_id không hợp lệ")
	}

	// Kiểm tra review tồn tại và thuộc về user
	var review Review
	if err := db.Where("review_id = ? AND user_id = ?", parsedReviewID, parsedUserID).First(&review).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("không tìm thấy review hoặc bạn không có quyền chỉnh sửa")
		}
		return errors.New("lỗi truy xuất cơ sở dữ liệu")
	}

	// Sử dụng Transaction
	return db.Transaction(func(tx *gorm.DB) error {
		updates := make(map[string]interface{})

		if input.Rating != nil {
			updates["rating"] = math.Round(*input.Rating*10) / 10
		}
		if input.Comment != nil {
			updates["comment"] = *input.Comment
		}

		// Cập nhật các field review
		if len(updates) > 0 {
			if err := tx.Model(&review).Updates(updates).Error; err != nil {
				return errors.New("không thể cập nhật review: " + err.Error())
			}
		}

		// Cập nhật ảnh: xóa ảnh cũ → thêm ảnh mới
		if input.Images != nil {
			// Xóa toàn bộ ảnh cũ
			if err := tx.Where("review_id = ?", parsedReviewID).Delete(&ReviewImage{}).Error; err != nil {
				return errors.New("không thể xóa ảnh cũ: " + err.Error())
			}

			// Thêm ảnh mới
			if len(input.Images) > 0 {
				var images []ReviewImage
				for _, imgURL := range input.Images {
					images = append(images, ReviewImage{
						ReviewID: parsedReviewID,
						Image:    imgURL,
					})
				}
				if err := tx.Create(&images).Error; err != nil {
					return errors.New("không thể lưu ảnh mới: " + err.Error())
				}
			}
		}

		return nil
	})
}

// DeleteReviewService xóa review (chỉ chủ sở hữu mới được xóa)
func DeleteReviewService(db *gorm.DB, reviewID string, userID string) error {
	parsedReviewID, err := uuid.Parse(reviewID)
	if err != nil {
		return errors.New("review_id không hợp lệ")
	}
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("user_id không hợp lệ")
	}

	// Kiểm tra review tồn tại và thuộc về user
	var review Review
	if err := db.Where("review_id = ? AND user_id = ?", parsedReviewID, parsedUserID).First(&review).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("không tìm thấy review hoặc bạn không có quyền xóa")
		}
		return errors.New("lỗi truy xuất cơ sở dữ liệu")
	}

	// Xóa trong Transaction (ảnh trước, review sau)
	return db.Transaction(func(tx *gorm.DB) error {
		// Xóa ảnh
		if err := tx.Where("review_id = ?", parsedReviewID).Delete(&ReviewImage{}).Error; err != nil {
			return errors.New("không thể xóa ảnh review: " + err.Error())
		}
		// Xóa review
		if err := tx.Delete(&review).Error; err != nil {
			return errors.New("không thể xóa review: " + err.Error())
		}
		return nil
	})
}
