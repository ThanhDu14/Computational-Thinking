// FrontEnd/src/services/recommendationService.js

const getRecommendationUrl = (path) => {
  let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  if (base.endsWith("/")) base = base.slice(0, -1);
  return `${base}${path}`;
};

const getAuthHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * 1. Lấy gợi ý lịch trình mới
 * Method: POST
 * Endpoint: /api/recommend
 */
export const getRecommendations = async (payload, token) => {
  try {
    const url = getRecommendationUrl('/api/recommend');
    console.log(`🌐 Gọi API Gợi Ý Lịch Trình: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("data", data);

    // GHI NHỚ TÊN TỈNH VỪA GENERATE ĐỂ DÙNG KHI LƯU
    if (data.province) {
      localStorage.setItem('last_generated_province', data.province);
    }

    return data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

/**
 * 2. Lưu lịch trình vào Database
 * Method: POST
 * Endpoint: /api/recommend/save
 */
export const saveRecommendation = async (planData, token) => {
  try {
    const url = getRecommendationUrl('/api/recommend/save');
    console.log(`🌐 Gọi API Lưu Lịch Trình: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(planData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("data", data);

    // LIÊN KẾT PLAN_ID MỚI VỚI TÊN TỈNH ĐÃ GHI NHỚ
    const planId = data.saved.plan_id;
    const provinceName = planData.province ||
      planData.destination?.province ||
      localStorage.getItem('last_generated_province');

    if (planId && provinceName) {
      console.log(`💾 Caching province "${provinceName}" for plan ${planId}`);
      const cache = JSON.parse(localStorage.getItem('cached_itinerary_provinces') || '{}');
      cache[planId] = provinceName;
      localStorage.setItem('cached_itinerary_provinces', JSON.stringify(cache));
    }

    return data;
  } catch (error) {
    console.error('Error saving recommendation:', error);
    throw error;
  }
};

/**
 * 3. Lấy lịch sử các lịch trình
 * Method: GET
 * Endpoint: /api/recommend/history
 */
export const getRecommendationHistory = async (token) => {
  try {
    const url = getRecommendationUrl('/api/recommend/history');
    console.log(`🌐 Gọi API Lấy Lịch Sử: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // TỰ ĐỘNG KHÔI PHỤC TÊN TỈNH TỪ CACHE NẾU DỮ LIỆU API TRẢ VỀ BỊ THIẾU
    const cache = JSON.parse(localStorage.getItem('cached_itinerary_provinces') || '{}');
    const history = Array.isArray(data) ? data : (data.history || []);

    history.forEach(plan => {
      const id = plan.plan_id || plan.id || plan.planId;
      if (id && cache[id] && (!plan.province || plan.province === 'Việt Nam' || plan.province === '')) {
        plan.province = cache[id];
      }
    });

    return data;
  } catch (error) {
    console.error('Error getting recommendation history:', error);
    throw error;
  }
};

/**
 * 4. Lấy chi tiết một lịch trình
 * Method: GET
 * Endpoint: /api/recommend/plan/{plan_id}
 */
export const getRecommendationDetail = async (planId, token) => {
  try {
    const url = getRecommendationUrl(`/api/recommend/plan/${planId}`);
    console.log(`🌐 Gọi API Chi Tiết Lịch Trình: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // TỰ ĐỘNG KHÔI PHỤC TÊN TỈNH TỪ CACHE
    const cache = JSON.parse(localStorage.getItem('cached_itinerary_provinces') || '{}');
    const plan = data.plan || data;
    const id = plan.plan_id || plan.id || planId;

    if (id && cache[id] && (!plan.province || plan.province === 'Việt Nam' || plan.province === '')) {
      plan.province = cache[id];
      if (plan.destination) plan.destination.province = cache[id];
    }

    console.log('Recommendation Detail:', data);
    return data;
  } catch (error) {
    console.error(`Error getting recommendation detail for plan ${planId}:`, error);
    throw error;
  }
};

/**
 * 5. Xóa một lịch trình
 * Method: DELETE
 * Endpoint: /api/recommend/plan/{plan_id}
 */
export const deleteRecommendation = async (planId, token) => {
  try {
    const url = getRecommendationUrl(`/api/recommend/plan/${planId}`);
    console.log(`🌐 Gọi API Xóa Lịch Trình: ${url}`);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error deleting recommendation plan ${planId}:`, error);
    throw error;
  }
};
