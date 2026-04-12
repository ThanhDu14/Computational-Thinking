// Lấy URL và bỏ dấu '/' ở cuối (nếu có) để tránh lỗi //api/...
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
if (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}


/**
 * Gửi Firebase ID Token lên backend để xác minh Google Login.
 */
export const loginWithGoogleBackend = async (idToken) => {
  const response = await fetch('/api/auth/google', {
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
    throw new Error(errorData.message || `Google login error: ${response.status}`);
  }
  const json = await response.json();
  return json.data || json;
};

/**
 * Đăng nhập Local (Email/Password) trực tiếp với backend.
 */
export const loginLocalBackend = async (email, password) => {
  const response = await fetch('/api/auth/local/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "X-Pinggy-No-Screen": "true"
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Login error: ${response.status}`);
  }
  const json = await response.json();
  return json.data || json;
};

/**
 * Đăng ký tài khoản Local trực tiếp với backend.
 */
export const registerLocalBackend = async (userData) => {
  const response = await fetch('/api/auth/local/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "X-Pinggy-No-Screen": "true"
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Register error: ${response.status}`);
  }
  const json = await response.json();
  return json.data || json;
};

/**
 * Gọi backend để logout và revoke token.
 */
export const logoutBackend = async (idToken) => {
  const headers = {
    'Content-Type': 'application/json',
    "X-Pinggy-No-Screen": "true"
  };
  
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ idToken }),
  });

  return response.ok;
};
