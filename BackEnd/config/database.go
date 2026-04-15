package config

import (
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDatabase() *gorm.DB {
	dsn := GetEnv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/postgres")

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("Không thể kết nối đến Database: %v", err)
	}

	log.Println("Đã kết nối thành công đến PostgreSQL (Supabase)!")

	// Thiết lập Connection Pool
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Lỗi khởi tạo pooling: %v", err)
	}

	// Cấu hình các thông số Pool để chống nghẽn/sập database
	sqlDB.SetMaxOpenConns(50)                  // Giới hạn số connection mở tối đa
	sqlDB.SetMaxIdleConns(10)                  // Giới hạn số connection rảnh rỗi tối đa
	sqlDB.SetConnMaxLifetime(1 * time.Hour)    // Kết nối được sống tối đa 1 tiếng

	return db
}
