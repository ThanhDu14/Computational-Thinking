import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, LogOut, ChevronDown, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const toggleLanguage = () => {
    const currentLang = i18n.language || '';
    const newLang = currentLang.startsWith('vi') ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/home');
  };

  // Lấy chữ cái đầu của tên để làm avatar
  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="fixed w-full z-50 top-0 left-0 pointer-events-none">
      <header className="pointer-events-auto bg-surface/80 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(39,44,81,0.06)] transition-all duration-300">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-display font-bold text-xl tracking-tight">S</span>
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-on-surface">
              SmartTravel
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10 font-body font-medium text-[15px]">
            <NavLink
              to="/home"
              className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Explore
            </NavLink>
            <NavLink
              to="/destinations"
              className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              {t('nav.destinations', 'Destinations')}
            </NavLink>
            <NavLink
              to="/ai-concierge"
              className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              AI Concierge
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              {t('nav.about', 'About')}
            </NavLink>
          </div>

          <div className="flex flex-1 md:flex-none justify-end gap-3 font-body items-center">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors font-bold text-sm"
              aria-label="Toggle Language"
            >
              {(i18n.language || '').startsWith('vi') ? 'VI' : 'EN'}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors mr-1"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              /* User Menu (khi đã đăng nhập) */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(prev => !prev)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-primary/5 transition-colors group"
                >
                  {/* Avatar circle */}
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20">
                    {avatarLetter}
                  </div>
                  <span className="text-sm font-semibold text-on-surface hidden md:block max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown size={14} className={`text-on-surface-variant transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-surface/95 backdrop-blur-xl rounded-2xl shadow-xl border border-outline-variant/20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-outline-variant/10">
                      <p className="text-sm font-bold text-on-surface truncate">{user?.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                    </div>
                    {/* Menu Items */}
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/recommendations'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <User size={15} />
                      Recommendations
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-b-2xl"
                    >
                      <LogOut size={15} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register buttons (khi chưa đăng nhập) */
              <>
                <Link
                  to="/login"
                  className="text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors px-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
                >
                  Register
                </Link>
                <div className="h-6 w-px bg-outline-variant/30 mx-2 hidden md:block"></div>
                <Link
                  to="/recommendations"
                  className="bg-primary hover:bg-primary-dim text-white px-6 py-3 rounded-full font-semibold text-sm scale-95 active:scale-90 transition-all shadow-lg shadow-primary/20"
                >
                  Get recommendations
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
