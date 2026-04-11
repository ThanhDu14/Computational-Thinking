import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "px-6 py-3 md:px-8 md:py-4 rounded-full font-body font-semibold tracking-wide transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-lg";
  
  const variants = {
    primary: "bg-gradient-to-br from-primary to-primary-container text-white shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30",
    secondary: "bg-secondary-container text-on-secondary-container shadow-secondary-container/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-secondary-container/30",
    outline: "bg-transparent border border-outline-variant/30 text-on-surface shadow-none hover:border-primary/50 hover:bg-surface-container-low"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
