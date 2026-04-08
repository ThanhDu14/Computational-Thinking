from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # production: đổi thành domain của frontend
    allow_methods=["POST"],
    allow_headers=["*"],
)

class ContactForm(BaseModel):
    ho: str
    ten: str
    email: EmailStr
    noiDung: str


def build_email_html(ho: str, ten: str, email: str, noi_dung: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background-color:#f0efff;font-family:'Segoe UI',Arial,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0efff;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

              <!-- HEADER -->
              <tr>
                <td align="center" style="
                  background: linear-gradient(135deg, #7c6fe0 0%, #a78bfa 100%);
                  border-radius:20px 20px 0 0;
                  padding:36px 40px;
                ">
                  <div style="
                    display:inline-block;
                    background:rgba(255,255,255,0.2);
                    border-radius:50%;
                    width:56px;height:56px;
                    line-height:56px;
                    font-size:28px;
                    text-align:center;
                    margin-bottom:12px;
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

                  <!-- Thông tin khách -->
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="background:#f5f4ff;border-radius:14px;padding:24px;margin-bottom:24px;">
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #e8e6ff;">
                        <span style="color:#9693c7;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                          Họ tên
                        </span><br/>
                        <span style="color:#2d2b55;font-size:16px;font-weight:600;margin-top:4px;display:block;">
                          {ho} {ten}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;">
                        <span style="color:#9693c7;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                          Thư điện tử
                        </span><br/>
                        <a href="mailto:{email}"
                          style="color:#7c6fe0;font-size:16px;font-weight:600;margin-top:4px;display:block;text-decoration:none;">
                          {email}
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Nội dung -->
                  <div style="margin-bottom:8px;">
                    <span style="color:#9693c7;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                      Nội dung
                    </span>
                  </div>
                  <div style="
                    background:#f5f4ff;
                    border-left:4px solid #a78bfa;
                    border-radius:0 14px 14px 0;
                    padding:20px 24px;
                    color:#2d2b55;
                    font-size:15px;
                    line-height:1.8;
                  ">
                    {noi_dung}
                  </div>

                  <!-- Nút reply -->
                  <div style="text-align:center;margin-top:32px;">
                    <a href="mailto:{email}" style="
                      display:inline-block;
                      background:linear-gradient(135deg,#7c6fe0,#a78bfa);
                      color:#ffffff;
                      text-decoration:none;
                      padding:14px 36px;
                      border-radius:50px;
                      font-size:15px;
                      font-weight:600;
                      letter-spacing:0.3px;
                    ">
                      ↩ Trả lời khách hàng
                    </a>
                  </div>

                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="
                  background:#f5f4ff;
                  border-radius:0 0 20px 20px;
                  padding:24px 40px;
                  text-align:center;
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
    </html>
    """


@app.post("/api/contact/send-email")
async def send_email(form: ContactForm):

    if not form.ho.strip() or not form.ten.strip() or not form.noiDung.strip():
        return {"success": False, "message": "Vui lòng điền đầy đủ thông tin."}

    message = MIMEMultipart("alternative")
    message["From"]     = os.getenv("MAIL_USER")
    message["To"]       = "smartTravel3636@gmail.com"
    message["Subject"]  = f"[SmartTravel] Tin nhắn từ {form.ho} {form.ten}"
    message["Reply-To"] = form.email

    message.attach(MIMEText(
        build_email_html(form.ho, form.ten, form.email, form.noiDung),
        "html"
    ))

    try:
        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",
            port=465,
            use_tls=True,
            username=os.getenv("MAIL_USER"),
            password=os.getenv("MAIL_PASS"),
        )
        return {"success": True, "message": "Email đã được gửi thành công!"}

    except Exception as e:
        print(f"[ERROR] Gửi mail thất bại: {e}")
        return {"success": False, "message": "Gửi email thất bại, vui lòng thử lại."}


# ─── Chạy: python3 -m uvicorn main:app --reload --port 8000 ────────────────