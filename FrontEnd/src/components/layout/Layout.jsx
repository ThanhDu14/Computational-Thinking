import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingChatWidget from '../AiConcierge/FloatingChatWidget';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-surface-variant relative">
      <Navbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <Footer />
      <FloatingChatWidget />
    </div>
  );
};

export default Layout;
