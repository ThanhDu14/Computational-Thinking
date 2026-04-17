let API_BASE_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}


export const updateInfo = async (token, payload) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/update-info`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Profile update error: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
    return json.data || json;
};