/**
 * Gửi email từ form liên hệ lên backend.
 * @param {Object} formData - Dữ liệu từ form { first_name, last_name, email, message }
 */
export const sendContactEmail = async (formData) => {
  const payload = {
    ho: formData.first_name,
    ten: formData.last_name,
    email: formData.email,
    noiDung: formData.message
  };

  let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
  }

  const response = await fetch(`${API_BASE_URL}/api/contact/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Contact error: ${response.status}`);
  }

  return await response.json();
};
