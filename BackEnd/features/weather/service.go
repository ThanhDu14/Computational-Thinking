package weather

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

// Struct hứng dữ liệu từ OpenWeather
type WeatherForecastResponse struct {
	List []struct {
		DtTxt string `json:"dt_txt"` // Ví dụ: "2026-05-20 12:00:00"
		Main  struct {
			TempMin float64 `json:"temp_min"`
			TempMax float64 `json:"temp_max"`
		} `json:"main"`
		Weather []struct {
			Description string `json:"description"`
			Icon        string `json:"icon"`
		} `json:"weather"`
	} `json:"list"`
}

// Struct kết quả trả về cho Frontend (Tổng kết 1 ngày)
type DailySummary struct {
	Date        string  `json:"date"`
	MinTemp     float64 `json:"min_temp"`
	MaxTemp     float64 `json:"max_temp"`
	Description string  `json:"description"`
	Icon        string  `json:"icon"`
}

// Get3DaysForecast gọi OpenWeather Forecast và nhóm lại theo ngày
func Get3DaysForecast(city string, apiKey string) ([]DailySummary, error) {
	encodedCity := url.QueryEscape(city)
	urlStr := fmt.Sprintf("https://api.openweathermap.org/data/2.5/forecast?q=%s&appid=%s&units=metric&lang=vi", encodedCity, apiKey)

	resp, err := http.Get(urlStr)
	if err != nil {
		return nil, fmt.Errorf("lỗi kết nối đến dịch vụ thời tiết: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("không thể lấy dự báo thời tiết, mã lỗi: %d, chi tiết: %s", resp.StatusCode, string(body))
	}

	var forecastData WeatherForecastResponse
	if err := json.Unmarshal(body, &forecastData); err != nil {
		return nil, fmt.Errorf("lỗi phân tích dữ liệu thời tiết: %v", err)
	}

	// Dùng Map để nhóm dữ liệu theo ngày (YYYY-MM-DD)
	dailyMap := make(map[string]*DailySummary)
	var dateOrder []string // Lưu thứ tự các ngày xuất hiện

	for _, item := range forecastData.List {
		// Cắt chuỗi "2026-05-20 12:00:00" để lấy phần ngày "2026-05-20"
		dateParts := strings.Split(item.DtTxt, " ")
		if len(dateParts) == 0 {
			continue
		}
		dateStr := dateParts[0]

		if _, exists := dailyMap[dateStr]; !exists {
			if len(dateOrder) == 3 {
				break
			}
			dateOrder = append(dateOrder, dateStr)

			desc := ""
			icon := ""
			if len(item.Weather) > 0 {
				desc = item.Weather[0].Description
				icon = item.Weather[0].Icon
			}

			dailyMap[dateStr] = &DailySummary{
				Date:        dateStr,
				MinTemp:     item.Main.TempMin,
				MaxTemp:     item.Main.TempMax,
				Description: desc,
				Icon:        icon,
			}
		} else {
			if item.Main.TempMin < dailyMap[dateStr].MinTemp {
				dailyMap[dateStr].MinTemp = item.Main.TempMin
			}
			if item.Main.TempMax > dailyMap[dateStr].MaxTemp {
				dailyMap[dateStr].MaxTemp = item.Main.TempMax
			}

			// Ưu tiên lấy thời tiết lúc 12:00 trưa làm hình ảnh đại diện cho cả ngày
			if strings.Contains(item.DtTxt, "12:00:00") && len(item.Weather) > 0 {
				dailyMap[dateStr].Description = item.Weather[0].Description
				dailyMap[dateStr].Icon = item.Weather[0].Icon
			}
		}
	}

	// Chuyển từ Map sang Array để trả về
	var result []DailySummary
	for _, date := range dateOrder {
		result = append(result, *dailyMap[date])
	}

	// Nếu trả về mảng rỗng thì để an toàn cho JSON (tránh null)
	if result == nil {
		result = []DailySummary{}
	}

	return result, nil
}
