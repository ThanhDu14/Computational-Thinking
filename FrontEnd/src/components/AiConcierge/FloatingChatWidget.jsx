import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, Plus, LogIn, Mic, Image as ImageIcon, MapPin, Star, ExternalLink, Menu, Trash2, Loader2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage, createNewChat, getChatSessions, getChatHistory, deleteChatSession } from '../../services/chatService';

const renderMessageContent = (text) => {
  if (!text) return null;

  const formatBold = (str) => {
    return str.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part);
  };

  // 0. MARKDOWN INLINE JSON BLOCK FORMAT (```json ... ```)
  if (text.includes('```json')) {
    const blockRegex = /```json\s*([\s\S]*?)\s*```/gi;
    const elements = [];
    let lastIndex = 0;
    let match;

    while ((match = blockRegex.exec(text)) !== null) {
      let beforeText = text.substring(lastIndex, match.index);
      
      // Clean up the trailing item header prefix (e.g. "1. **Ngũ Hành Sơn**" or "1. Ngũ Hành Sơn")
      beforeText = beforeText.replace(/(?:\r?\n)+\s*\d+[\.\/\s-]+\s*(?:\*\*.*?\*\*|.*?)?\s*$/g, '');

      if (beforeText.trim()) {
        elements.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap mb-2">
            {formatBold(beforeText.trim())}
          </div>
        );
      }

      const jsonStr = match[1];
      try {
        // Correct rating format if unquoted, e.g. "rating": 4.2/5 -> "rating": "4.2/5"
        let cleaned = jsonStr.trim();
        cleaned = cleaned.replace(/"rating"\s*:\s*(\d+(?:\.\d+)?)\s*\/\s*5/g, '"rating": "$1/5"');
        
        const place = JSON.parse(cleaned);
        if (place && place.name) {
          const cleanedName = place.name.replace(/^\d+[\.\/\s-]+\s*/, '');
          
          let categories = [];
          if (Array.isArray(place.categories)) {
            categories = place.categories;
          } else if (Array.isArray(place.category)) {
            categories = place.category;
          } else if (typeof place.category === 'string') {
            categories = place.category.split(',').map(c => c.trim()).filter(Boolean);
          } else if (typeof place.categories === 'string') {
            categories = place.categories.split(',').map(c => c.trim()).filter(Boolean);
          }

          const imageSrc = (place.images && place.images.length > 0) ? place.images[0] : (place.image || null);

          elements.push(
            <div key={`place-markdown-json-${match.index}`} className="my-2 bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              {imageSrc && (
                <div className="w-full h-32 overflow-hidden bg-surface-container">
                  <img src={imageSrc} alt={cleanedName} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-3">
                <h4 className="font-display font-bold text-sm text-primary mb-1">{cleanedName}</h4>
                {place.address && (
                  <p className="text-xs text-on-surface-variant mb-2 flex items-start gap-1">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{place.address}</span>
                  </p>
                )}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {categories.map((cat, idx) => cat ? (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">
                        {cat}
                      </span>
                    ) : null)}
                  </div>
                )}
                {place.description && (
                  <p className="text-xs text-on-surface/80 line-clamp-3 leading-relaxed">
                    {place.description}
                  </p>
                )}
              </div>
            </div>
          );
        }
      } catch (e) {
        console.error("Failed to parse inline markdown JSON:", e);
        // Fallback to displaying raw code block if syntax is completely unfixable
        elements.push(
          <pre key={`code-block-${match.index}`} className="bg-surface-container-high p-2 rounded-lg text-xs overflow-x-auto my-1">
            <code>{jsonStr}</code>
          </pre>
        );
      }

      lastIndex = blockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      if (afterText.trim()) {
        elements.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap mt-2">
            {formatBold(afterText.trim())}
          </div>
        );
      }
    }

    return elements.length > 0 ? <div className="flex flex-col">{elements}</div> : <div className="whitespace-pre-wrap">{formatBold(text)}</div>;
  }

  // 1. FIRST FORMAT (Place Name: ...)
  if (text.includes('Place Name:')) {
    const placeRegex = /(?:(?:^|\n|\s)*\d+\.\s+[\s\S]*?(?=Place Name:))?Place Name:\s*([\s\S]*?)Address:\s*([\s\S]*?)Category:\s*([\s\S]*?)Description:\s*([\s\S]*?)Average Rating:\s*([\s\S]*?)(?:URL:\s*([^\s]+))?/gi;

    const elements = [];
    let lastIndex = 0;
    let match;

    while ((match = placeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText.trim()) {
          elements.push(
            <div key={`text-${lastIndex}`} className="whitespace-pre-wrap mb-2">
              {formatBold(beforeText.trim())}
            </div>
          );
        }
      }

      const [fullMatch, name, address, categoryStr, description, rating, url] = match;

      let categories = [];
      try {
        const cleaned = categoryStr.replace(/'/g, '"');
        categories = JSON.parse(cleaned);
      } catch (e) {
        categories = categoryStr.replace(/[\[\]']/g, '').split(',').map(c => c.trim().replace(/^'|'$/g, ''));
      }

      elements.push(
        <div key={`place-${match.index}`} className="my-2 bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="p-3">
            <h4 className="font-display font-bold text-sm text-primary mb-1">{name.trim()}</h4>
            <p className="text-xs text-on-surface-variant mb-2 flex items-start gap-1">
              <MapPin size={12} className="mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{address.trim()}</span>
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {categories.map((cat, idx) => cat ? (
                <span key={idx} className="text-[10px] px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">
                  {cat}
                </span>
              ) : null)}
            </div>
            <p className="text-xs text-on-surface/80 line-clamp-3 leading-relaxed">
              {description.trim()}
            </p>
          </div>
        </div>
      );

      lastIndex = placeRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      if (afterText.trim()) {
        elements.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap mt-2">
            {formatBold(afterText.trim())}
          </div>
        );
      }
    }

    return elements.length > 0 ? <div className="flex flex-col">{elements}</div> : <div className="whitespace-pre-wrap">{formatBold(text)}</div>;
  }

  // 2. SECOND FORMAT (Raw text block ending with URL: http...)
  if (text.toLowerCase().includes('url: http')) {
    const blockRegex = /([\s\S]+?)(?:\s*(?:URL|url):\s*(https?:\/\/[^\s\n]+))/gi;
    const elements = [];
    let lastIndex = 0;
    let match;

    while ((match = blockRegex.exec(text)) !== null) {
      const blockText = match[1];
      const url = match[2];

      const lines = blockText.split('\n').map(l => l.trim());

      let rating = '';
      let descLine = '';
      let categories = [];
      let address = '';
      let name = '';
      let introLines = [];

      let step = 'rating';

      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];

        if (step === 'rating') {
          if (line.includes('/5') || /^\d+(\.\d+)?$/.test(line)) {
            rating = line;
            step = 'description';
          } else if (line !== '') {
            descLine = line;
            step = 'categories';
          }
        } else if (step === 'description') {
          if (line !== '') {
            descLine = line;
            step = 'categories';
          }
        } else if (step === 'categories') {
          if (line === '') {
            step = 'address';
          } else {
            categories.unshift(line);
          }
        } else if (step === 'address') {
          if (line !== '') {
            address = line;
            step = 'name';
          }
        } else if (step === 'name') {
          if (line !== '') {
            name = line;
            step = 'intro';
          }
        } else if (step === 'intro') {
          if (line !== '') {
            introLines.unshift(line);
          }
        }
      }

      // Render any intro text preceding this place
      if (introLines.length > 0) {
        const introText = introLines.join('\n');
        elements.push(
          <div key={`intro-${match.index}`} className="whitespace-pre-wrap mb-2">
            {formatBold(introText)}
          </div>
        );
      }

      // Render the place card
      if (name && address) {
        const cleanedName = name.replace(/^\d+[\.\/\s-]+\s*/, '');

        elements.push(
          <div key={`place-${match.index}`} className="my-2 bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-3">
              <h4 className="font-display font-bold text-sm text-primary mb-1">{cleanedName}</h4>
              <p className="text-xs text-on-surface-variant mb-2 flex items-start gap-1">
                <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{address}</span>
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {categories.map((cat, idx) => cat ? (
                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">
                    {cat}
                  </span>
                ) : null)}
              </div>
              {descLine && (
                <p className="text-xs text-on-surface/80 line-clamp-3 leading-relaxed">
                  {descLine}
                </p>
              )}
            </div>
          </div>
        );
      }

      lastIndex = blockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      if (afterText.trim()) {
        elements.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap mt-2">
            {formatBold(afterText.trim())}
          </div>
        );
      }
    }

    return elements.length > 0 ? <div className="flex flex-col">{elements}</div> : <div className="whitespace-pre-wrap">{formatBold(text)}</div>;
  }

  // Fallback for standard text
  return <div className="whitespace-pre-wrap">{formatBold(text)}</div>;
};

