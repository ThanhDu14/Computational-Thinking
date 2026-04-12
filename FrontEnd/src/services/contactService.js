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

  const response = await fetch('/api/contact/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "X-Pinggy-No-Screen": "true"
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Contact error: ${response.status}`);
  }

  return await response.json();
};
