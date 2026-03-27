import React from 'react';
import background from '../assets/images/background.png';
const LoginPage = ({ onNavigate }) => {
    return (
        <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center relative overflow-x-hidden">

            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <img
                    alt="Majestic alpine lake landscape"
                    className="w-full h-full object-cover"
                    src={background}
                />
            </div>

            <main className="relative z-20 w-full max-w-md px-4 py-8">
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-xl p-8 md:p-10 flex flex-col items-center">
                    <div className="flex flex-col items-center gap-3 mb-8 text-center">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined text-white text-4xl">public</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Smart Travel</h1>
                            <p className="text-white/70 text-sm mt-1">Explore the world with intelligence</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="w-full mb-8">
                        <div className="flex border-b border-white/10 gap-8 justify-center">
                            <a className="flex flex-col items-center justify-center border-b-[3px] border-primary text-white pb-3 transition-all duration-300" href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>
                                <p className="text-sm font-bold leading-normal tracking-wide">Login</p>
                            </a>
                            <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-white/50 hover:text-white/80 pb-3 transition-all duration-300" href="#" onClick={(e) => { e.preventDefault(); onNavigate('register'); }}>
                                <p className="text-sm font-bold leading-normal tracking-wide">Register</p>
                            </a>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="w-full space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label className="text-white/90 text-sm font-medium ml-1">Email or Username</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-xl">mail</span>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Enter your email"
                                    type="text"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-white/90 text-sm font-medium ml-1">Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-xl">lock</span>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Enter your password"
                                    type="password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                                    type="checkbox"
                                />
                                <span className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Remember me</span>
                            </label>
                            <a className="text-primary hover:text-primary/80 text-xs font-medium transition-colors" href="#">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4"
                            type="submit">
                            Login to Adventure
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="w-full flex items-center gap-4 my-8">
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                        <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">Or Continue With</span>
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all group">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.22-1.8 4.22-1.12 1.12-2.8 2.32-5.92 2.32-4.72 0-8.6-3.8-8.6-8.52s3.88-8.52 8.6-8.52c2.56 0 4.52.92 6.04 2.36l2.32-2.32c-1.92-1.88-4.52-3.12-8.36-3.12-6.52 0-12 5.2-12 11.76s5.48 11.76 12 11.76c3.56 0 6.24-1.16 8.32-3.32 2.16-2.12 2.84-5.12 2.84-7.52 0-.48-.04-1.04-.12-1.52h-11.12z"
                                    fill="#EA4335">
                                </path>
                            </svg>
                            <span className="text-white text-sm font-medium">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all group">
                            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                            </svg>
                            <span className="text-white text-sm font-medium">Facebook</span>
                        </button>
                    </div>

                    {/* Footer Link */}
                    <p className="mt-8 text-white/50 text-sm">
                        Don't have an account?
                        <a className="text-primary font-bold hover:underline underline-offset-4 ml-1" href="#" onClick={(e) => { e.preventDefault(); onNavigate('register'); }}>Create Account</a>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
