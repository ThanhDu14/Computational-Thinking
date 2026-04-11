import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [hoveredTab, setHoveredTab] = useState(null);
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { path: '/home', label: 'Explore' },
    { path: '/destinations', label: 'Destinations' },
    { path: '/ai-concierge', label: 'AI Concierge' },
    { path: '/about', label: 'About' },
  ];

  return (
    <div className="fixed w-full z-50 top-0 left-0 px-6 pt-4 pointer-events-none transition-all duration-500">
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
              className="bg-primary hover:bg-primary-dim text-white px-6 py-3 rounded-full font-semibold text-sm hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-primary/20"
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
