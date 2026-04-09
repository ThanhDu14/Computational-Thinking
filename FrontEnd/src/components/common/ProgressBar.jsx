import { motion, useScroll, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProgressBar = () => {
  const { pathname } = useLocation();
  const [isMounting, setIsMounting] = useState(false);

  useEffect(() => {
    setIsMounting(true);
    const timer = setTimeout(() => setIsMounting(false), 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: isMounting ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100] shadow-sm"
    />
  );
};

export default ProgressBar;
