import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface-container-low pt-20 pb-12 mt-auto text-on-surface-variant font-body">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                <span className="text-white font-display font-bold text-xl tracking-tight">S</span>
              </div>
              <span className="text-2xl font-display font-bold tracking-tight text-on-surface">SmartTravel</span>
            </div>
            <p className="text-sm leading-relaxed">
              Experience the world with "The Ethereal Explorer". Boundless, atmospheric landscapes waiting to be discovered.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm font-medium">
            <div className="flex flex-col gap-3">
              <h4 className="text-on-surface font-display font-bold mb-1">Company</h4>
              <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
              <a href="#" className="hover:text-primary transition-colors">Careers</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-on-surface font-display font-bold mb-1">Resources</h4>
              <Link to="/recommendations" className="hover:text-primary transition-colors">Recommendations</Link>
              <a href="#" className="hover:text-primary transition-colors">Help Center</a>
              <a href="#" className="hover:text-primary transition-colors">Safety</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-on-surface font-display font-bold mb-1">Legal</h4>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium tracking-wide">
          <p>© {new Date().getFullYear()} SmartTravel Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
