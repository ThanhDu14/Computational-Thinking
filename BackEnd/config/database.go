package config

import (
	"log"

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
	return db
}
