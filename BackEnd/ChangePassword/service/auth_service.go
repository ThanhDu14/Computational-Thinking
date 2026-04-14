package service

import (
	"context"
	"fmt"

	"change-password/apperr"
	"change-password/config"
	"change-password/dto"
	"change-password/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

//go:generate mockgen -source=auth_service.go -destination=../mocks/auth_service_mock.go

// AuthService định nghĩa interface cho business logic tập trung vào ChangePassword
type AuthService interface {
	ChangePassword(ctx context.Context, userID string, req *dto.ChangePasswordRequest) error
}

// Claims là payload của JWT token (Middleware cần để giải mã)
type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type authService struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo repository.UserRepository, cfg *config.Config) AuthService {
	return &authService{
		userRepo:  userRepo,
		jwtSecret: cfg.JWTSecret,
	}
}

// ChangePassword - core logic đổi mật khẩu
func (s *authService) ChangePassword(ctx context.Context, userID string, req *dto.ChangePasswordRequest) error {
	// Step 1: Lấy user từ DB
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("authService.ChangePassword GetByID: %w", err)
	}

	// Step 2: Xác nhận mật khẩu cũ có đúng không
	// TODO: Cập nhật thuật toán sau khi bạn xác nhận Cách A hay Cách B
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return apperr.ErrWrongPassword
	}

	// Step 3: Kiểm tra new password và confirm password có khớp không
	if req.NewPassword != req.ConfirmPassword {
		return apperr.ErrPasswordMismatch
	}

	// Step 4: Không cho đặt lại password giống cũ
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.NewPassword)); err == nil {
		return apperr.ErrSamePassword
	}

	// Step 5: Hash password mới với độ khó 14 (chuẩn của nhóm)
	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 14)
	if err != nil {
		return fmt.Errorf("authService.ChangePassword bcrypt: %w", err)
	}

	// Step 6: Update vào DB
	if err := s.userRepo.UpdatePassword(ctx, userID, string(newHash)); err != nil {
		return fmt.Errorf("authService.ChangePassword UpdatePassword: %w", err)
	}

	return nil
}