// Lấy URL và bỏ dấu '/' ở cuối (nếu có) để tránh lỗi //api/...
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
if (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}


/**
 * Gửi Firebase ID Token lên backend để xác minh.
 * Backend dùng Firebase Admin SDK để verify token,
 * sau đó trả về thông tin user (hoặc tạo user mới).
 *
 * @param {string} idToken - Firebase ID Token lấy từ user.getIdToken()
 * @returns {Promise<Object>} - User data từ backend
 */
export const verifyTokenWithBackend = async (idToken) => {

  // Nhờ proxy của Vite trong vite.config.js chặn và gọi ra ngoài hộ
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      "X-Pinggy-No-Screen": "true"
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ Lỗi từ Backend:", errorData);
    throw new Error(errorData.message || `Backend error: ${response.status}`);
  }

  const json = await response.json();

  return json.data || json;
};
