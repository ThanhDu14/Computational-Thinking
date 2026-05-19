package weather

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"smart-travel-backend/config"
	"smart-travel-backend/utils"

	"github.com/gin-gonic/gin"
)

// GetWeatherByCityHandler gọi tới OpenWeather API để lấy thời tiết của một thành phố cụ thể
func GetWeatherByCityHandler() gin.HandlerFunc {
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

		// Encode city để xử lý các tên thành phố có khoảng trắng (VD: "Can Tho" -> "Can+Tho" hoặc "Can%20Tho")
		encodedCity := url.QueryEscape(city)

		// Gọi OpenWeather, sử dụng units=metric (độ C) và lang=vi (tiếng Việt)
		url := fmt.Sprintf("http://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric&lang=vi", encodedCity, apiKey)

		resp, err := http.Get(url)
		if err != nil {
			utils.RespondError(c, http.StatusBadGateway, "Lỗi kết nối đến dịch vụ thời tiết", nil)
			return
		}
		defer resp.Body.Close()

		var weatherData map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&weatherData); err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "Lỗi khi đọc dữ liệu thời tiết", nil)
			return
		}

		// Nếu status code không phải 200 OK (ví dụ: 404 City not found)
		if resp.StatusCode != http.StatusOK {
			message := "Không thể lấy thông tin thời tiết"
			if msg, ok := weatherData["message"].(string); ok {
				message = fmt.Sprintf("Lỗi từ OpenWeather: %s", msg)
			}
			utils.RespondError(c, resp.StatusCode, message, nil)
			return
		}

		utils.RespondSuccess(c, http.StatusOK, "Lấy thông tin thời tiết thành công", weatherData)
	}
}
