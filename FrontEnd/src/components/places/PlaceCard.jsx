import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

const PlaceCard = ({ place }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!place) return null;

  const inWishlist = isInWishlist(place);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      if (window.confirm("Vui lòng đăng nhập để lưu vào Wishlist. Bạn có muốn tới trang đăng nhập không?")) {
        navigate('/login');
      }
      return;
    }
    toggleWishlist(place);
  };

  return (
    <Link to={`/place/${place.id}`} className="block h-full outline-none group">
      <div className="relative h-full bg-white/70 dark:bg-surface-container/60 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-white/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 flex flex-col">
        
        {/* Image Section */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src={place.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"} 
            alt={place.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            {place.location && (
              <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-primary text-[10px] font-bold tracking-widest uppercase shadow-md border border-white/50 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {place.location}
              </span>
            )}
          </div>

          <button
            onClick={handleHeartClick}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md text-primary flex items-center justify-center hover:bg-white hover:text-red-500 transition-all shadow-lg z-10 border border-white/50 active:scale-90"
            aria-label="Add to wishlist"
          >
            <span className={`material-symbols-outlined text-[20px] ${inWishlist ? 'text-red-500' : ''}`} style={{ fontVariationSettings: inWishlist ? "'FILL' 1" : "'FILL' 0" }}>
              favorite
            </span>
          </button>

          {/* Rating */}
          {place.rating && (
            <div className="absolute bottom-4 left-4 bg-amber-400 text-amber-950 px-3 py-1 rounded-lg text-xs font-black tracking-tight flex items-center gap-1 shadow-xl">
              <Star className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
              <span>{place.rating}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-headline font-bold text-on-surface line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {place.name}
          </h3>
          
          <p className="text-on-surface-variant font-body text-sm leading-relaxed line-clamp-2 flex-grow mb-6">
            {place.description || "Một địa điểm tuyệt vời đang chờ bạn khám phá."}
          </p>
          
          {/* Footer of Card */}
          <div className="flex items-center justify-between pt-5 border-t border-outline-variant/20 mt-auto">
             <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">
                GIÁ THAM KHẢO
              </span>
              <span className="text-lg font-headline font-black text-primary">
                {place.price ? `${place.price}` : 'Miễn phí'}
              </span>
            </div>
            
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary group-hover:text-white text-on-surface transition-colors shadow-sm">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default PlaceCard;
