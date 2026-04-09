import { motion } from 'framer-motion';

const AnimatedButton = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "px-6 py-3 md:px-8 md:py-4 rounded-full font-body font-semibold tracking-wide inline-flex items-center justify-center gap-2 shadow-lg relative overflow-hidden transition-shadow duration-300";
  
  const variants = {
    primary: "bg-primary text-white shadow-primary/20 hover:shadow-primary/40",
    secondary: "bg-secondary-container text-on-secondary-container shadow-secondary-container/20 hover:shadow-secondary-container/40",
    outline: "bg-transparent border border-outline-variant/30 text-on-surface hover:border-primary/50 hover:bg-surface-container-low",
    ghost: "bg-white/80 backdrop-blur-md text-primary shadow-sm hover:bg-white"
  };

  return (
    <motion.button 
      whileHover={{ 
        scale: 1.05, 
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
