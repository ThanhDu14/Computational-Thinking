export const fetchPlaces = async () => {
  let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
  }
  return fetch(`${API_BASE_URL}/api/places`).then(res => res.json());
};
