import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, History, Compass, Settings,
  Search, UserCircle, Bot, Send, Plus,
  Mic, Sparkles, FileText, Image as ImageIcon,
  MoreHorizontal, ChevronRight, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { 
  sendImageResult 
} from '../../services/chatService';

export default function AiConciergePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    sessions, 
    currentSessionId, 
    messages, 
    isTyping, 
    loadHistory, 
    startNewChat, 
    sendMessage,
    removeSession 
  } = useChat();

  const [input, setInput] = useState('');
  const userAvatar = user?.photoURL || user?.picture || user?.avatar || null;
  const userName = user?.displayName || user?.name || user?.username || 'Khách';
  
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống khi có tin nhắn mới hoặc AI đang trả lời
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Ngưỡng rộng hơn để nhận diện người dùng đang ở vùng dưới cùng
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 500;
    
    if (isAtBottom) {
      // Cuộn xuống cuối cùng để thấy nội dung mới nhất
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-96px)] mt-[96px] w-full bg-background text-on-surface overflow-hidden font-body">
      <style>{`
        .glass-panel {
          background: var(--bg-glass);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .ai-bubble {
          background: var(--bg-surface-container);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-outline-variant);
        }
        .user-bubble {
          background: linear-gradient(135deg, var(--gradient-brand-start) 0%, var(--gradient-brand-end) 100%);
        }
        .ethereal-glow {
          box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-72 h-full py-8 px-4 bg-surface-container-low border-r border-outline-variant/30 font-medium text-sm">
        <div className="mb-12 px-4 cursor-pointer flex items-center gap-3" onClick={() => navigate('/home')}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-on-surface font-display uppercase tracking-tight">AI Concierge</h1>
        </div>

        <button 
          onClick={startNewChat}
          className="flex items-center gap-3 w-full px-4 py-3 mb-6 rounded-xl transition-all text-white font-bold bg-primary hover:bg-primary/90 shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Đoạn chat mới</span>
        </button>

        <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
          <p className="px-4 text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-2">Gần đây</p>
          {sessions.map((session) => (
            <div 
              key={session.id}
              className={`group flex items-center gap-2 w-full px-4 py-3 rounded-xl transition-all text-left mb-1 ${currentSessionId === session.id ? 'text-primary font-bold bg-primary/10 border-r-2 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              <button 
                onClick={() => loadHistory(session.id)}
                className="flex items-center gap-3 flex-1 overflow-hidden"
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm">{session.title || "Cuộc hội thoại mới"}</span>
                  <span className="text-[9px] opacity-50 font-normal">
                    {session.created_at ? new Date(session.created_at).toLocaleString('vi-VN', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : ""}
                  </span>
                </div>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm("Xóa cuộc hội thoại này?")) removeSession(session.id);
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-on-surface-variant/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="px-4 py-8 text-center text-on-surface-variant/40 italic text-xs">
              Chưa có cuộc hội thoại nào
            </div>
          )}
        </nav>

        <div className="mt-auto px-4 pt-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-high border border-outline-variant/20">
            <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center">
                {userAvatar 
                    ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : <span className="text-white font-bold text-sm bg-primary w-full h-full flex items-center justify-center">{userName.charAt(0).toUpperCase()}</span>
                }
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold truncate text-on-surface">{userName}</p>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{t('aiconcierge.premium_member')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">

        {/* Header */}

        {/* Chat Conversation Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-10 space-y-10 max-w-5xl mx-auto w-full scrollbar-hide"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-item flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse max-w-[85%] ml-auto' : 'max-w-[95%]'}`}>
              <div className="flex-shrink-0 mt-1">
                {msg.role === 'bot' ? (
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/10">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center">
                    {userAvatar
                      ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : <span className="text-white font-bold text-xs bg-primary w-full h-full flex items-center justify-center">{userName.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                )}
              </div>
              <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`${msg.role === 'bot' ? 'ai-bubble text-on-surface border-outline-variant/10 rounded-tl-none' : 'user-bubble text-white rounded-tr-none ethereal-glow'} p-6 rounded-xl`}>
                  <p className="leading-relaxed font-body whitespace-pre-wrap text-sm">
                    {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part)}
                  </p>

                  {msg.bento && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {msg.bento.map((card, cidx) => (
                        <div key={cidx} className="bg-surface/40 backdrop-blur-md rounded-lg p-5 space-y-3 border border-outline-variant/10">
                          <span className="uppercase tracking-widest text-primary font-bold text-[10px]">{card.title}</span>
                          <p className="text-sm font-body text-on-surface-variant">{card.desc.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part)}</p>
                          <div
                            className="h-32 rounded-lg bg-cover bg-center shadow-inner"
                            style={{ backgroundImage: `url('${card.image}')` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-on-surface-variant opacity-60 font-medium px-1 uppercase tracking-tighter">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3 opacity-60">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200"></span>
              </div>
              <span className="text-xs text-on-surface-variant font-label italic">{t('aiconcierge.thinking')}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* New Input Area */}
        <div className="p-6 md:p-8 bg-gradient-to-t from-background via-background to-transparent pt-12">
          <div className="max-w-4xl mx-auto relative group">
            {/* Visual Pulse behind input */}
            <div className="absolute inset-0 bg-primary-container blur-3xl opacity-5 rounded-full -z-10 group-focus-within:opacity-20 transition-opacity duration-500"></div>

            <div className="glass-panel p-2 rounded-full flex items-center gap-2 ethereal-glow border border-outline-variant/20 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <button className="p-3 rounded-full hover:bg-surface-container-highest/50 text-on-surface-variant transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('aiconcierge.input_placeholder')}
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/50 font-body px-2"
              />
              <div className="flex items-center gap-1">
                <button className="p-3 rounded-full hover:bg-surface-container-highest/50 text-on-surface-variant transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-primary to-primary/60 text-white p-3 rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Suggestion Chips */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <button className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 bg-surface-container/40 px-3 py-1.5 rounded-full border border-outline-variant/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('aiconcierge.chip_creative')}</span>
              </button>
              <button className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 bg-surface-container/40 px-3 py-1.5 rounded-full border border-outline-variant/10">
                <FileText className="w-3.5 h-3.5" />
                <span>{t('aiconcierge.chip_summary')}</span>
              </button>
              <button className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 bg-surface-container/40 px-3 py-1.5 rounded-full border border-outline-variant/10">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{t('aiconcierge.chip_image')}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
