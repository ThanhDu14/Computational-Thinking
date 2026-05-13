// FrontEnd/src/services/chatService.js

/**
 * Helper to obtain the base URL for the Chatbot API.
 * Uses VITE_API_CHATBOT_URL from .env, falls back to localhost:8000.
 */
const getChatbotBase = () => {
  let base = import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:8000";
  if (base.endsWith("/")) {
    base = base.slice(0, -1);
  }
  return base;
};

/**
 * Common handler for fetch responses
 */
const handleResponse = async (res, defaultErrorMsg) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `${defaultErrorMsg} (status ${res.status})`);
  }
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  console.log(data);
  return data;
};

/**
 * 1. Tạo đoạn chat mới (New Chat)
 * Endpoint: POST /chat/new
 * @param {string} user_id 
 * @returns {Promise<{status: string, session_id: string, title: string}>}
 */
export const createNewChat = async (user_id) => {
  const res = await fetch(`${getChatbotBase()}/chat/new`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id })
  });
  return handleResponse(res, "New chat request failed");
};

/**
 * 2. Gửi tin nhắn (Chat)
 * Endpoint: POST /chat
 * @param {string} message 
 * @param {string} user_id 
 * @param {string} session_id 
 * @returns {Promise<{session_id: string, reply: string}>}
 */
export const sendChatMessage = async (message, user_id, session_id) => {
  const res = await fetch(`${getChatbotBase()}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, user_id, session_id })
  });
  return handleResponse(res, "Chat request failed");
};

/**
 * 3. Lấy lịch sử chat (History)
 * Endpoint: GET /chat/{user_id}/{session_id}/history
 * @param {string} user_id 
 * @param {string} session_id 
 * @returns {Promise<{session_id: string, total_messages: number, messages: Array<{role: string, content: string}>}>}
 */
export const getChatHistory = async (user_id, session_id) => {
  const res = await fetch(`${getChatbotBase()}/chat/${user_id}/${session_id}/history`, {
    method: "GET"
  });
  return handleResponse(res, "Failed to get chat history");
};

/**
 * 4. Danh sách các phiên (Sidebar)
 * Endpoint: GET /sessions/{user_id}
 * @param {string} user_id 
 * @returns {Promise<{user_id: string, sessions: Array<{id: string, title: string, created_at: string}>}>}
 */
export const getChatSessions = async (user_id) => {
  const res = await fetch(`${getChatbotBase()}/sessions/${user_id}`, {
    method: "GET"
  });
  return handleResponse(res, "Failed to get chat sessions");
};

/**
 * 5. Xóa hội thoại (Delete Session)
 * Endpoint: DELETE /chat/{user_id}/{session_id}
 * @param {string} user_id 
 * @param {string} session_id 
 * @returns {Promise<{status: string, message: string}>}
 */
export const deleteChatSession = async (user_id, session_id) => {
  const res = await fetch(`${getChatbotBase()}/chat/${user_id}/${session_id}`, {
    method: "DELETE"
  });
  return handleResponse(res, "Failed to delete chat session");
};

/**
 * Send an image recognition result to get AI info about the location.
 * Endpoint: POST /chat/image-result
 * @param {string} locationName 
 * @returns {Promise<{detected_location: string, reply: string}>}
 */
export const sendImageResult = async (locationName) => {
  const res = await fetch(`${getChatbotBase()}/chat/image-result`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location_name: locationName })
  });
  return handleResponse(res, "Image result request failed");
};