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
    <div className="flex h-screen w-full bg-[#f4f6fb] text-[#2c2f33] overflow-hidden font-body">
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .ai-bubble {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
        }
        .user-bubble {
          background: linear-gradient(135deg, #909CC2 0%, #C7D2FE 100%);
        }
        .ethereal-glow {
          box-shadow: 0 15px 35px -5px rgba(144, 156, 194, 0.2);
        }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-72 h-full py-8 px-4 bg-[#eef1f6] border-r border-[#d9dde4] font-medium text-sm">
        <div className="mb-12 px-4 cursor-pointer flex items-center gap-3" onClick={() => navigate('/home')}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-display font-bold text-xl tracking-tight">S</span>
          </div>
          <h1 className="text-2xl font-black text-[#2c2f33] font-display uppercase tracking-tight">SmartTravel</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-[#4f5b7d] font-bold border-r-2 border-[#4f5b7d] bg-white/40">
            <MessageSquare className="w-5 h-5" />
            <span>{t('aiconcierge.nav_chat')}</span>
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-[#585c60] hover:bg-white/40">
            <History className="w-5 h-5" />
            <span>{t('aiconcierge.nav_history')}</span>
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-[#585c60] hover:bg-white/40">
            <Compass className="w-5 h-5" />
            <span>{t('aiconcierge.nav_explore')}</span>
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-[#585c60] hover:bg-white/40">
            <Settings className="w-5 h-5" />
            <span>{t('aiconcierge.nav_settings')}</span>
          </button>
        </nav>

        <div className="mt-auto px-4 pt-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-white/20">
            <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center">
                {userAvatar 
                    ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : <span className="text-white font-bold text-sm bg-primary w-full h-full flex items-center justify-center">{userName.charAt(0).toUpperCase()}</span>
                }
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold truncate">{userName}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#585c60]">{t('aiconcierge.premium_member')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-[#f4f6fb] relative">

        {/* Header */}
        <header className="flex justify-between items-center w-full px-6 py-4 bg-white/60 backdrop-blur-xl sticky top-0 z-50 border-b border-[#d9dde4]/30 shadow-sm shadow-[#909CC2]/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#cad6ff] p-1.5 flex items-center justify-center">
                <Bot className="w-7 h-7 text-[#4f5b7d]" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#4f5b7d] to-[#909CC2] bg-clip-text text-transparent font-display">AI Concierge Assistant</h2>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{t('aiconcierge.online')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full text-[#585c60] hover:bg-white/40 transition-all"><Search className="w-5 h-5" /></button>
            <button className="p-2 rounded-full text-[#909CC2] hover:bg-white/40 transition-all"><UserCircle className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Chat Conversation Area */}
        <div className="flex-1 overflow-y-auto px-6 py-10 space-y-10 max-w-5xl mx-auto w-full scrollbar-hide">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse max-w-[85%] ml-auto' : 'max-w-[95%]'}`}>
              <div className="flex-shrink-0 mt-1">
                {msg.role === 'bot' ? (
                  <div className="w-8 h-8 rounded-full bg-[#dfe3e9] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#4f5b7d]" />
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
                <div className={`${msg.role === 'bot' ? 'ai-bubble text-[#2c2f33] border border-[#aaadb2]/10 rounded-tl-none' : 'user-bubble text-white rounded-tr-none ethereal-glow'} p-6 rounded-xl`}>
                  <p className="leading-relaxed font-body whitespace-pre-wrap">
                    {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part)}
                  </p>

                  {msg.bento && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {msg.bento.map((card, cidx) => (
                        <div key={cidx} className="bg-white/60 rounded-lg p-5 space-y-3">
                          <span className="uppercase tracking-widest text-[#4f5b7d] font-bold text-[10px]">{card.title}</span>
                          <p className="text-sm font-body">{card.desc.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part)}</p>
                          <div
                            className="h-32 rounded-lg bg-cover bg-center shadow-inner"
                            style={{ backgroundImage: `url('${card.image}')` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#585c60]/60 font-medium px-1 uppercase tracking-tighter">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3 opacity-60">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4f5b7d] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#4f5b7d] animate-bounce delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-[#4f5b7d] animate-bounce delay-200"></span>
              </div>
              <span className="text-xs text-[#585c60] font-label italic">{t('aiconcierge.thinking')}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* New Input Area */}
        <div className="p-6 md:p-8 bg-gradient-to-t from-[#f4f6fb] via-[#f4f6fb] to-transparent pt-12">
          <div className="max-w-4xl mx-auto relative group">
            {/* Visual Pulse behind input */}
            <div className="absolute inset-0 bg-[#cad6ff] blur-3xl opacity-5 rounded-full -z-10 group-focus-within:opacity-20 transition-opacity duration-500"></div>

            <div className="glass-panel p-2 rounded-full flex items-center gap-2 ethereal-glow border border-white/40 focus-within:ring-2 focus-within:ring-[#cad6ff] transition-all">
              <button className="p-3 rounded-full hover:bg-[#dfe3e9]/50 text-[#585c60]">
                <Plus className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('aiconcierge.input_placeholder')}
                className="flex-1 bg-transparent border-none focus:ring-0 text-[#2c2f33] placeholder:text-[#585c60]/50 font-body px-2"
              />
              <div className="flex items-center gap-1">
                <button className="p-3 rounded-full hover:bg-[#dfe3e9]/50 text-[#585c60]">
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-[#909CC2] to-[#C7D2FE] text-white p-3 rounded-full shadow-lg shadow-[#4f5b7d]/20 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Suggestion Chips */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <button className="text-[10px] font-label uppercase tracking-widest text-[#585c60] hover:text-[#4f5b7d] transition-colors flex items-center gap-1.5 bg-white/40 px-3 py-1.5 rounded-full border border-white/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('aiconcierge.chip_creative')}</span>
              </button>
              <button className="text-[10px] font-label uppercase tracking-widest text-[#585c60] hover:text-[#4f5b7d] transition-colors flex items-center gap-1.5 bg-white/40 px-3 py-1.5 rounded-full border border-white/40">
                <FileText className="w-3.5 h-3.5" />
                <span>{t('aiconcierge.chip_summary')}</span>
              </button>
              <button className="text-[10px] font-label uppercase tracking-widest text-[#585c60] hover:text-[#4f5b7d] transition-colors flex items-center gap-1.5 bg-white/40 px-3 py-1.5 rounded-full border border-white/40">
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
