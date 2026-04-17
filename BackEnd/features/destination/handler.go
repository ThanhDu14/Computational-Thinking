package destination

import (
	"net/http"
	"smart-travel-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func FilterDestinationHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lấy city từ Path Parameter
		city := c.Param("city")
		
		// Lấy category từ Query Parameter (nếu có, ví dụ: ?category=Văn hóa)
		category := c.Query("category")

		destinations, err := FilterDestinations(db, city, category)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "Lỗi khi tìm kiếm điểm đến: "+err.Error(), nil)
			return
		}

		if len(destinations) == 0 {
			utils.RespondSuccess(c, http.StatusOK, "Không tìm thấy điểm đến nào phù hợp", []Destination{})
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Lấy danh sách điểm đến thành công", destinations)
	}
}

func GetAllDestinationsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		destinations, err := GetAllDestinations(db)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "Lỗi khi lấy danh sách điểm đến", nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Lấy toàn bộ điểm đến thành công", destinations)
	}
}
