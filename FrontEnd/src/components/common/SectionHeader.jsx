import React from 'react';

const SectionHeader = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {subtitle && (
        <span className="text-secondary font-body font-bold text-sm tracking-widest uppercase">
          {subtitle}
        </span>
      )}
      <h2 className="text-4xl md:text-5xl font-display font-bold text-on-surface tracking-tight leading-tight">
        {title}
      </h2>
    </div>
  );
};

export default SectionHeader;
