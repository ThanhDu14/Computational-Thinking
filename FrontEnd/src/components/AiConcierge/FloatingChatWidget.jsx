import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, Plus, LogIn, Mic, Image as ImageIcon, MapPin, Star, ExternalLink, Menu, Trash2, Loader2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { sendImageResult } from '../../services/chatService';
import './ChatCards.css';
import renderMessageContent from './ChatRenderer';

export default function FloatingChatWidget() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const loginPopupRef = useRef(null);

  const {
    sessions: sessionsList,
    currentSessionId: sessionId,
    messages,
    isTyping,
    isLoadingHistory,
    loadHistory,
    startNewChat: handleNewChat,
    sendMessage: handleSend,
    removeSession
  } = useChat();

  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const onSend = () => {
    if (!input.trim()) return;
    handleSend(input);
    setInput('');
  };

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
                  <div key={session.id} className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${sessionId === session.id ? 'bg-primary/10 border-primary/30' : 'bg-surface border-outline-variant/20 hover:bg-surface-container'}`} onClick={() => { loadHistory(session.id); setIsSidebarOpen(false); }}>
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
                      {(typeof msg.text === 'string' ? msg.text : String(msg.text || '')).split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part)}
                    </div>
                  ) : (
                    renderMessageContent(msg.text, handleSend)
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
                  onClick={onSend}
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