export default function FloatingChatWidget() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const loginPopupRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionsList, setSessionsList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const getDefaultMessages = () => ([
    {
      role: 'bot',
      text: t('aiconcierge.greeting'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [messages, setMessages] = useState(getDefaultMessages());
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Update greeting language if it changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'bot') {
        return getDefaultMessages();
      }
      return prev;
    });
  }, [t]);

  // Đóng login popup khi click ra ngoài
  useEffect(() => {
    if (!showLoginPopup) return;
    const handleClickOutside = (e) => {
      if (loginPopupRef.current && !loginPopupRef.current.contains(e.target)) {
        setShowLoginPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLoginPopup]);

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }
    setShowLoginPopup(false);
    setIsOpen(true);
  };

  const handleNewChat = async () => {
    try {
      const userId = user?.username || user?.email || user?.id || 'Guest';
      const data = await createNewChat(userId);
      setSessionId(data.session_id);
      setMessages(getDefaultMessages());
      setInput('');
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Failed to create new chat session:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const userId = user?.username || user?.email || user?.id || 'Guest';
      const data = await getChatSessions(userId);
      setSessionsList(data.sessions || []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const loadHistory = async (id) => {
    try {
      setIsLoadingHistory(true);
      const userId = user?.username || user?.email || user?.id || 'Guest';
      const data = await getChatHistory(userId, id);
      setSessionId(id);

      if (data.messages && data.messages.length > 0) {
        const historyMessages = data.messages.map(msg => ({
          role: msg.role === 'assistant' ? 'bot' : 'user',
          text: msg.content,
          timestamp: ''
        }));
        setMessages(historyMessages);
      } else {
        setMessages(getDefaultMessages());
      }
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const removeSession = async (id) => {
    try {
      const userId = user?.username || user?.email || user?.id || 'Guest';
      await deleteChatSession(userId, id);
      if (id === sessionId) {
        setSessionId(null);
        setMessages(getDefaultMessages());
      }
      fetchSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const toggleSidebar = () => {
    if (!isSidebarOpen) {
      fetchSessions();
    }
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userId = user?.username || user?.email || user?.id || 'Guest';
    let currentSessionId = sessionId;

    // Auto-create session if sending first message without one
    if (!currentSessionId) {
      try {
        const newSession = await createNewChat(userId);
        currentSessionId = newSession.session_id;
        setSessionId(currentSessionId);
      } catch (err) {
        console.warn('Could not auto-create session:', err);
      }
    }

    const userMessage = input.trim();
    const userMsg = { role: 'user', text: userMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await sendChatMessage(userMessage, userId, currentSessionId);

      // Save session id if backend returns it and we didn't have one
      if (data.session_id && !currentSessionId) {
        setSessionId(data.session_id);
      }

      setMessages(prev => [...prev, {
        role: 'bot',
        text: data.reply || "Xin lỗi, tôi không có câu trả lời lúc này.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `⚠️ Lỗi: ${error.message || "Không thể kết nối đến AI Concierge. Vui lòng thử lại sau."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <style>{`
        .widget-glass {
          background: var(--bg-glass);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .widget-bot-bubble {
          background: var(--bg-surface-container);
          border: 1px solid var(--border-outline-variant);
        }
        .widget-user-bubble {
          background: linear-gradient(135deg, var(--gradient-brand-start) 0%, var(--gradient-brand-end) 100%);
          color: white;
        }
        .widget-shadow {
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(144, 156, 194, 0.1);
        }
        .login-popup-shadow {
          box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.4), 0 0 16px rgba(144, 156, 194, 0.15);
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Login Popup (hiện khi chưa đăng nhập và click button) */}
      {showLoginPopup && !isAuthenticated && (
        <div
          ref={loginPopupRef}
          className="fixed bottom-28 right-6 z-[100] w-72 widget-glass rounded-2xl border border-white/10 login-popup-shadow p-5 font-body animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          {/* Close button */}
          <button
            onClick={() => setShowLoginPopup(false)}
            className="absolute top-3 right-3 p-1 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
          >
            <X size={14} />
          </button>

          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-3">
            <Bot size={20} />
          </div>

          {/* Text */}
          <h3 className="font-display font-bold text-on-surface text-sm mb-1">AI Concierge</h3>
          <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
            Đăng nhập để trò chuyện với trợ lý AI và nhận gợi ý du lịch cá nhân hoá.
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowLoginPopup(false);
                navigate('/login', {
                  state: {
                    from: { pathname: window.location.pathname },
                    message: 'Đăng nhập để sử dụng AI Concierge.'
                  }
                });
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 rounded-full hover:bg-primary/90 transition-colors"
            >
              <LogIn size={13} />
              Đăng nhập
            </button>
            <button
              onClick={() => setShowLoginPopup(false)}
              className="px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-full transition-colors border border-outline-variant/20"
            >
              Để sau
            </button>
          </div>
        </div>
      )}

      {/* The Floating Button */}
      <button
        onClick={handleOpenChat}
        className={`fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open AI Concierge"
      >
        <MessageCircle size={28} />
        {/* Pulse indicator */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-surface rounded-full animate-pulse"></span>
      </button>

      {/* The Chat Window — chỉ render khi đã authenticated */}
      {isAuthenticated && (
        <div
          className={`fixed bottom-6 right-6 z-[100] w-[360px] md:w-[400px] h-[550px] widget-glass rounded-3xl border border-white/10 widget-shadow flex flex-col font-body transition-all duration-500 origin-bottom-right overflow-hidden ${isOpen ? 'scale-100 opacity-100 pointer-events-auto translate-y-0' : 'scale-90 opacity-0 pointer-events-none translate-y-8'}`}
        >
          {/* Sidebar Overlay */}
          <div className={`absolute inset-0 bg-surface/95 backdrop-blur-md z-40 transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/10 bg-surface-container/50">
              <h3 className="font-display font-bold text-on-surface text-sm">Lịch sử trò chuyện</h3>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sessionsList.length === 0 ? (
                <div className="text-center text-on-surface-variant text-xs mt-10">Chưa có cuộc hội thoại nào.</div>
              ) : (
                sessionsList.map(session => (
                  <div key={session.id} className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${sessionId === session.id ? 'bg-primary/10 border-primary/30' : 'bg-surface border-outline-variant/20 hover:bg-surface-container'}`} onClick={() => loadHistory(session.id)}>
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-xs font-semibold text-on-surface truncate mb-1">{session.title || 'Cuộc hội thoại'}</h4>
                      <div className="flex items-center text-[10px] text-on-surface-variant gap-1">
                        <Clock size={10} />
                        <span>{new Date(session.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeSession(session.id); }} className="p-1.5 text-error opacity-0 group-hover:opacity-100 hover:bg-error/10 rounded-md transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {isLoadingHistory && (
            <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-outline-variant/10 bg-gradient-to-r from-primary/10 to-transparent rounded-t-3xl shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={toggleSidebar} className="p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors" title="Lịch sử">
                <Menu size={20} />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary">
                  <Bot size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full"></span>
              </div>
              <div>
                <h3 className="font-display font-bold text-on-surface text-sm">AI Concierge</h3>
                <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">{t('aiconcierge.online', 'Online')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-on-surface-variant hover:bg-primary hover:text-on-primary rounded-full transition-colors font-semibold text-[11px] uppercase tracking-wide"
                aria-label="New chat session"
                title="Tạo đoạn chat mới"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Mới</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-background/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'widget-user-bubble rounded-tr-sm' : 'widget-bot-bubble text-on-surface rounded-tl-sm w-full'}`}>
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">
                      {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part)}
                    </div>
                  ) : (
                    renderMessageContent(msg.text)
                  )}
                </div>
                <span className="text-[10px] text-on-surface-variant/60 font-medium px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col gap-1 items-start">
                <div className="widget-bot-bubble px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 max-w-[85%]">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-surface/80 backdrop-blur-md rounded-b-3xl border-t border-outline-variant/10">
            <div className="flex items-center bg-surface-container border border-outline-variant/30 rounded-full p-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <button
                className="p-2 text-on-surface-variant hover:text-primary transition-colors flex-shrink-0"
                aria-label="Upload image"
              >
                <ImageIcon size={18} />
              </button>
              <input
                type="text"
                className="flex-1 w-full min-w-0 bg-transparent border-none focus:ring-0 text-sm px-2 py-2 outline-none text-on-surface placeholder:text-on-surface-variant/40 font-body"
                placeholder={t('aiconcierge.input_placeholder', 'Ask anything...')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              {input.trim() ? (
                <button
                  onClick={handleSend}
                  className="p-2.5 bg-primary text-on-primary rounded-full hover:bg-primary-container transition-colors disabled:opacity-50 flex-shrink-0"
                  disabled={!input.trim()}
                >
                  <Send size={16} className="ml-px" />
                </button>
              ) : (
                <button
                  className="p-2.5 text-on-surface-variant hover:text-primary transition-colors flex-shrink-0"
                  aria-label="Voice input"
                >
                  <Mic size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
