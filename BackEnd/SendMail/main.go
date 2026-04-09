package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/mail"
	"net/smtp"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// ─── Models ───────────────────────────────────────────────────────────────────

type ContactForm struct {
	Ho      string `json:"ho"`
	Ten     string `json:"ten"`
	Email   string `json:"email"`
	NoiDung string `json:"noiDung"`
}

type APIResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// ─── Email HTML Builder ───────────────────────────────────────────────────────

func buildEmailHTML(ho, ten, email, noiDung string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:#f0efff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0efff;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="
              background:linear-gradient(135deg,#7c6fe0 0%%,#a78bfa 100%%);
              border-radius:20px 20px 0 0;
              padding:36px 40px;
            ">
              <div style="
                display:inline-block;background:rgba(255,255,255,0.2);
                border-radius:50%%;width:56px;height:56px;line-height:56px;
                font-size:28px;text-align:center;margin-bottom:12px;
              ">✈️</div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:0.5px;">
                SmartTravel
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Tin nhắn mới từ khách hàng
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px;">
              <p style="margin:0 0 24px;color:#4a4580;font-size:15px;line-height:1.6;">
                Xin chào! Bạn vừa nhận được một tin nhắn mới từ form liên hệ trên website.
              </p>
              <table width="100%%" cellpadding="0" cellspacing="0"
                style="background:#f5f4ff;border-radius:14px;padding:24px;margin-bottom:24px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e6ff;">
                    <span style="color:#9693c7;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                      Họ tên
                    </span><br/>
                    <span style="color:#2d2b55;font-size:16px;font-weight:600;margin-top:4px;display:block;">
                      %s %s
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="color:#9693c7;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                      Thư điện tử
                    </span><br/>
                    <a href="mailto:%s"
                      style="color:#7c6fe0;font-size:16px;font-weight:600;margin-top:4px;display:block;text-decoration:none;">
                      %s
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin-bottom:8px;">
                <span style="color:#9693c7;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                  Nội dung
                </span>
              </div>
              <div style="
                background:#f5f4ff;border-left:4px solid #a78bfa;
                border-radius:0 14px 14px 0;padding:20px 24px;
                color:#2d2b55;font-size:15px;line-height:1.8;
              ">
                %s
              </div>
              <div style="text-align:center;margin-top:32px;">
                <a href="mailto:%s" style="
                  display:inline-block;
                  background:linear-gradient(135deg,#7c6fe0,#a78bfa);
                  color:#ffffff;text-decoration:none;padding:14px 36px;
                  border-radius:50px;font-size:15px;font-weight:600;letter-spacing:0.3px;
                ">
                  ↩ Trả lời khách hàng
                </a>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="
              background:#f5f4ff;border-radius:0 0 20px 20px;
              padding:24px 40px;text-align:center;
            ">
              <p style="margin:0;color:#9693c7;font-size:13px;">
                📍 Trường ĐH KHTN &nbsp;|&nbsp; ✉️ smartTravel3636@gmail.com
              </p>
              <p style="margin:8px 0 0;color:#c4c2e0;font-size:12px;">
                © 2025 SmartTravel. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, ho, ten, email, email, noiDung, email)
}

// ─── Send Email (SSL port 465) ────────────────────────────────────────────────

func sendEmail(form ContactForm) error {
	from := os.Getenv("MAIL_USER")
	pass := os.Getenv("MAIL_PASS")
	to := "travel36.contact@gmail.com"
	host := "smtp.gmail.com"
	port := "465"

	subject := fmt.Sprintf("[SmartTravel] Tin nhắn từ %s %s", form.Ho, form.Ten)
	body := buildEmailHTML(form.Ho, form.Ten, form.Email, form.NoiDung)

	// Build raw RFC 2822 message
	msg := "From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Reply-To: " + form.Email + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n" +
		"\r\n" + body

	tlsCfg := &tls.Config{
		InsecureSkipVerify: false,
		ServerName:         host,
	}

	conn, err := tls.Dial("tcp", net.JoinHostPort(host, port), tlsCfg)
	if err != nil {
		return fmt.Errorf("TLS dial: %w", err)
	}

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return fmt.Errorf("SMTP client: %w", err)
	}
	defer client.Quit()

	auth := smtp.PlainAuth("", from, pass, host)
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("SMTP auth: %w", err)
	}

	if err = client.Mail(from); err != nil {
		return fmt.Errorf("MAIL FROM: %w", err)
	}
	if err = client.Rcpt(to); err != nil {
		return fmt.Errorf("RCPT TO: %w", err)
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("DATA: %w", err)
	}
	_, err = fmt.Fprint(w, msg)
	if err != nil {
		return fmt.Errorf("write body: %w", err)
	}
	return w.Close()
}

// ─── Validation ───────────────────────────────────────────────────────────────

func isValidEmail(e string) bool {
	_, err := mail.ParseAddress(e)
	return err == nil
}

// ─── Handler ──────────────────────────────────────────────────────────────────

func sendEmailHandler(w http.ResponseWriter, r *http.Request) {
	// CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var form ContactForm
	if err := json.NewDecoder(r.Body).Decode(&form); err != nil {
		json.NewEncoder(w).Encode(APIResponse{false, "Dữ liệu không hợp lệ."})
		return
	}

	if strings.TrimSpace(form.Ho) == "" ||
		strings.TrimSpace(form.Ten) == "" ||
		strings.TrimSpace(form.NoiDung) == "" {
		json.NewEncoder(w).Encode(APIResponse{false, "Vui lòng điền đầy đủ thông tin."})
		return
	}
	if !isValidEmail(form.Email) {
		json.NewEncoder(w).Encode(APIResponse{false, "Email không hợp lệ."})
		return
	}

	if err := sendEmail(form); err != nil {
		log.Printf("[ERROR] Gửi mail thất bại: %v", err)
		json.NewEncoder(w).Encode(APIResponse{false, "Gửi email thất bại, vui lòng thử lại."})
		return
	}

	json.NewEncoder(w).Encode(APIResponse{true, "Email đã được gửi thành công!"})
}

// ─── Main ─────────────────────────────────────────────────────────────────────

func main() {
	// Load .env (bỏ qua lỗi nếu không có file)
	_ = godotenv.Load()

	http.HandleFunc("/api/contact/send-email", sendEmailHandler)

	addr := ":8000"
	log.Printf("Server đang chạy tại http://localhost%s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}