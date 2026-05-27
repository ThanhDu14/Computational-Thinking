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

const MAPPED_PROVINCES = {
    'ba ria vung tau': 'Vung Tau',
    'binh dinh': 'Qui Nhon',
    'binh phuoc': 'Dong Xoai',
    'binh thuan': 'Phan Thiet',
    'dak lak': 'Buon Ma Thuot',
    'dak nong': 'Buon Ma Thuot',
    'dien bien': 'Dien Bien Phu',
    'dong nai': 'Bien Hoa',
    'dong thap': 'Cao Lanh',
    'ha nam': 'Phu Ly',
    'hai phong': 'Haiphong',
    'hau giang': 'Vi Thanh',
    'khanh hoa': 'Nha Trang',
    'kien giang': 'Rach Gia',
    'lam dong': 'Da Lat',
    'nghe an': 'Vinh',
    'ninh thuan': 'Phan Rang-Thap Cham',
    'phu yen': 'Tuy Hoa',
    'quang binh': 'Dong Hoi',
    'quang nam': 'Hoi An',
    'quang ninh': 'Ha Long',
    'thua thien hue': 'Hue',
    'tien giang': 'My Tho',
    'vinh phuc': 'Vinh Yen'
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

    // Loại bỏ tiền tố "Tỉnh" hoặc "Thành phố" hoặc "Thị xã"
    queryCity = queryCity.replace(/^(tỉnh|thành phố|thị xã)\s+/i, "");

    // Loại bỏ dấu tiếng Việt
    queryCity = removeVietnameseAccents(queryCity);

    // Chuẩn hóa khoảng trắng, loại bỏ dấu gạch ngang (-) và chuyển sang chữ thường để đối chiếu
    const cleanKey = queryCity.replace(/-/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

    // Nếu nằm trong map các tỉnh thành không được OpenWeatherMap nhận diện trực tiếp
    if (MAPPED_PROVINCES[cleanKey]) {
        return MAPPED_PROVINCES[cleanKey];
    }

    return queryCity.trim();
};

/**
 * Lấy thông tin thời tiết từ Backend API cho một tỉnh/thành phố.
 * @param {string} province - Tên tỉnh/thành phố
 */
export const getWeatherByProvince = async (province) => {
    if (!province) return null;
    const queryCity = normalizeCity(province);

    // Dùng single URL-encode thay vì double URL-encode vì API backend hỗ trợ tốt nhất ở định dạng này
    const encodedCity = encodeURIComponent(queryCity);
    const url = `${API_BASE_URL}/api/weather?city=${encodedCity}`;
    console.log("Weather API Request URL:", url);
    const response = await fetch(url);
    const data = await response.json();
    console.log("Weather API Response Data:", data);

    if (data.status !== "success" || !data.data) {
        throw new Error(data.message || "Failed to fetch weather data");
    }

    return data.data;
};
