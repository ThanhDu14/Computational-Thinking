package repository

import (
	"context"
	"errors"
	"fmt"

	"change-password/apperr"
	"change-password/model"

	"gorm.io/gorm"
)

//go:generate mockgen -source=user_repository.go -destination=../mocks/user_repository_mock.go

// UserRepository định nghĩa interface
type UserRepository interface {
	GetByID(ctx context.Context, id string) (*model.User, error)
	GetByUsername(ctx context.Context, username string) (*model.User, error)
	UpdatePassword(ctx context.Context, userID string, newHashedPassword string) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// GetByID lấy user theo ID bằng GORM
func (r *userRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("user_id = ?", id).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperr.ErrUserNotFound
		}
		return nil, fmt.Errorf("userRepository.GetByID: %w", err)
	}

	return &user, nil
}

// GetByUsername lấy user theo username bằng GORM
func (r *userRepository) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperr.ErrUserNotFound
		}
		return nil, fmt.Errorf("userRepository.GetByUsername: %w", err)
	}

	return &user, nil
}

// UpdatePassword cập nhật password mới vào DB bằng GORM
func (r *userRepository) UpdatePassword(ctx context.Context, userID string, newHashedPassword string) error {
	result := r.db.WithContext(ctx).Model(&model.User{}).Where("user_id = ?", userID).Update("password", newHashedPassword)
	if result.Error != nil {
		return fmt.Errorf("userRepository.UpdatePassword: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return apperr.ErrUserNotFound
	}

	return nil
}