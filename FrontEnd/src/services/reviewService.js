let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

/**
 * Lấy danh sách review của một địa điểm (Public - không cần token).
 * @param {string} locationId - ID của địa điểm
 */
export const getLocationReviews = async (locationId) => {
    const response = await fetch(`${API_BASE_URL}/api/review/location/${locationId}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch reviews: ${response.status}`);
    }

    const json = await response.json();
    return json.data || [];
};

/**
 * Lấy danh sách review của bản thân (Protected).
 * @param {string} token - JWT token
 */
export const getMyReviews = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/review/my-reviews`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch my reviews: ${response.status}`);
    }

    const json = await response.json();
    return json.data || [];
};

/**
 * Upload hình ảnh review lên Cloudinary (Protected).
 * ⚠️ Gọi API này TRƯỚC, lấy image_urls, rồi mới gọi createReview/updateReview.
 * @param {string} token - JWT token
 * @param {File[]} files - Mảng file ảnh (tối đa 5 file, mỗi file < 10MB)
 * @returns {string[]} - Mảng URL ảnh trên Cloudinary
 */
export const uploadReviewImages = async (token, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/api/review/upload-image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to upload images: ${response.status}`);
    }

    const json = await response.json();
    return json.data?.image_urls || [];
};

/**
 * Tạo review mới (Protected).
 * @param {string} token - JWT token
 * @param {object} reviewData - Dữ liệu review
 * @param {string} reviewData.location_id - ID địa điểm (bắt buộc)
 * @param {number} reviewData.rating - Điểm đánh giá từ 1 đến 5 (bắt buộc)
 * @param {string} [reviewData.comment] - Nhận xét
 * @param {string[]} [reviewData.images] - Mảng URL ảnh từ uploadReviewImages
 */
export const createReview = async (token, reviewData) => {
    const response = await fetch(`${API_BASE_URL}/api/review/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create review: ${response.status}`);
    }

    const json = await response.json();
    return json.data || json;
};

/**
 * Cập nhật review (Protected - chỉ sửa được review của chính mình).
 * @param {string} token - JWT token
 * @param {string} reviewId - ID review cần cập nhật
 * @param {object} reviewData - Dữ liệu cần cập nhật (tất cả tuỳ chọn)
 * @param {number} [reviewData.rating]
 * @param {string} [reviewData.comment]
 * @param {string[]} [reviewData.images] - ⚠️ GHI ĐÈ toàn bộ ảnh cũ
 */
export const updateReview = async (token, reviewId, reviewData) => {
    const response = await fetch(`${API_BASE_URL}/api/review/update/${reviewId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update review: ${response.status}`);
    }

    const json = await response.json();
    return json.data || json;
};

/**
 * Xóa review (Protected - chỉ xoá được review của chính mình).
 * @param {string} token - JWT token
 * @param {string} reviewId - ID review cần xóa
 */
export const deleteReview = async (token, reviewId) => {
    const response = await fetch(`${API_BASE_URL}/api/review/delete/${reviewId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete review: ${response.status}`);
    }

    return true;
};
