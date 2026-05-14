import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { 
  createNewChat, 
  sendChatMessage, 
  getChatHistory, 
  getChatSessions, 
  deleteChatSession 
} from '../services/chatService';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Helper to get consistent userId
  const getUserId = useCallback(() => {
    if (!user) return null;
    const backendId = user.db_id || user.id || user.user_id || user.userId;
    if (!backendId) {
      console.warn("⚠️ Không tìm thấy backend user ID!", user);
      return null;
    }
    return backendId;
  }, [user]);

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
      const userId = getUserId();
      const data = await getChatSessions(userId);
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
    }
  }, [isAuthenticated, getUserId]);

  const loadHistory = useCallback(async (sessionId) => {
    if (!isAuthenticated) return;
    setIsLoadingHistory(true);
    setIsTyping(true);
    try {
      const userId = getUserId();
      const data = await getChatHistory(userId, sessionId);
      setCurrentSessionId(sessionId);
      
      if (data.messages && data.messages.length > 0) {
        const formattedMsgs = data.messages.map(m => ({
          role: m.role === 'assistant' ? 'bot' : 'user',
          text: m.content,
          timestamp: "" 
        }));
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
  }, [isAuthenticated, getUserId]);

  const startNewChat = useCallback(async () => {
    if (!isAuthenticated) return null;
    try {
      const userId = getUserId();
      const data = await createNewChat(userId);
      setCurrentSessionId(data.session_id);
      setMessages(getDefaultMessages());
      await loadSessions();
      return data.session_id;
    } catch (err) {
      console.error("Failed to start new chat:", err);
      return null;
    }
  }, [isAuthenticated, getUserId, loadSessions]);

  const sendMessage = useCallback(async (text) => {
    if (!isAuthenticated || !text || !text.trim()) return;
    
    const userId = getUserId();
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
      const data = await sendChatMessage(text, userId, sessionId);
      
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
  }, [isAuthenticated, currentSessionId, getUserId, startNewChat, loadSessions]);

  const removeSession = useCallback(async (sessionId) => {
    if (!isAuthenticated) return;
    try {
      const userId = getUserId();
      await deleteChatSession(userId, sessionId);
      if (sessionId === currentSessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      await loadSessions();
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  }, [isAuthenticated, getUserId, currentSessionId, loadSessions]);

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
