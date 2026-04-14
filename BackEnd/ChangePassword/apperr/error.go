package apperr

import "errors"

// Sentinel errors - dùng errors.Is() để so sánh
var (
	ErrUserNotFound         = errors.New("user not found")
	ErrWrongPassword        = errors.New("wrong old password")
	ErrPasswordMismatch     = errors.New("new password and confirm password do not match")
	ErrSamePassword         = errors.New("new password must be different from old password")
	ErrUnauthorized         = errors.New("unauthorized")
	ErrInvalidToken         = errors.New("invalid or expired token")

	// Chuẩn bị cho OTP
	// ErrOTPExpired        = errors.New("otp has expired")
	// ErrOTPInvalid        = errors.New("otp is invalid")
	// ErrOTPAlreadyUsed    = errors.New("otp already used")
)