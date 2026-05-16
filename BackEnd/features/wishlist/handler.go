package wishlist

import (
	"net/http"
	"smart-travel-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// resolveUserID trích xuất user_id từ context
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

func AddToWishlistHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := resolveUserID(c, db)
		if !ok {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được danh tính người dùng", nil)
			return
		}

		var input AddWishlistInput
		if err := c.ShouldBindJSON(&input); err != nil {
			utils.RespondError(c, http.StatusBadRequest, "Dữ liệu không hợp lệ: "+err.Error(), nil)
			return
		}

		wishlist, err := AddToWishlistService(db, userID, input)
		if err != nil {
			if err.Error() == "địa điểm này đã có trong wishlist của bạn" {
				utils.RespondError(c, http.StatusConflict, err.Error(), nil)
				return
			}
			utils.RespondError(c, http.StatusInternalServerError, err.Error(), nil)
			return
		}

		utils.RespondSuccess(c, http.StatusCreated, "Đã thêm vào wishlist thành công", gin.H{
			"user_id":     wishlist.UserID,
			"location_id": wishlist.LocationID,
		})
	}
}

func GetMyWishlistHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := resolveUserID(c, db)
		if !ok {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được danh tính người dùng", nil)
			return
		}

		wishlists, err := GetMyWishlistService(db, userID)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, err.Error(), nil)
			return
		}

		var result []gin.H
		for _, w := range wishlists {
			result = append(result, gin.H{
				"location_id": w.LocationID,
			})
		}

		// Nếu không có item nào, trả về mảng rỗng thay vì null
		if result == nil {
			result = []gin.H{}
		}

		utils.RespondSuccess(c, http.StatusOK, "Lấy danh sách wishlist thành công", result)
	}
}

func RemoveFromWishlistHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := resolveUserID(c, db)
		if !ok {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được danh tính người dùng", nil)
			return
		}

		locationID := c.Param("location_id")
		if locationID == "" {
			utils.RespondError(c, http.StatusBadRequest, "Thiếu location_id", nil)
			return
		}

		if err := RemoveFromWishlistService(db, userID, locationID); err != nil {
			if err.Error() == "không tìm thấy địa điểm này trong wishlist của bạn" {
				utils.RespondError(c, http.StatusNotFound, err.Error(), nil)
				return
			}
			utils.RespondError(c, http.StatusInternalServerError, err.Error(), nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Đã xóa khỏi wishlist thành công", nil)
	}
}

func CheckWishlistHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := resolveUserID(c, db)
		if !ok {
			utils.RespondError(c, http.StatusUnauthorized, "Không xác định được danh tính người dùng", nil)
			return
		}

		locationID := c.Param("location_id")
		if locationID == "" {
			utils.RespondError(c, http.StatusBadRequest, "Thiếu location_id", nil)
			return
		}

		isInWishlist, err := CheckWishlistService(db, userID, locationID)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, err.Error(), nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Kiểm tra wishlist thành công", gin.H{
			"location_id":    locationID,
			"is_in_wishlist": isInWishlist,
		})
	}
}
