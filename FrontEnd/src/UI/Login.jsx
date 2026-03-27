import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/home');
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center py-12 px-6 font-body text-on-surface">
      {/* Background Image full screen */}
      <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-0"></div>

      <Link to="/" className="absolute top-8 left-8 z-20 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-display font-bold text-xl">S</span>
        </div>
        <span className="text-2xl font-display font-bold text-white drop-shadow-md">SmartTravel</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        <GlassCard className="!bg-surface-container-lowest/80 backdrop-blur-3xl p-10 !rounded-[2.5rem]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-on-surface mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-on-surface-variant font-medium text-sm">Sign in to sync your personalized itineraries.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
              <input type="email" placeholder="hello@example.com" className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-on-surface placeholder:text-outline-variant" required />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</a>
              </div>
              <input type="password" placeholder="••••••••" className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-on-surface placeholder:text-outline-variant" required />
            </div>

            <Button variant="primary" type="submit" className="w-full mt-2 !py-4 text-base">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-on-surface-variant mt-8">
            Don't have an account? <span className="text-primary font-bold cursor-pointer hover:underline">Sign up</span>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
