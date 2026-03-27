import React from 'react';

const GlassCard = ({ children, className = '', hoverEffect = false, ...props }) => {
  const hoverClasses = hoverEffect 
    ? "hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(39,44,81,0.08)] transition-all duration-400"
    : "";

  return (
    <div 
      className={`bg-surface-container-lowest/70 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
