import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';

const PlaceCard = ({ place }) => {
  if (!place) return null;

  return (
    <Link to={`/place/${place.id}`} className="block h-full outline-none">
      <GlassCard hoverEffect className="p-4 md:p-5 flex flex-col group overflow-hidden h-full">
        <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden mb-6">
          <img 
            src={place.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"} 
            alt={place.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {/* Top Badge */}
          {place.rating && (
            <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
              <span>{place.rating}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-display font-bold text-on-surface line-clamp-1 mb-1">{place.name}</h3>
              <div className="flex items-center text-on-surface-variant font-body text-sm gap-1">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="line-clamp-1">{place.location}</span>
              </div>
            </div>
          </div>
          
          <p className="text-on-surface-variant font-body text-sm leading-relaxed line-clamp-2 mt-3 mb-6 flex-grow">
            {place.description}
          </p>
          
          <div className="flex items-center justify-between pt-5 border-t border-outline-variant/20 mt-auto">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Price</span>
              <span className="text-lg font-display font-bold text-on-surface">
                {place.price ? `$${place.price}` : 'Free'}
              </span>
            </div>
            <Button variant="primary" className="!px-4 !py-3 !rounded-xl pointer-events-none">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
};

export default PlaceCard;
