import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="fixed w-full z-50 top-0 left-0 px-6 pt-6 pointer-events-none">
      <header className="pointer-events-auto bg-surface/80 backdrop-blur-2xl rounded-xl shadow-[0_10px_40px_-10px_rgba(39,44,81,0.06)] transition-all duration-300">
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
              Destinations
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Blog
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              About
            </NavLink>
          </div>

          <div className="flex flex-1 md:flex-none justify-end gap-3 font-body">
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
