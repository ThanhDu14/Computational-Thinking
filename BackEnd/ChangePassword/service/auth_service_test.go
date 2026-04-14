package service_test

import (
	"context"
	"errors"
	"testing"

	"change-password/apperr"
	"change-password/config"
	"change-password/dto"
	"change-password/model"
	"change-password/service"

	"golang.org/x/crypto/bcrypt"
)

// ---- Manual mock ----

type mockUserRepo struct {
	getUserByIDFn    func(ctx context.Context, id string) (*model.User, error)
	updatePasswordFn func(ctx context.Context, userID string, newHash string) error
}

func (m *mockUserRepo) GetByID(ctx context.Context, id string) (*model.User, error) {
	return m.getUserByIDFn(ctx, id)
}

// GetByUsername không dùng trong module ChangePassword nữa nhưng vẫn để trống để thỏa mãn interface nếu cần
func (m *mockUserRepo) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	return nil, nil
}

func (m *mockUserRepo) UpdatePassword(ctx context.Context, userID string, newHash string) error {
	return m.updatePasswordFn(ctx, userID, newHash)
}

// ---- Helpers ----

func hashPassword(t *testing.T, pw string) string {
	t.Helper()
	hash, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.MinCost) // MinCost để test nhanh
	if err != nil {
		t.Fatalf("hashPassword: %v", err)
	}
	return string(hash)
}

func newTestService(repo *mockUserRepo) service.AuthService {
	cfg := &config.Config{JWTSecret: "test-secret"}
	return service.NewAuthService(repo, cfg)
}

// ---- Tests ChangePassword ----

func TestChangePassword_Success(t *testing.T) {
	oldHash := hashPassword(t, "OldPass@123")

	repo := &mockUserRepo{
		getUserByIDFn: func(_ context.Context, id string) (*model.User, error) {
			return &model.User{UserID: id, Password: oldHash}, nil
		},
		updatePasswordFn: func(_ context.Context, _ string, _ string) error {
			return nil
		},
	}

	svc := newTestService(repo)
	err := svc.ChangePassword(context.Background(), "user-uuid-1", &dto.ChangePasswordRequest{
		OldPassword:     "OldPass@123",
		NewPassword:     "NewPass@456",
		ConfirmPassword: "NewPass@456",
	})

	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
}

func TestChangePassword_WrongOldPassword(t *testing.T) {
	repo := &mockUserRepo{
		getUserByIDFn: func(_ context.Context, id string) (*model.User, error) {
			hash := hashPassword(t, "RealPass@123")
			return &model.User{UserID: id, Password: hash}, nil
		},
	}

	svc := newTestService(repo)
	err := svc.ChangePassword(context.Background(), "user-uuid-1", &dto.ChangePasswordRequest{
		OldPassword:     "WrongPass@999",
		NewPassword:     "NewPass@456",
		ConfirmPassword: "NewPass@456",
	})

	if !errors.Is(err, apperr.ErrWrongPassword) {
		t.Fatalf("expected ErrWrongPassword, got: %v", err)
	}
}

func TestChangePassword_PasswordMismatch(t *testing.T) {
	oldHash := hashPassword(t, "OldPass@123")

	repo := &mockUserRepo{
		getUserByIDFn: func(_ context.Context, id string) (*model.User, error) {
			return &model.User{UserID: id, Password: oldHash}, nil
		},
	}

	svc := newTestService(repo)
	err := svc.ChangePassword(context.Background(), "user-uuid-1", &dto.ChangePasswordRequest{
		OldPassword:     "OldPass@123",
		NewPassword:     "NewPass@456",
		ConfirmPassword: "DifferentPass@789",
	})

	if !errors.Is(err, apperr.ErrPasswordMismatch) {
		t.Fatalf("expected ErrPasswordMismatch, got: %v", err)
	}
}

func TestChangePassword_SameAsOldPassword(t *testing.T) {
	oldHash := hashPassword(t, "OldPass@123")

	repo := &mockUserRepo{
		getUserByIDFn: func(_ context.Context, id string) (*model.User, error) {
			return &model.User{UserID: id, Password: oldHash}, nil
		},
	}

	svc := newTestService(repo)
	err := svc.ChangePassword(context.Background(), "user-uuid-1", &dto.ChangePasswordRequest{
		OldPassword:     "OldPass@123",
		NewPassword:     "OldPass@123", // same as old
		ConfirmPassword: "OldPass@123",
	})

	if !errors.Is(err, apperr.ErrSamePassword) {
		t.Fatalf("expected ErrSamePassword, got: %v", err)
	}
}

func TestChangePassword_UserNotFound(t *testing.T) {
	repo := &mockUserRepo{
		getUserByIDFn: func(_ context.Context, _ string) (*model.User, error) {
			return nil, apperr.ErrUserNotFound
		},
	}

	svc := newTestService(repo)
	err := svc.ChangePassword(context.Background(), "user-id-not-exist", &dto.ChangePasswordRequest{
		OldPassword:     "OldPass@123",
		NewPassword:     "NewPass@456",
		ConfirmPassword: "NewPass@456",
	})

	if !errors.Is(err, apperr.ErrUserNotFound) {
		t.Fatalf("expected ErrUserNotFound, got: %v", err)
	}
}

func TestChangePassword_DBError(t *testing.T) {
	oldHash := hashPassword(t, "OldPass@123")
	dbErr := errors.New("connection refused")

	repo := &mockUserRepo{
		getUserByIDFn: func(_ context.Context, id string) (*model.User, error) {
			return &model.User{UserID: id, Password: oldHash}, nil
		},
		updatePasswordFn: func(_ context.Context, _ string, _ string) error {
			return dbErr
		},
	}

	svc := newTestService(repo)
	err := svc.ChangePassword(context.Background(), "user-uuid-1", &dto.ChangePasswordRequest{
		OldPassword:     "OldPass@123",
		NewPassword:     "NewPass@456",
		ConfirmPassword: "NewPass@456",
	})

	if err == nil {
		t.Fatal("expected error, got nil")
	}
}