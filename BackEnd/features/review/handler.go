package review

import (
	"net/http"
	"path/filepath"
	"smart-travel-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// resolveUserID trích xuất user_id từ context (hỗ trợ cả Local JWT và Firebase SSO)
func resolveUserID(c *gin.Context, db *gorm.DB) (string, bool) {
	// Ưu tiên user_id (Local JWT)
	if userID, exists := c.Get("user_id"); exists {
		if uidStr, ok := userID.(string); ok {
			return uidStr, true
		}
	}

	// Fallback: Firebase UID → tìm user_id trong DB
	if firebaseUID, exists := c.Get("firebase_uid"); exists {
		if fbStr, ok := firebaseUID.(string); ok {
			type userRow struct {
				UserID uuid.UUID `gorm:"column:user_id"`
			}
			var row userRow
			if err := db.Table("users").Select("user_id").Where("firebase_uid = ?", fbStr).First(&row).Error; err == nil {
				return row.UserID.String(), true
			}
		}
	}

	return "", false
}

// CreateReviewHandler xử lý tạo review mới cho một địa điểm
func CreateReviewHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := resolveUserID(c, db)
		if !ok {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được danh tính người dùng", nil)
			return
		}

		var input CreateReviewInput
		if err := c.ShouldBindJSON(&input); err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Dữ liệu không hợp lệ: "+err.Error(), nil)
			return
		}

		review, err := CreateReviewService(db, userID, input)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, err.Error(), nil)
			return
		}

		// Chuẩn bị response
		images := []string{}
		for _, img := range review.Images {
			images = append(images, img.Image)
		}

		utils.RespondSuccess(c, http.StatusCreated, "Tạo review thành công", gin.H{
			"review_id":   review.ReviewID,
			"location_id": review.LocationID,
			"rating":      review.Rating,
			"comment":     review.Comment,
			"images":      images,
			"created_at":  review.CreatedAt,
		})
	}
}

// GetReviewsByLocationHandler lấy danh sách review của một địa điểm
func GetReviewsByLocationHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		locationID := c.Param("location_id")
		if locationID == "" {
			utils.RespondError(c, http.StatusBadRequest, "Thiếu location_id", nil)
			return
		}

		reviews, err := GetReviewsByLocationService(db, locationID)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, err.Error(), nil)
			return
		}

		// Chuẩn bị response
		var result []gin.H
		for _, r := range reviews {
			images := []string{}
			for _, img := range r.Images {
				images = append(images, img.Image)
			}
			result = append(result, gin.H{
				"review_id":   r.ReviewID,
				"user_id":     r.UserID,
				"location_id": r.LocationID,
				"rating":      r.Rating,
				"comment":     r.Comment,
				"images":      images,
				"created_at":  r.CreatedAt,
			})
		}

		// Nếu không có review nào, trả về mảng rỗng thay vì null
		if result == nil {
			result = []gin.H{}
		}

		utils.RespondSuccess(c, http.StatusOK, "Lấy danh sách review thành công", result)
	}
}

// GetMyReviewsHandler lấy danh sách review của user hiện tại
func GetMyReviewsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := resolveUserID(c, db)
		if !ok {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được danh tính người dùng", nil)
			return
		}

		reviews, err := GetMyReviewsService(db, userID)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, err.Error(), nil)
			return
		}

		var result []gin.H
		for _, r := range reviews {
			images := []string{}
			for _, img := range r.Images {
				images = append(images, img.Image)
			}
			result = append(result, gin.H{
				"review_id":   r.ReviewID,
				"location_id": r.LocationID,
				"rating":      r.Rating,
				"comment":     r.Comment,
				"images":      images,
				"created_at":  r.CreatedAt,
			})
		}

		if result == nil {
			result = []gin.H{}
		}

		utils.RespondSuccess(c, http.StatusOK, "Lấy danh sách review của bạn thành công", result)
	}
}

