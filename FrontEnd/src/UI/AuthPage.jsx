import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(location.pathname === '/login');


    const handleToggle = (mode) => {
        if (mode === 'login') {
            navigate('/login');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-display selection:bg-purple-500/30 flex items-center justify-center lg:items-stretch">
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2600&auto=format&fit=crop" 
                    alt="Maldives Night Resort" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                {/* Subtle gradient to darken the right side for the form */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/60 hidden lg:block"></div>
            </div>

            {/* Split Content Container */}
            <div className="relative z-10 w-full max-w-[1440px] px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">
                
                {/* Left Section: Branding & Marketing (Hidden on small screens or centered) */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="mb-8 cursor-pointer group" onClick={() => navigate('/')}>
                        <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-none mb-4">
                            SmartTravel
                        </h1>
                        <p className="text-xl lg:text-2xl text-white/80 font-medium max-w-lg leading-relaxed">
                            The voyage doesn't start at the gate. <br className="hidden lg:block" />
                            It begins with a single <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 italic font-serif">ascent.</span>
                        </p>
                    </div>

                    {/* Social Proof Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 lg:mt-12">
                        <div className="flex -space-x-3 overflow-hidden">
                            <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white/10 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Voyager 1" />
                            <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white/10 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="Voyager 2" />
                            <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white/10 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Voyager 3" />
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/10 backdrop-blur-sm">
                                <span className="text-xs font-bold text-white">+</span>
                            </div>
                        </div>
                        <p className="text-sm text-white/60 font-medium tracking-wide">
                            Join 15,000+ elite voyagers today.
                        </p>
                    </div>
                </div>

                {/* Right Section: Auth Card Area */}
                <div className="w-full max-w-[480px] lg:ml-auto animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
                    <div className="bg-[#1c1f2e]/60 backdrop-blur-[24px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[40px] p-8 md:p-12 flex flex-col">
                        
                        {/* Card Header */}
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-white/50 text-sm font-medium">Continue your ethereal journey.</p>
                        </div>

                        {/* Premium Toggle Pill */}
                        <div className="w-full bg-black/40 p-1 rounded-full mb-8 border border-white/5 relative flex items-center h-12">
                            <div 
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-blue-400/80 to-purple-500/80 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg shadow-purple-600/20 ${isLogin ? 'left-1' : 'left-[calc(50%+1px)]'}`}
                            ></div>
                            <button 
                                className={`flex-1 relative z-10 text-[11px] font-black tracking-[0.1em] transition-colors duration-300 ${isLogin ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                                onClick={() => handleToggle('login')}
                            >
                                LOGIN
                            </button>
                            <button 
                                className={`flex-1 relative z-10 text-[11px] font-black tracking-[0.1em] transition-colors duration-300 ${!isLogin ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                                onClick={() => handleToggle('register')}
                            >
                                REGISTER
                            </button>
                        </div>

                        {/* Modern Form */}
                        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                            {!isLogin && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-400">
                                    <label className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em] ml-5">Voyager Name</label>
                                    <input
                                        className="w-full bg-black/20 border border-white/5 rounded-full py-4 px-7 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition-all font-body text-sm shadow-inner"
                                        placeholder="Full Name"
                                        type="text"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em] ml-5">Email Address</label>
                                <input
                                    className="w-full bg-black/20 border border-white/5 rounded-full py-4 px-7 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition-all font-body text-sm shadow-inner"
                                    placeholder="navigator@voyage.com"
                                    type="email"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-5 mr-3">
                                    <label className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em]">Secret Key</label>
                                    {isLogin && (
                                        <button className="text-blue-300/60 text-[9px] font-bold hover:text-blue-300 transition-colors uppercase tracking-wider">Forgot Access?</button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <input
                                        className="w-full bg-black/20 border border-white/5 rounded-full py-4 px-7 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition-all font-body text-sm shadow-inner"
                                        placeholder="••••••••••••"
                                        type="password"
                                    />
                                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-white/20 text-lg cursor-pointer hover:text-white/50 transition-colors">visibility</span>
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-400">
                                    <label className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em] ml-5">Verify Key</label>
                                    <input
                                        className="w-full bg-black/20 border border-white/5 rounded-full py-4 px-7 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition-all font-body text-sm shadow-inner"
                                        placeholder="Confirm Password"
                                        type="password"
                                    />
                                </div>
                            )}

                            <button
                                className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-300 hover:to-purple-400 text-white font-black py-4.5 rounded-full shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.97] mt-8 text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2 group"
                                type="submit">
                                {isLogin ? 'Begin Your Ascent' : 'Join the Voyage'}
                            </button>
                        </form>

                        {/* Simple Divider */}
                        <div className="w-full flex items-center gap-4 my-8">
                            <div className="h-[1px] flex-1 bg-white/5"></div>
                            <span className="text-white/20 text-[8px] font-black tracking-[0.2em] uppercase">Or Connecting Via</span>
                            <div className="h-[1px] flex-1 bg-white/5"></div>
                        </div>

                        {/* Minimalist Social Icons */}
                        <div className="flex items-center justify-center gap-4">
                            <button className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 py-3 rounded-2xl transition-all flex items-center justify-center group">
                                <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">Google</span>
                            </button>
                            <button className="w-12 h-12 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center group transition-all">
                                <svg className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12.073 23.027V14.642H14.87l.532-3.47h-3.328V9.43c0-.95.465-1.874 1.956-1.874h1.516V4.603s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.248H7.078v3.47h3.047v8.385c.618.096 1.25.146 1.895.146.018 0 .035 0 .053 0z" /></svg>
                            </button>
                            <button className="w-12 h-12 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center group transition-all">
                                <span className="material-symbols-outlined text-white/40 group-hover:text-white transition-colors text-xl">devices</span>
                            </button>
                        </div>

                        <p className="mt-10 text-center">
                            <button className="text-white/30 text-[10px] font-bold hover:text-white/60 transition-colors tracking-wide uppercase">
                                New to the fleet? <span className="text-blue-300">Apply for Membership</span>
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
