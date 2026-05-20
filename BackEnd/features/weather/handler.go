package weather

import (
	"net/http"
	"regexp"
	"strings"

	"smart-travel-backend/config"
	"smart-travel-backend/utils"

	"github.com/gin-gonic/gin"
)

// GetWeatherForecastHandler gọi service để lấy thời tiết 3 ngày tới
func GetWeatherForecastHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		city := c.Query("city")
		if city == "" {
			utils.RespondError(c, http.StatusBadRequest, "Thiếu tham số city (ví dụ: ?city=Hanoi)", nil)
			return
		}

		apiKey := config.GetEnv("OPENWEATHER_KEY", "")
		if apiKey == "" {
			utils.RespondError(c, http.StatusInternalServerError, "Chưa cấu hình OPENWEATHER_KEY", nil)
			return
		}

		// Tự động thêm khoảng trắng cho các từ viết hoa liền nhau (VD: "CanTho" -> "Can Tho", "HoChiMinh" -> "Ho Chi Minh")
		formattedCity := city
		if !strings.Contains(formattedCity, " ") {
			re := regexp.MustCompile(`([a-z])([A-Z])`)
			formattedCity = re.ReplaceAllString(formattedCity, `${1} ${2}`)
		}

		result, err := Get3DaysForecast(formattedCity, apiKey)
		if err != nil {
			utils.RespondError(c, http.StatusBadGateway, err.Error(), nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Lấy dự báo thời tiết 3 ngày thành công", result)
	}
}
