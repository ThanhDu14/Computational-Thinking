let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
if (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

const getAuthHeaders = () => {
  try {
    const savedUser = localStorage.getItem('smart_travel_user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const token = user?.access_token || user?.token || '';
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  } catch (error) {
    console.error("Error getting auth headers:", error);
    return {
      'Content-Type': 'application/json'
    };
  }
};


/**
 * Thêm một địa điểm vào wishlist.
 * @param {string} locationId - UUID của địa điểm.
 */
export const addToWishlist = async (locationId) => {
  const response = await fetch(`${API_BASE_URL}/api/wishlist/add`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ location_id: locationId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to add to wishlist: ${response.status}`);
  }

  return await response.json();
};

/**
 * Lấy danh sách wishlist của người dùng hiện tại.
 */
export const getMyWishlist = async () => {
  const response = await fetch(`${API_BASE_URL}/api/wishlist/my-wishlist`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch wishlist: ${response.status}`);
  }

  const json = await response.json();
  return json.data; // Mảng các { location_id }
};

/**
 * Xóa một địa điểm khỏi wishlist.
 * @param {string} locationId - UUID của địa điểm.
 */
export const removeFromWishlist = async (locationId) => {
  const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${locationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to remove from wishlist: ${response.status}`);
  }

  return await response.json();
};

/**
 * Kiểm tra xem một địa điểm đã có trong wishlist chưa.
 * @param {string} locationId - UUID của địa điểm.
 */
export const checkIfInWishlist = async (locationId) => {
  const response = await fetch(`${API_BASE_URL}/api/wishlist/check/${locationId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Nếu chưa đăng nhập hoặc lỗi khác, trả về false thay vì throw error để UI ko crash
    return { is_in_wishlist: false };
  }

  const json = await response.json();
  return json.data; // { location_id, is_in_wishlist }
};
