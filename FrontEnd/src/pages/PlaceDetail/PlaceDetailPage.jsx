import React from 'react';
import { useParams } from 'react-router-dom';
import SectionHeader from '../../components/common/SectionHeader';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import { MapPin, Star, Calendar, Clock, Sparkles } from 'lucide-react';

export default function PlaceDetailPage() {
  const params = useParams();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[65vh] rounded-[3rem] overflow-hidden mb-16 shadow-2xl">
        <img src="https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e" alt="Santorini" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        <div className="absolute bottom-12 left-12 md:bottom-16 md:left-16 right-12 text-white">
          <span className="bg-surface/30 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase mb-6 inline-block">Cyclades, Greece</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 drop-shadow-xl">Santorini</h1>
          <div className="flex items-center gap-6 text-surface-container-low font-body drop-shadow-md font-medium text-lg">
            <span className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Aegean Sea</span>
            <span className="flex items-center gap-2 text-secondary-container"><Star className="w-5 h-5 fill-secondary-container" /> 4.9 (2.4k reviews)</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col gap-12">
          {/* Overview */}
          <section>
            <SectionHeader title="Overview" className="mb-6" />
            <p className="text-on-surface-variant font-body leading-relaxed text-lg mb-6">
              World-famous for its stunning sunsets, whitewashed villages clinging to the cliffs, and the azure Aegean Sea. Santorini is a caldera—the remains of a volcanic eruption that destroyed the earliest settlements on a formerly single island, and created the current geological caldera.
            </p>
          </section>

          {/* Highlights */}
          <section>
            <SectionHeader title="Highlights" className="mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h4 className="font-display font-bold text-lg mb-2 text-on-surface">Oia Sunsets</h4>
                <p className="text-on-surface-variant text-sm font-body">Experience the most photographed sunset in the world from the ruins of the castle.</p>
              </GlassCard>
              <GlassCard className="p-6">
                <h4 className="font-display font-bold text-lg mb-2 text-on-surface">Volcanic Beaches</h4>
                <p className="text-on-surface-variant text-sm font-body">Relax on the unique red and black sand beaches sculpted by volcanic activity.</p>
              </GlassCard>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <GlassCard className="sticky top-32 flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-outline-variant/20 pb-6">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Price</span>
                <span className="text-3xl font-display font-bold text-on-surface">$1,200</span>
              </div>
              <span className="text-sm text-on-surface-variant font-body mb-1">per person</span>
            </div>
            
            <div className="flex flex-col gap-4 font-body text-sm font-medium">
              <div className="flex justify-between text-on-surface">
                <span className="flex items-center gap-2 text-on-surface-variant"><Calendar className="w-4 h-4" /> Duration</span>
                <span>5 Days</span>
              </div>
              <div className="flex justify-between text-on-surface">
                <span className="flex items-center gap-2 text-on-surface-variant"><Clock className="w-4 h-4" /> Best Time</span>
                <span>May - Sep</span>
              </div>
            </div>

            <Button variant="primary" className="w-full mt-4 !rounded-2xl">
              Book Experience <Sparkles className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full !rounded-2xl bg-white/50 backdrop-blur-sm">
              Save to Wishlist
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
