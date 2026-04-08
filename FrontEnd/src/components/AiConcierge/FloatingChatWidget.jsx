import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FloatingChatWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // We only initialize the default messages when the component mounts or translation changes
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
      // Only swap out if it's just the initial greeting to prevent overriding user chat history purely from lang switch
      if (prev.length === 1 && prev[0].role === 'bot') {
        return getDefaultMessages();
      }
      return prev;
    });
  }, [t]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simple mock AI response logic mimicking the full page
    setTimeout(() => {
      // If the user says something specific, we could mock the itinerary, but for a global widget, a generic smart response works too.
      // We will just use the pre-translated bot_msg_2 for any query for this demo
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
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .widget-bot-bubble {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(144, 156, 194, 0.2);
        }
        .widget-user-bubble {
          background: linear-gradient(135deg, #4f5b7d 0%, #909CC2 100%);
          color: white;
        }
        .widget-shadow {
          box-shadow: 0 20px 40px -10px rgba(39, 44, 81, 0.15), 0 0 20px rgba(202, 214, 255, 0.3);
        }
      `}</style>

      {/* The Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-[#909CC2] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open AI Concierge"
      >
        <MessageCircle size={28} />
        {/* Pulse indicator */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
      </button>

      {/* The Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 z-[100] w-[360px] md:w-[400px] h-[550px] widget-glass rounded-2xl border border-white/40 widget-shadow flex flex-col font-body transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto translate-y-0' : 'scale-90 opacity-0 pointer-events-none translate-y-8'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-gradient-to-r from-[#cad6ff]/20 to-transparent rounded-t-2xl">
          <div className="flex items-center gap-3">
             <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bot size={20} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-display font-bold text-on-surface text-sm">AI Concierge</h3>
              <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">{t('aiconcierge.online', 'Online')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <button className="p-2 text-on-surface-variant hover:bg-surface/50 rounded-full transition-colors">
                <MoreHorizontal size={20} />
             </button>
             <button 
               onClick={() => setIsOpen(false)}
               className="p-2 text-on-surface-variant hover:bg-surface/50 rounded-full transition-colors"
             >
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-[#f4f6fb]/50">
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
               <div className="widget-bot-bubble px-4 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2 max-w-[85%]">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"></span>
                 <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-100"></span>
                 <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-200"></span>
               </div>
            </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-surface/80 rounded-b-2xl border-t border-outline-variant/10">
           <div className="flex items-center bg-white border border-outline-variant/30 rounded-full p-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
             <input 
               type="text" 
               className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 py-2 outline-none text-on-surface font-body"
               placeholder={t('aiconcierge.input_placeholder', 'Ask anything...')}
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
             <button 
               onClick={handleSend}
               className="p-2.5 bg-primary text-white rounded-full hover:bg-primary-dim transition-colors"
               disabled={!input.trim()}
             >
               <Send size={16} className="ml-px" />
             </button>
           </div>
        </div>
      </div>
    </>
  );
}
