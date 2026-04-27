package location

import (
	"log"
	"net/http"
	"smart-travel-backend/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func FilterLocationHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		city := c.Query("city")
		category := c.Query("category")
		limit, offset := parsePagination(c)

		locations, total, err := FilterLocations(c.Request.Context(), db, city, category, limit, offset)
		if err != nil {
			log.Printf("[ERROR] FilterLocations: %v", err)
			utils.RespondError(c, http.StatusInternalServerError, "Lỗi khi tìm kiếm địa điểm", nil)
			return
		}

		if len(locations) == 0 {
			utils.RespondSuccess(c, http.StatusOK, "Không tìm thấy địa điểm nào phù hợp", gin.H{
				"data":  []Location{},
				"total": total,
				"page":  (offset / limit) + 1,
				"limit": limit,
			})
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Lấy danh sách địa điểm thành công", gin.H{
			"data":  locations,
			"total": total,
			"page":  (offset / limit) + 1,
			"limit": limit,
		})
	}
}

func GetAllLocationsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		limit, offset := parsePagination(c)

		locations, total, err := GetAllLocations(c.Request.Context(), db, limit, offset)
		if err != nil {
			log.Printf("[ERROR] GetAllLocations: %v", err)
			utils.RespondError(c, http.StatusInternalServerError, "Lỗi khi lấy danh sách địa điểm", nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Lấy toàn bộ địa điểm thành công", gin.H{
			"data":  locations,
			"total": total,
			"page":  (offset / limit) + 1,
			"limit": limit,
		})
	}
}

func parsePagination(c *gin.Context) (int, int) {
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page <= 0 {
		page = 1
	}

	offset := (page - 1) * limit
	return limit, offset
}
