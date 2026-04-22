import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, MoreHorizontal, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function FloatingChatWidget() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const loginPopupRef = useRef(null);

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

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: t('aiconcierge.bot_msg_2') || "I am analyzing your preferences to find the best spots. Please wait a moment!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1500);
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
          className={`fixed bottom-6 right-6 z-[100] w-[360px] md:w-[400px] h-[550px] widget-glass rounded-3xl border border-white/10 widget-shadow flex flex-col font-body transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto translate-y-0' : 'scale-90 opacity-0 pointer-events-none translate-y-8'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-outline-variant/10 bg-gradient-to-r from-primary/10 to-transparent rounded-t-3xl">
            <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-1">
               <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                  <MoreHorizontal size={20} />
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
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'widget-user-bubble rounded-tr-sm' : 'widget-bot-bubble text-on-surface rounded-tl-sm'}`}>
                    {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part)}
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
               <input 
                 type="text" 
                 className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-2 outline-none text-on-surface placeholder:text-on-surface-variant/40 font-body"
                 placeholder={t('aiconcierge.input_placeholder', 'Ask anything...')}
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <button 
                 onClick={handleSend}
                 className="p-2.5 bg-primary text-on-primary rounded-full hover:bg-primary-container transition-colors disabled:opacity-50"
                 disabled={!input.trim()}
               >
                 <Send size={16} className="ml-px" />
               </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
