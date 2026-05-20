let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

/**
 * Loại bỏ dấu tiếng Việt để gửi lên API Backend dễ nhận diện hơn
 */
const removeVietnameseAccents = (str) => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

/**
 * Chuẩn hóa tên thành phố trước khi gửi lên API Backend
 * @param {string} province - Tên tỉnh/thành phố
 */
export const normalizeCity = (province) => {
    if (!province) return '';
    let queryCity = province.trim();
    const lower = queryCity.toLowerCase();

    if (
        lower.includes("hồ chí minh") ||
        lower.includes("saigon") ||
        lower.includes("sài gòn") ||
        lower.includes("hcm") ||
        lower.includes("tphcm")
    ) {
        return "Saigon"; // Backend hỗ trợ tốt nhất với tên Saigon
    }

    if (lower.includes("đà nẵng")) {
        return "Danang";
    }

    // Loại bỏ tiền tố "Tỉnh" hoặc "Thành phố"
    queryCity = queryCity.replace(/^(tỉnh|thành phố)\s+/i, "");

    // Loại bỏ dấu tiếng Việt
    queryCity = removeVietnameseAccents(queryCity);

    return queryCity.trim();
};

/**
 * Lấy thông tin thời tiết từ Backend API cho một tỉnh/thành phố.
 * @param {string} province - Tên tỉnh/thành phố
 */
export const getWeatherByProvince = async (province) => {
    if (!province) return null;
    const queryCity = normalizeCity(province);

    // Double URL-encode to prevent backend http.Get crash on spaces
    const doubleEncodedCity = encodeURIComponent(encodeURIComponent(queryCity));
    const url = `${API_BASE_URL}/api/weather?city=${doubleEncodedCity}`;
    console.log(url);
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    if (data.status !== "success" || !data.data) {
        throw new Error(data.message || "Failed to fetch weather data");
    }

    return data.data;
};
