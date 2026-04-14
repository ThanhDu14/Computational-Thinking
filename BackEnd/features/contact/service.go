package contact

import (
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/smtp"
	"os"
)

// Gửi email qua SMTP SSL (port 465)

// sendRawEmail gửi một email HTML thông qua SMTP với TLS.
func sendRawEmail(to, subject, htmlBody string) error {
	from := os.Getenv("MAIL_USER")
	pass := os.Getenv("MAIL_PASS")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")

	if from == "" || pass == "" {
		return fmt.Errorf("thiếu cấu hình MAIL_USER hoặc MAIL_PASS trong biến môi trường")
	}
	if host == "" {
		host = "smtp.gmail.com"
	}
	if port == "" {
		port = "465"
	}

	msg := "From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n" +
		"\r\n" + htmlBody

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

// SendContactEmail gửi email từ form liên hệ đến địa chỉ admin.
func SendContactEmail(form ContactForm) error {
	mailTo := os.Getenv("MAIL_TO")
	if mailTo == "" {
		mailTo = "travel36.contact@gmail.com"
	}

	subject := fmt.Sprintf("[SmartTravel] Tin nhắn từ %s %s", form.Ho, form.Ten)
	body := buildContactEmailHTML(form.Ho, form.Ten, form.Email, form.NoiDung)

	return sendRawEmail(mailTo, subject, body)
}

// SendWelcomeEmail gửi email chào mừng đến người dùng sau khi đăng ký thành công.
func SendWelcomeEmail(toEmail, userName string) {
	subject := "[SmartTravel] Chào mừng bạn đến với SmartTravel! ✈️"
	body := buildWelcomeEmailHTML(userName)

	if err := sendRawEmail(toEmail, subject, body); err != nil {
		log.Printf("[EMAIL]  Gửi email chào mừng đến %s thất bại: %v", toEmail, err)
	} else {
		log.Printf("[EMAIL]  Đã gửi email chào mừng đến %s", toEmail)
	}
}

// HTML Templates

func buildContactEmailHTML(ho, ten, email, noiDung string) string {
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

func buildWelcomeEmailHTML(userName string) string {
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
                Chào mừng thành viên mới!
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#2d2b55;font-size:22px;font-weight:700;">
                Xin chào %s! 🎉
              </h2>
              <p style="margin:0 0 20px;color:#4a4580;font-size:15px;line-height:1.8;">
                Cảm ơn bạn đã đăng ký tài khoản trên <strong>SmartTravel</strong>. 
                Chúng tôi rất vui khi có bạn đồng hành!
              </p>
              <div style="
                background:#f5f4ff;border-radius:14px;
                padding:24px;margin-bottom:24px;
              ">
                <p style="margin:0 0 12px;color:#4a4580;font-size:15px;line-height:1.6;">
                  Với SmartTravel, bạn có thể:
                </p>
                <table width="100%%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;color:#2d2b55;font-size:14px;">
                      🗺️ &nbsp; Khám phá các điểm du lịch hấp dẫn
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#2d2b55;font-size:14px;">
                      📋 &nbsp; Lên kế hoạch chuyến đi thông minh
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#2d2b55;font-size:14px;">
                      💡 &nbsp; Nhận gợi ý cá nhân hóa dựa trên sở thích
                    </td>
                  </tr>
                </table>
              </div>
              <div style="text-align:center;margin-top:32px;">
                <a href="#" style="
                  display:inline-block;
                  background:linear-gradient(135deg,#7c6fe0,#a78bfa);
                  color:#ffffff;text-decoration:none;padding:14px 36px;
                  border-radius:50px;font-size:15px;font-weight:600;letter-spacing:0.3px;
                ">
                  🚀 Bắt đầu khám phá
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
</html>`, userName)
}
