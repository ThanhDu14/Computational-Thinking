import React from 'react';
import { Outlet, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingChatWidget from '../AiConcierge/FloatingChatWidget';

const Layout = () => {
  const location = useLocation();
  const element = useOutlet();

  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-surface-variant">
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main 
          key={location.pathname}
          className="flex-grow w-full"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {element}
        </motion.main>
      </AnimatePresence>
      <FloatingChatWidget />
      <Footer />
    </div>
  );
};

export default Layout;
