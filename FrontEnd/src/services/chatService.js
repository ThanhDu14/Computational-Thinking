// FrontEnd/src/services/chatService.js

/**
 * Helper to obtain the base URL for the Chatbot API.
 * Uses VITE_API_CHATBOT_URL from .env, falls back to localhost:8000.
 */
const getChatbotBase = () => {
  let base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  if (base.endsWith("/")) {
    base = base.slice(0, -1);
  }
  return base;
};

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
});

/**
 * Common handler for fetch responses
 */
const handleResponse = async (res, defaultErrorMsg) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("API Error Response Data:", JSON.stringify(errorData, null, 2));
    throw new Error(errorData.error || JSON.stringify(errorData.detail) || `${defaultErrorMsg} (status ${res.status})`);
  }
  const data = await res.json();
  console.log(data);
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
};

/**
 * 1. Tạo đoạn chat mới (New Chat)
 * Endpoint: POST /api/chatbot/chat/new
 * @param {string} token 
 * @returns {Promise<{status: string, session_id: string, title: string}>}
 */
export const createNewChat = async (token) => {
  const res = await fetch(`${getChatbotBase()}/api/chatbot/chat/new`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({})
  });
  return handleResponse(res, "New chat request failed");
};

/**
 * 2. Gửi tin nhắn (Chat)
 * Endpoint: POST /api/chatbot/chat
 * @param {string} token 
 * @param {string} message 
 * @param {string} session_id 
 * @returns {Promise<{session_id: string, reply: string}>}
 */
export const sendChatMessage = async (token, message, session_id) => {
  const res = await fetch(`${getChatbotBase()}/api/chatbot/chat`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ message, session_id })
  });
  return handleResponse(res, "Chat request failed");
};

/**
 * 3. Lấy lịch sử chat (History)
 * Endpoint: GET /api/chatbot/chat/me/{session_id}/history
 * @param {string} token 
 * @param {string} session_id 
 * @returns {Promise<{session_id: string, total_messages: number, messages: Array<{role: string, content: string}>}>}
 */
export const getChatHistory = async (token, session_id) => {
  const res = await fetch(`${getChatbotBase()}/api/chatbot/chat/me/${session_id}/history`, {
    method: "GET",
    headers: getHeaders(token)
  });
  return handleResponse(res, "Failed to get chat history");
};

/**
 * 4. Danh sách các phiên (Sidebar)
 * Endpoint: GET /api/chatbot/sessions
 * @param {string} token 
 * @returns {Promise<{user_id: string, sessions: Array<{id: string, title: string, created_at: string}>}>}
 */
export const getChatSessions = async (token) => {
  const res = await fetch(`${getChatbotBase()}/api/chatbot/sessions`, {
    method: "GET",
    headers: getHeaders(token)
  });
  return handleResponse(res, "Failed to get chat sessions");
};

/**
 * 5. Xóa hội thoại (Delete Session)
 * Endpoint: DELETE /api/chatbot/chat/{session_id}
 * @param {string} token 
 * @param {string} session_id 
 * @returns {Promise<{status: string, message: string}>}
 */
export const deleteChatSession = async (token, session_id) => {
  const res = await fetch(`${getChatbotBase()}/api/chatbot/chat/${session_id}`, {
    method: "DELETE",
    headers: getHeaders(token)
  });
  return handleResponse(res, "Failed to delete chat session");
};

/**
 * Send an image recognition result to get AI info about the location.
 * Endpoint: POST /api/chatbot/chat/image-result
 * @param {string} token 
 * @param {string} locationName 
 * @returns {Promise<{detected_location: string, reply: string}>}
 */
export const sendImageResult = async (token, locationName) => {
  const res = await fetch(`${getChatbotBase()}/api/chatbot/chat/image-result`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ location_name: locationName })
  });
  return handleResponse(res, "Image result request failed");
};

/**
 * 6. Gửi tin nhắn bằng hình ảnh (Vision chat)
 * Endpoint: POST /api/chatbot/chat/image
 * @param {string} token 
 * @param {File} file 
 * @param {string} [session_id] 
 * @returns {Promise<{session_id: string, reply: string, image_url: string}>}
 */
export const sendChatImage = async (token, file, session_id) => {
  // Bước 1: Upload ảnh
  const formData = new FormData();
  formData.append('file', file);

  const uploadRes = await fetch(`${getChatbotBase()}/api/chatbot/chat/upload-image`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  const uploadData = await handleResponse(uploadRes, "Image upload failed");
  const imageUrl = uploadData?.data?.image_url;

  if (!imageUrl) {
    throw new Error("Không lấy được đường dẫn ảnh sau khi tải lên.");
  }

  // Bước 2: Gửi URL ảnh cho Chatbot xử lý
  const payload = { image_url: imageUrl };
  if (session_id) {
    payload.session_id = session_id;
  }

  const chatRes = await fetch(`${getChatbotBase()}/api/chatbot/chat/image`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });

  const chatData = await handleResponse(chatRes, "Chat image request failed");

  // Trả về kèm image_url để hiển thị trên UI (nếu cần)
  return { ...chatData, image_url: imageUrl };
};