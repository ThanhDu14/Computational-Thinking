let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

/**
 * Lấy toàn bộ địa điểm (có phân trang).
 * @param {number} page - Trang hiện tại (mặc định: 1)
 * @param {number} limit - Số lượng item trên mỗi trang (mặc định: 20, tối đa: 100)
 */
export const getAllLocations = async (page = 1, limit = 5) => {
    const response = await fetch(`${API_BASE_URL}/api/location/all?page=${page}&limit=${limit}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch locations: ${response.status}`);
    }

    const json = await response.json();
    // Response: { code, status, message, data: { data: [...], total, page, limit } }
    return json.data;
};

/**
 * Lọc và tìm kiếm địa điểm.
 * @param {object} params - Tham số lọc
 * @param {string} [params.city] - Tên thành phố (hỗ trợ tiếng Việt có/không dấu)
 * @param {string} [params.category] - Tên danh mục (VD: "Vui chơi", "Ăn uống")
 * @param {number} [params.page] - Trang hiện tại
 * @param {number} [params.limit] - Số lượng item
 */
export const filterLocations = async ({ city, category, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (category) params.append('category', category);
    params.append('page', page);
    params.append('limit', limit);

    const response = await fetch(`${API_BASE_URL}/api/location/filter?${params.toString()}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to filter locations: ${response.status}`);
    }

    const json = await response.json();
    console.log(json.data);
    return json.data;
};

/**
 * Lấy thông tin chi tiết 1 địa điểm theo ID.
 * @param {string} id - UUID của địa điểm
 */
export const getLocationById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/location/${id}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Location not found: ${response.status}`);
    }

    const json = await response.json();
    // Backend trả về { code, status, message, data: { ... } } hoặc data trực tiếp
    return json.data || json;
};
/**
 * Tìm kiếm địa điểm theo tên, có thể kết hợp filter city/category.
 * @param {string} keyword - Từ khóa tìm kiếm (bắt buộc)
 * @param {string} city - Lọc theo thành phố (tùy chọn)
 * @param {string} category - Lọc theo danh mục (tùy chọn)
 * @param {number} page - Số trang (mặc định: 1)
 * @param {number} limit - Số kết quả mỗi trang (mặc định: 20)
 */
export const searchLocations = async (keyword, city = '', category = '', page = 1, limit = 20) => {
    const params = new URLSearchParams({ q: keyword, page, limit });
    if (city) params.append('city', city);
    if (category) params.append('category', category);

    const response = await fetch(`${API_BASE_URL}/api/location/search?${params.toString()}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to search locations: ${response.status}`);
    }

    const json = await response.json();
    return json.data;
};
