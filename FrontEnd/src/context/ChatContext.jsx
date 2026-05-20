import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { 
  createNewChat, 
  sendChatMessage, 
  getChatHistory, 
  getChatSessions, 
  deleteChatSession,
  sendChatImage 
} from '../services/chatService';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated, getToken } = useAuth();
  const { t } = useTranslation();
  
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const getDefaultMessages = useCallback(() => ([
    {
      role: 'bot',
      text: t('aiconcierge.greeting', 'Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn?'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]), [t]);

  const loadSessions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const token = await getToken();
      if (!token) return;
      const data = await getChatSessions(token);
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
    }
  }, [isAuthenticated, getToken]);

  const loadHistory = useCallback(async (sessionId) => {
    if (!isAuthenticated) return;
    setIsLoadingHistory(true);
    setIsTyping(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const data = await getChatHistory(token, sessionId);
      setCurrentSessionId(sessionId);
      
      if (data.messages && data.messages.length > 0) {
        const formattedMsgs = data.messages.map(m => {
          let text = m.content ?? '';
          let imageUrl = null;

          // Parse markdown image ![alt](url)
          const imgMatch = text.match(/!\[(.*?)\]\((https?:\/\/.*?)\)/);
          if (imgMatch) {
            imageUrl = imgMatch[2];
            text = text.replace(imgMatch[0], '').trim();
          } else {
            // Parse raw Supabase / Cloudinary image URLs or standard image extensions
            const rawUrlMatch = text.match(/(https?:\/\/[^\s)]+(?:supabase\.co|cloudinary\.com|storage\/v1\/object\/public\/images\/)[^\s)]+|https?:\/\/[^\s)]+\.(?:jpg|jpeg|png|webp|gif|bmp|svg)(?:\?[^\s)]*)?)/i);
            if (rawUrlMatch) {
              imageUrl = rawUrlMatch[1];
              text = text.replace(imageUrl, '').trim();
            }
          }

          return {
            role: m.role === 'assistant' ? 'bot' : 'user',
            text: text,
            imageUrl: imageUrl,
            timestamp: "" 
          };
        });
        setMessages(formattedMsgs);
      } else {
        setMessages(getDefaultMessages());
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setIsLoadingHistory(false);
      setIsTyping(false);
    }
  }, [isAuthenticated, getToken]);

  const startNewChat = useCallback(async () => {
    if (!isAuthenticated) return null;
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const data = await createNewChat(token);
      setCurrentSessionId(data.session_id);
      setMessages(getDefaultMessages());
      await loadSessions();
      return data.session_id;
    } catch (err) {
      console.error("Failed to start new chat:", err);
      return null;
    }
  }, [isAuthenticated, getToken, loadSessions]);

  const sendMessage = useCallback(async (text) => {
    if (!isAuthenticated || !text || !text.trim()) return;
    
    let sessionId = currentSessionId;
    
    // Auto-create session if none active
    if (!sessionId) {
      sessionId = await startNewChat();
      if (!sessionId) return;
    }

    const userMsg = { 
      role: 'user', 
      text: text, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const token = await getToken();
      const data = await sendChatMessage(token, text, sessionId);
      
      setMessages(prev => [...prev, {
        role: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      // Update session title in list if it's a new session or title changed
      loadSessions();
      
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [isAuthenticated, currentSessionId, getToken, startNewChat, loadSessions]);

  const sendImageMessage = useCallback(async (file) => {
    if (!isAuthenticated || !file) return;
    
    let sessionId = currentSessionId;
    
    // Auto-create session if none active
    if (!sessionId) {
      sessionId = await startNewChat();
      if (!sessionId) return;
    }

    const localImageUrl = URL.createObjectURL(file);

    const userMsg = { 
      role: 'user', 
      text: t('aiconcierge.sent_image', 'Đã gửi một hình ảnh'), 
      imageUrl: localImageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const token = await getToken();
      const data = await sendChatImage(token, file, sessionId);
      
      // Update local imageUrl with permanent URL from server
      if (data.image_url) {
        setMessages(prev => prev.map(m => m.imageUrl === localImageUrl ? { ...m, imageUrl: data.image_url } : m));
      }

      setMessages(prev => [...prev, {
        role: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      loadSessions();
      
    } catch (err) {
      console.error("Chat image error:", err);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Xin lỗi, đã có lỗi xảy ra khi gửi ảnh tới AI. Vui lòng thử lại sau.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [isAuthenticated, currentSessionId, getToken, startNewChat, loadSessions, t]);

  const removeSession = useCallback(async (sessionId) => {
    if (!isAuthenticated) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      await deleteChatSession(token, sessionId);
      if (sessionId === currentSessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      await loadSessions();
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  }, [isAuthenticated, getToken, currentSessionId, loadSessions]);

  // Load sessions on mount or when user changes
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    } else {
      setSessions([]);
      setMessages([]);
      setCurrentSessionId(null);
    }
  }, [isAuthenticated, loadSessions]);

  const value = {
    sessions,
    currentSessionId,
    messages,
    isTyping,
    isLoadingHistory,
    loadSessions,
    loadHistory,
    startNewChat,
    sendMessage,
    sendImageMessage,
    removeSession,
    setCurrentSessionId,
    setMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
