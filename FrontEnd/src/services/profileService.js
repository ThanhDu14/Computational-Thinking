let API_BASE_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}


export const getInfo = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/get-info`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            "X-Pinggy-No-Screen": "true",
            "ngrok-skip-browser-warning": "true"
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch profile: ${response.status}`);
    }

    const json = await response.json();
    return json.data;
};

export const uploadAvatar = async (token, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/profile/upload-avatar`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            "X-Pinggy-No-Screen": "true",
            "ngrok-skip-browser-warning": "true"
            // Note: Content-Type is intentionally omitted so the browser sets it to multipart/form-data with boundary
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to upload avatar: ${response.status}`);
    }

    const json = await response.json();
    return json.data;
};

export const updateInfo = async (token, payload) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/update-info/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            "X-Pinggy-No-Screen": "true",
            "ngrok-skip-browser-warning": "true"
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