package dto

// ChangePasswordRequest là payload FE gửi lên
type ChangePasswordRequest struct {
	OldPassword     string `json:"old_password"      binding:"required,min=8"`
	NewPassword     string `json:"new_password"      binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password"  binding:"required,min=8"`
}

// ---- Chuẩn bị cho OTP flow (chưa implement, chỉ define trước) ----

// RequestOTPRequest - FE gửi khi muốn nhận OTP qua email/SMS
// type RequestOTPRequest struct {
// 	Channel string `json:"channel" binding:"required,oneof=email sms"` // "email" | "sms"
// }

// ChangePasswordWithOTPRequest - FE gửi kèm OTP code
// type ChangePasswordWithOTPRequest struct {
// 	OTPCode         string `json:"otp_code"         binding:"required,len=6"`
// 	NewPassword     string `json:"new_password"      binding:"required,min=8"`
// 	ConfirmPassword string `json:"confirm_password"  binding:"required,min=8"`
// }