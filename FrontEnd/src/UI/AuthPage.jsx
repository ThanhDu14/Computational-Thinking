import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

const FIREBASE_ERRORS = {
  'auth/user-not-found':        'Không tìm thấy tài khoản với email này.',
  'auth/wrong-password':        'Mật khẩu không đúng. Vui lòng thử lại.',
  'auth/email-already-in-use':  'Email này đã được đăng ký. Hãy đăng nhập.',
  'auth/invalid-email':         'Địa chỉ email không hợp lệ.',
  'auth/weak-password':         'Mật khẩu quá yếu. Dùng ít nhất 6 ký tự.',
  'auth/popup-closed-by-user':  'Cửa sổ đăng nhập đã bị đóng.',
  'auth/network-request-failed':'Lỗi mạng. Vui lòng kiểm tra kết nối.',
  'auth/too-many-requests':     'Quá nhiều lần thử. Vui lòng thử lại sau.',
  'auth/invalid-credential':    'Email hoặc mật khẩu không đúng.',
};

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, register, loginWithGoogle, isAuthenticated } = useAuth();
    const [isLogin, setIsLogin] = useState(location.pathname === '/login');
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Message khi bị redirect từ protected route
    const redirectMessage = location.state?.message;
    // Trang cần quay lại sau khi login
    const fromPath = location.state?.from?.pathname || '/home';

    // Nếu đã login rồi thì không cần ở đây
    useEffect(() => {
        if (isAuthenticated) {
            navigate(fromPath, { replace: true });
        }
    }, [isAuthenticated, navigate, fromPath]);

    const handleToggle = (mode) => {
        setError('');
        setIsLogin(mode === 'login');
        if (mode === 'login') navigate('/login', { state: location.state });
        else navigate('/register', { state: location.state });
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            if (!formData.username || !formData.password) {
                setError('Vui lòng nhập đầy đủ thông tin.');
                return;
            }
        } else {
            if (!formData.username || !formData.password || !formData.confirmPassword) {
                setError('Vui lòng nhập đầy đủ thông tin.');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Mật khẩu xác nhận không khớp.');
                return;
            }
            if (formData.password.length < 6) {
                setError('Mật khẩu phải có ít nhất 6 ký tự.');
                return;
            }
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await login(formData.username, formData.password);
            } else {
                await register(formData.username, formData.password, formData.confirmPassword);
            }
            // onAuthStateChanged sẽ tự cập nhật user → useEffect sẽ navigate
        } catch (err) {
            const msg = FIREBASE_ERRORS[err.code] || `Đã xảy ra lỗi: ${err?.response?.data?.error || err.message}`;
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            const msg = FIREBASE_ERRORS[err.code] || `Đã xảy ra lỗi: ${err.message}`;
            setError(msg);
        } finally {
            setIsLoading(false);
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/60 hidden lg:block"></div>
            </div>

            {/* Split Content Container */}
            <div className="relative z-10 w-full max-w-[1440px] px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">
                
                {/* Left Section: Branding & Marketing */}
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

                    {/* Social Proof */}
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

                {/* Right Section: Auth Card */}
                <div className="w-full max-w-[480px] lg:ml-auto animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
                    <div className="bg-[#1c1f2e]/60 backdrop-blur-[24px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[40px] p-8 md:p-12 flex flex-col">
                        
                        {/* Redirect Notice */}
                        {redirectMessage && (
                            <div className="mb-6 flex items-center gap-3 bg-blue-500/10 border border-blue-400/20 rounded-2xl px-4 py-3">
                                <LogIn className="w-4 h-4 text-blue-300 shrink-0" />
                                <p className="text-blue-200 text-sm font-medium">{redirectMessage}</p>
                            </div>
                        )}

                        {/* Error Notice */}
                        {error && (
                            <div className="mb-4 flex items-center gap-3 bg-red-500/10 border border-red-400/20 rounded-2xl px-4 py-3">
                                <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
                                <p className="text-red-200 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Card Header */}
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-white/50 text-sm font-medium">Continue your ethereal journey.</p>
                        </div>

                        {/* Toggle Pill */}
                        <div className="w-full bg-black/40 p-1 rounded-full mb-8 border border-white/5 relative flex items-center h-12">
                            <div 
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-blue-400/80 to-purple-500/80 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg shadow-purple-600/20 ${isLogin ? 'left-1' : 'left-[calc(50%+1px)]'}`}
                            ></div>
                            <button 
                                type="button"
                                className={`flex-1 relative z-10 text-[11px] font-black tracking-[0.1em] transition-colors duration-300 ${isLogin ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                                onClick={() => handleToggle('login')}
                            >
                                LOGIN
                            </button>
                            <button 
                                type="button"
                                className={`flex-1 relative z-10 text-[11px] font-black tracking-[0.1em] transition-colors duration-300 ${!isLogin ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                                onClick={() => handleToggle('register')}
                            >
                                REGISTER
                            </button>
                        </div>

                        {/* Form */}
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-400">
                                <label className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em] ml-5">Username</label>
                                <input
                                    name="username"
                                    className="w-full bg-black/20 border border-white/5 rounded-full py-4 px-7 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition-all font-body text-sm shadow-inner"
                                    placeholder="Username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-5 mr-3">
                                    <label className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em]">Secret Key</label>
                                    {isLogin && (
                                        <button type="button" className="text-blue-300/60 text-[9px] font-bold hover:text-blue-300 transition-colors uppercase tracking-wider">Forgot Access?</button>
                                    )}
                                </div>
                                <input
                                    name="password"
                                    className="w-full bg-black/20 border border-white/5 rounded-full py-4 px-7 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition-all font-body text-sm shadow-inner"
                                    placeholder="••••••••••••"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            {!isLogin && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-400">
                                    <label className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em] ml-5">Verify Key</label>
                                    <input
                                        name="confirmPassword"
                                        className="w-full bg-black/20 border border-white/5 rounded-full py-4 px-7 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition-all font-body text-sm shadow-inner"
                                        placeholder="Confirm Password"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            <button
                                className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-300 hover:to-purple-400 text-white font-black py-4 rounded-full shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.97] mt-8 text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    isLogin ? 'Begin Your Ascent' : 'Join the Voyage'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="w-full flex items-center gap-4 my-8">
                            <div className="h-[1px] flex-1 bg-white/5"></div>
                            <span className="text-white/20 text-[8px] font-black tracking-[0.2em] uppercase">Or Connecting Via</span>
                            <div className="h-[1px] flex-1 bg-white/5"></div>
                        </div>

                        {/* Social Buttons */}
                        <div className="flex items-center gap-3">
                            {/* Google Button */}
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2.5 bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/20 py-3.5 px-4 rounded-2xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {/* Official Google Logo SVG */}
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                                    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                                </svg>
                                <span className="text-white/50 text-xs font-semibold group-hover:text-white transition-colors">Google</span>
                            </button>

                            {/* Facebook Button */}
                            <button
                                type="button"
                                className="flex-1 flex items-center justify-center gap-2.5 bg-white/5 border border-white/10 hover:bg-[#1877F2]/20 hover:border-[#1877F2]/30 py-3.5 px-4 rounded-2xl transition-all duration-200 group"
                            >
                                {/* Official Facebook Logo SVG */}
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                                    <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938h-6.094V24h6.094v-5.291c0-6.018 3.584-9.34 9.066-9.34 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.912 1.85-3.912 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24z"/>
                                    <path fill="#fff" d="m33.342 30.938 1.064-6.938H27.75v-4.506c0-1.898.931-3.75 3.912-3.75h3.026v-5.906s-2.747-.469-5.372-.469c-5.482 0-9.066 3.322-9.066 9.34V24h-6.094v6.938h6.094v16.77a24.2 24.2 0 0 0 3.75.292c1.274 0 2.528-.1 3.75-.292V30.938h5.592z"/>
                                </svg>
                                <span className="text-white/50 text-xs font-semibold group-hover:text-[#1877F2] transition-colors">Facebook</span>
                            </button>
                        </div>

                        <p className="mt-10 text-center">
                            <button 
                                type="button"
                                className="text-white/30 text-[10px] font-bold hover:text-white/60 transition-colors tracking-wide uppercase"
                                onClick={() => handleToggle(isLogin ? 'register' : 'login')}
                            >
                                {isLogin ? 'New to the fleet? ' : 'Already a member? '}
                                <span className="text-blue-300">{isLogin ? 'Apply for Membership' : 'Sign In'}</span>
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
