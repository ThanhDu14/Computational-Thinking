import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Sun, Moon, LogOut, ChevronDown, User, Heart, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WishlistDrawer from '../common/WishlistDrawer';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [hoveredTab, setHoveredTab] = useState(null);
  const location = useLocation();

  const { isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlist, setIsWishlistOpen } = useWishlist();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const toggleLanguage = () => {
    const currentLang = i18n.language || '';
    const newLang = currentLang.startsWith('vi') ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { path: '/home', label: t('nav.explore', 'Explore') },
    { path: '/destinations', label: t('nav.destinations', 'Destinations') },
    { path: '/ai-concierge', label: t('nav.ai_concierge', 'AI Concierge') },
    { path: '/about', label: t('nav.about', 'About') },
  ];

  return (
    <div className="fixed w-full z-[100] top-0 left-0 px-6 pt-4 pointer-events-none transition-all duration-500">
      <header className={`pointer-events-auto rounded-xl transition-all duration-500 ${isScrolled ? 'bg-surface/95 backdrop-blur-3xl shadow-[0_10px_40px_-10px_rgba(39,44,81,0.15)] translate-y-0' : 'bg-surface/60 backdrop-blur-md shadow-sm translate-y-2'}`}>
        <nav className={`container mx-auto px-6 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'}`}>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-display font-bold text-xl tracking-tight">S</span>
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-on-surface">
              SmartTravel
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2 font-body font-medium text-[15px]">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onMouseEnter={() => setHoveredTab(link.path)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`relative px-4 py-2 transition-colors duration-200 ${isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {hoveredTab === link.path && !isActive && (
                    <motion.div
                      layoutId="nav-hover"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/30 rounded-t-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </Link>
              );
            })}
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

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-surface-variant/50 transition-colors text-on-surface"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated && (
              <button
                onClick={() => setIsWishlistOpen(prev => !prev)}
                className="relative p-2 rounded-full text-on-surface-variant hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mr-2"
                aria-label="Wishlist"
              >
                <Heart size={20} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
                {wishlist.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
                    {wishlist.length}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              /* User Menu (khi đã đăng nhập) */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(prev => !prev)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-primary/5 transition-colors group"
                >
                  {/* Avatar circle */}
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20 overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      avatarLetter
                    )}
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
                      {t('nav.recommendations', 'Recommendations')}
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); setIsWishlistOpen(prev => !prev); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Heart size={15} />
                      {t('nav.wishlist', 'Wishlist')} ({wishlist.length})
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Settings size={15} />
                      {t('nav.settings', 'Settings')}
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
                  {t('nav.login', 'Login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
                >
                  {t('nav.register', 'Register')}
                </Link>
                <div className="h-6 w-px bg-outline-variant/30 mx-2 hidden md:block"></div>
                <Link
                  to="/recommendations"
                  className="bg-primary hover:bg-primary-dim text-white px-6 py-3 rounded-full font-semibold text-sm scale-95 hover:scale-100 active:scale-90 transition-all shadow-lg shadow-primary/20"
                >
                  {t('nav.get_recommendations', 'Get recommendations')}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <WishlistDrawer />
    </div>
  );
};

export default Navbar;
