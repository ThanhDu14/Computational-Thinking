import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import GlassCard from '../../components/common/GlassCard';

export default function BlogPage() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <SectionHeader title="Traveler Stories" subtitle="Our Blog" className="mb-12 text-center items-center" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard hoverEffect className="p-6">
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05" alt="Blog" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-display font-bold text-2xl text-on-surface mb-3">The Art of Minimalist Packing: 10 Days in One Bag</h3>
          <p className="text-on-surface-variant font-body mb-4">Discover how to travel light without sacrificing style or comfort on your next global adventure.</p>
          <span className="text-primary font-bold text-sm tracking-wider uppercase cursor-pointer hover:underline">Read Story</span>
        </GlassCard>
        
        <GlassCard hoverEffect className="p-6">
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26" alt="Tokyo" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-display font-bold text-2xl text-on-surface mb-3">Hidden Tokyo: Beyond the Neon and Crowds</h3>
          <p className="text-on-surface-variant font-body mb-4">Step off the beaten path and explore the quiet, ancient neighborhoods tucked behind the skyscrapers.</p>
          <span className="text-primary font-bold text-sm tracking-wider uppercase cursor-pointer hover:underline">Read Story</span>
        </GlassCard>
      </div>
    </div>
  );
}
