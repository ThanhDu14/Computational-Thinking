import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const currentLang = i18n.language || '';
    const newLang = currentLang.startsWith('vi') ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

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
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors font-bold text-sm"
              aria-label="Toggle Language"
            >
              {(i18n.language || '').startsWith('vi') ? 'VI' : 'EN'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors mr-1"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

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
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
