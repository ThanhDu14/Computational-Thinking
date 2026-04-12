package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Println(" Không tìm thấy file .env, sử dụng biến môi trường hệ thống.")
	} else {
		log.Println(" Đã tải cấu hình từ file .env")
	}
}

func GetEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