// UpdateReviewHandler cập nhật review (chỉ chủ sở hữu)
func UpdateReviewHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := resolveUserID(c, db)
		if !ok {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được danh tính người dùng", nil)
			return
		}

		reviewID := c.Param("review_id")
		if reviewID == "" {
			utils.RespondError(c, http.StatusBadRequest, "Thiếu review_id", nil)
			return
		}

		var input UpdateReviewInput
		if err := c.ShouldBindJSON(&input); err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Dữ liệu không hợp lệ: "+err.Error(), nil)
			return
		}

		if err := UpdateReviewService(db, reviewID, userID, input); err != nil {
			if err.Error() == "không tìm thấy review hoặc bạn không có quyền chỉnh sửa" {
				utils.RespondError(c, http.StatusNotFound, err.Error(), nil)
				return
			}
			utils.RespondError(c, http.StatusInternalServerError, err.Error(), nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Cập nhật review thành công", nil)
	}
}

// DeleteReviewHandler xóa review (chỉ chủ sở hữu)
func DeleteReviewHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := resolveUserID(c, db)
		if !ok {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được danh tính người dùng", nil)
			return
		}

		reviewID := c.Param("review_id")
		if reviewID == "" {
			utils.RespondError(c, http.StatusBadRequest, "Thiếu review_id", nil)
			return
		}

		if err := DeleteReviewService(db, reviewID, userID); err != nil {
			if err.Error() == "không tìm thấy review hoặc bạn không có quyền xóa" {
				utils.RespondError(c, http.StatusNotFound, err.Error(), nil)
				return
			}
			utils.RespondError(c, http.StatusInternalServerError, err.Error(), nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Xóa review thành công", nil)
	}
}

// UploadReviewImageHandler upload nhiều ảnh review lên Cloudinary cùng lúc
func UploadReviewImageHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Lấy toàn bộ files từ form-data với key "files"
		form, err := c.MultipartForm()
		if err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Không thể đọc dữ liệu form: "+err.Error(), nil)
			return
		}

		files := form.File["files"]
		if len(files) == 0 {
			utils.RespondError(c, http.StatusBadRequest, "Không tìm thấy file tải lên. Vui lòng dùng key 'files' trong form-data.", nil)
			return
		}

		// Giới hạn tối đa 5 ảnh mỗi lần upload
		if len(files) > 5 {
			utils.RespondError(c, http.StatusBadRequest, "Chỉ được upload tối đa 5 ảnh mỗi lần.", nil)
			return
		}

		const maxUploadSize = 10 << 20 // 10 MB mỗi file
		var imageURLs []string

		for _, fileHeader := range files {
			// 2. Validate dung lượng từng file
			if fileHeader.Size > maxUploadSize {
				utils.RespondError(c, http.StatusBadRequest, "File '"+fileHeader.Filename+"' vượt quá giới hạn 10MB.", nil)
				return
			}

			// 3. Mở file stream
			file, err := fileHeader.Open()
			if err != nil {
				utils.RespondError(c, http.StatusInternalServerError, "Không thể xử lý file: "+fileHeader.Filename, nil)
				return
			}

			// 4. Tạo tên file duy nhất
			ext := filepath.Ext(fileHeader.Filename)
			uniqueFilename := uuid.New().String() + ext

			// 5. Upload lên Cloudinary
			imageURL, err := utils.UploadReviewImageToCloudinary(file, uniqueFilename)
			file.Close() // Đóng file ngay sau khi upload xong
			if err != nil {
				utils.RespondError(c, http.StatusInternalServerError, "Tải ảnh '"+fileHeader.Filename+"' thất bại: "+err.Error(), nil)
				return
			}

			imageURLs = append(imageURLs, imageURL)
		}

		// 6. Trả về danh sách URL ảnh
		utils.RespondSuccess(c, http.StatusOK, "Tải ảnh review thành công", gin.H{
			"image_urls": imageURLs,
		})
	}
}
