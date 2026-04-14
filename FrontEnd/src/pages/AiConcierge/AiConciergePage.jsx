import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, History, Compass, Settings,
  Search, UserCircle, Bot, Send, Plus,
  Mic, Sparkles, FileText, Image as ImageIcon,
  MoreHorizontal, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function AiConciergePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const userAvatar = user?.photoURL || user?.picture || null;
  const userName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'Khách';
  const getDefaultMessages = () => ([
    {
      role: 'bot',
      text: t('aiconcierge.greeting'),
      timestamp: "09:41 AM"
    },
    {
      role: 'user',
      text: t('aiconcierge.user_msg_1'),
      timestamp: "09:42 AM"
    },
    {
      role: 'bot',
      text: t('aiconcierge.bot_msg_1'),
      timestamp: "09:43 AM",
      bento: [
        {
          title: t('aiconcierge.bento_1_title'),
          desc: t('aiconcierge.bento_1_desc'),
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdqQfrN_7P3KExVi90-KVCRh--TLzeEpafRypdQoAfPN40HMfqX-n9mukgaXaaBeRIbAd281qF8wz67nMbNTWG9em-WFQNeewzC5nzea3hSaG3jsgEdMXJgWnHgAuF-MbWcs7GGZa6PBktj9m__Ai6Z1fmY_-aTkMECG7HfbAInfV8GfBDq650J2XeEzV8wRqqiH2d7h7ii5-GuF5FVZqtLU8i8NsGrfRY-XlibwFARPEFOJ5eo68UgzxuceW9q3Vz-s7yhvRhKbHi"
        },
        {
          title: t('aiconcierge.bento_2_title'),
          desc: t('aiconcierge.bento_2_desc'),
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmXyTYv-lNJnebpV7dr9B6OR_Kpz2tk3s6Hgj47A5VJFN_k3wZDudtI2jT_ZXPsh5DOCNFIrt_B07N-gMN2YuO3Sn-OTImSpKMIenrKtW1aAIm3JXwfk4QrAJF-yEurvYiJ5lbG8V2wsDdXO24QTZQTBVxz1miCjoIpqgE9Syk2km8KpMeu1NFGDc7AvMupfseI0UFSnLYglbQryYqCHISlX8ljRKOD5SlPE5rNy7xZA4IpCydIGKrwlZ_Ygwsbs9mQiacRJF_yFdw"
        }
      ]
    }
  ]);

  const [messages, setMessages] = useState(getDefaultMessages());
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 3) return getDefaultMessages();
      return prev;
    });
  }, [t]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: t('aiconcierge.bot_msg_2'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full bg-background text-on-surface overflow-hidden font-body pt-24">
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

        <nav className="flex-1 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-primary font-bold border-r-2 border-primary bg-primary/10">
            <MessageSquare className="w-5 h-5" />
            <span>{t('aiconcierge.nav_chat')}</span>
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-on-surface-variant hover:bg-surface-container-high">
            <History className="w-5 h-5" />
            <span>{t('aiconcierge.nav_history')}</span>
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-on-surface-variant hover:bg-surface-container-high">
            <Compass className="w-5 h-5" />
            <span>{t('aiconcierge.nav_explore')}</span>
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-on-surface-variant hover:bg-surface-container-high">
            <Settings className="w-5 h-5" />
            <span>{t('aiconcierge.nav_settings')}</span>
          </button>
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
        <div className="flex-1 overflow-y-auto px-6 py-10 space-y-10 max-w-5xl mx-auto w-full scrollbar-hide">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse max-w-[85%] ml-auto' : 'max-w-[95%]'}`}>
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
