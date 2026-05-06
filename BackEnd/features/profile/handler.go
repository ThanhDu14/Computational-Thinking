package profile

import (
	"net/http"
	"path/filepath"
	"smart-travel-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UploaderAvatarHandler xử lý request tải ảnh đại diện
func UploadAvatarHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Lấy file từ request form-data với key là "file"
		fileHeader, err := c.FormFile("file")
		if err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Không tìm thấy file tải lên hợp lệ.", nil)
			return
		}

		// 2. Validate dung lượng file (Giới hạn 5MB)
		const maxUploadSize = 5 << 20 // 5 MB
		if fileHeader.Size > maxUploadSize {
			utils.RespondError(c, http.StatusBadRequest, "Dung lượng file vượt quá giới hạn 5MB.", nil)
			return
		}

		// 3. Mở file stream
		file, err := fileHeader.Open()
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "Không thể xử lý file tải lên.", nil)
			return
		}
		defer file.Close() // Bắt buộc phải đóng file để giải phóng memory

		// 4. Tạo tên file duy nhất chống ghi đè
		ext := filepath.Ext(fileHeader.Filename)
		uniqueFilename := uuid.New().String() + ext

		// 5. Gọi hàm Utils để đẩy lên Cloudinary
		avatarURL, err := utils.UploadAvatarToCloudinary(file, uniqueFilename)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "Tải ảnh lên hệ thống Cloud thất bại.", nil)
			return
		}

		// 6. Trả về Response theo đúng chuẩn Base Template
		utils.RespondSuccess(c, http.StatusOK, "Tải ảnh thành công", gin.H{
			"avatar_url": avatarURL,
		})
	}
}

// UpdateProfileHandler xử lý request
func UpdateProfileHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Xác định ID (Có thể là user_id cho Local hoặc firebase_uid cho Google)
		userID, exists := c.Get("user_id")
		firebaseUID, fbExists := c.Get("firebase_uid")

		var lookupField, lookupValue string
		if exists {
			uidStr, ok := userID.(string)
			if !ok {
				utils.RespondError(c, http.StatusInternalServerError, "Lỗi định dạng userID trong hệ thống", nil)
				return
			}
			lookupField = "user_id"
			lookupValue = uidStr
		} else if fbExists {
			fbStr, ok := firebaseUID.(string)
			if !ok {
				utils.RespondError(c, http.StatusInternalServerError, "Lỗi định dạng firebaseUID trong hệ thống", nil)
				return
			}
			lookupField = "firebase_uid"
			lookupValue = fbStr
		} else {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được danh tính người dùng", nil)
			return
		}

		// 2. Nhận dữ liệu JSON (Frontend chỉ cần gửi chuỗi URL ảnh)
		var input UpdateProfileInput
		if err := c.ShouldBindJSON(&input); err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Dữ liệu không hợp lệ: "+err.Error(), nil)
			return
		}

		// 3. Gọi Service để xử lý
		if err := UpdateUserProfileService(db, lookupField, lookupValue, input); err != nil {
			if err.Error() == "không tìm thấy người dùng này" {
				utils.RespondError(c, http.StatusNotFound, err.Error(), nil)
				return
			}
			if err.Error() == "email này đã được sử dụng bởi một tài khoản khác" {
				utils.RespondError(c, http.StatusConflict, err.Error(), nil)
				return
			}
			utils.RespondError(c, http.StatusInternalServerError, err.Error(), nil)
			return
		}

		// 4. Trả về thành công
		utils.RespondSuccess(c, http.StatusOK, "Cập nhật thông tin profile thành công", nil)
	}
}

// Hàm lấy thông tin DB để cho frontEnd cập nhật dữ liệu
func GetMyProfileHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Xác định ID (Có thể là user_id cho Local hoặc firebase_uid cho Google)
		userID, exists := c.Get("user_id")
		firebaseUID, fbExists := c.Get("firebase_uid")

		var query *gorm.DB
		if exists {
			query = db.Where("user_id = ?", userID)
		} else if fbExists {
			query = db.Where("firebase_uid = ?", firebaseUID)
		} else {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được danh tính người dùng", nil)
			return
		}

		// 2. Truy vấn DB
		var user User
		if err := query.Select("avatar", "display_name", "phone_number", "bio", "travel_preferences", "email").
			First(&user).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				utils.RespondError(c, http.StatusNotFound, "Không tìm thấy người dùng này", nil)
				return
			}
			utils.RespondError(c, http.StatusInternalServerError, "Lỗi hệ thống", nil)
			return
		}

		// 3. Trả về thông tin (Chỉ chọn lọc các trường cần thiết cho Frontend)
		utils.RespondSuccess(c, http.StatusOK, "Lấy thông tin profile thành công", gin.H{
			"avatar":             user.Avatar,
			"display_name":       user.DisplayName,
			"phone_number":       user.PhoneNumber,
			"bio":                user.Bio,
			"travel_preferences": user.TravelPreferences,
			"email":              user.Email,
		})
	}
}
