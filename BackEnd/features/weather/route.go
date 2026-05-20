package weather

import (
	"github.com/gin-gonic/gin"
)

// SetupWeatherRoutes đăng ký API lấy thông tin thời tiết
func SetupWeatherRoutes(router *gin.RouterGroup) {
	// Endpoint: GET /api/weather?city=Hanoi
	router.GET("", GetWeatherForecastHandler())
}
