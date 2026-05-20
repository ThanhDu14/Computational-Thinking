// Chạy qua Proxy của Vite khi đang dev (tránh CORS + tự thêm Pinggy headers)
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
if (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}


/**
 * Gửi Firebase ID Token lên backend để xác minh Google Login.
 */
export const loginWithGoogleBackend = async (idToken) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
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
 * Đăng nhập Local trực tiếp với backend.
 */
export const loginLocalBackend = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/local/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Login error: ${response.status}`);
  }
  const json = await response.json();
  console.log(json);
  return json.data || json;
};

/**
 * Đăng ký tài khoản Local trực tiếp với backend.
 */
export const registerLocalBackend = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
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
    'Content-Type': 'application/json'
  };

  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ idToken }),
  });

  return response.ok;
};

// Đổi password
export const changePassword = async (token, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Change password error: ${response.status}`);
  }
  const json = await response.json();
  return json.data || json;
};