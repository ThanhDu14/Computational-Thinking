import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeader from '../../components/common/SectionHeader';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import { MapPin, Star, Calendar, Clock, Sparkles, UserCircle, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import datadalat from '../../data/data_da_lat_final.json';
import dataha from '../../data/data_HA_final.json';
import datathanhhoa from '../../data/data_thanh_hoa_final.json';

export default function PlaceDetailPage() {
  const params = useParams();
  const locationName = decodeURIComponent(params.id || '');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const allData = [
    ...datadalat.map(item => ({ ...item, region: 'Da Lat' })),
    ...dataha.map(item => ({ ...item, region: 'Hoi An' })),
    ...datathanhhoa.map(item => ({ ...item, region: 'Thanh Hoa' }))
  ];

  const item = allData.find(d => d.location_name === locationName);

  if (!item) {
    return <div className="p-20 text-center text-2xl font-bold min-h-screen pt-40">{t('place_detail.not_found')}</div>;
  }

  const inWishlist = isInWishlist(item);

  const handleHeartClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (window.confirm("Vui lòng đăng nhập để lưu vào Wishlist. Bạn có muốn tới trang đăng nhập không?")) {
        navigate('/login');
      }
      return;
    }
    toggleWishlist(item);
  };

  const imgs = item.images || [];
  const mainImg = imgs[0] || "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e";

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      {/* Top Details (Title & Location) */}
      <div className="pt-24 pb-8 px-6 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4 text-on-surface tracking-tight bg-gradient-to-r from-on-surface to-on-surface/70 bg-clip-text text-transparent">
          {item.location_name}
        </h1>
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-on-surface-variant font-body font-medium text-lg">
          <span className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-secondary-container text-secondary-container inline" />
            <span className="font-bold text-on-surface">{item.overall_rating}</span> 
            <span className="underline cursor-pointer hover:text-on-surface transition-colors">({item.rating_count} {t('place_detail.reviews')})</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-outline-variant">•</span>
            <MapPin className="w-5 h-5 shrink-0 text-primary" />
            <span className="underline cursor-pointer hover:text-on-surface transition-colors">{item.address} - {item.region}</span>
          </span>
        </div>
      </div>

      {/* Image Grid (Airbnb Style) */}
      <section className="mb-14 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[40vh] md:h-[55vh] rounded-3xl overflow-hidden drop-shadow-xl bg-surface-container">
           {/* Main Large Image */}
           <div className="md:col-span-2 h-full overflow-hidden group">
              <motion.img 
                layoutId={`place-image-${params.id}`} 
                src={mainImg} 
                className="w-full h-full object-cover rounded-l-3xl hover:scale-110 transition-transform duration-700 cursor-pointer" 
                alt="Main" 
              />
           </div>
           {/* Sub Images - Top Right */}
           <div className="hidden md:grid grid-cols-1 grid-rows-2 gap-3 h-full">
              <div className="overflow-hidden group h-full">
                <img src={imgs[1] || mainImg} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 cursor-pointer" alt="Sub 1" />
              </div>
              <div className="overflow-hidden group h-full">
                <img src={imgs[2] || mainImg} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 cursor-pointer" alt="Sub 2" />
              </div>
           </div>
           {/* Sub Images - Bottom Right */}
           <div className="hidden md:grid grid-cols-1 grid-rows-2 gap-3 h-full">
              <div className="overflow-hidden group h-full">
                <img src={imgs[3] || mainImg} className="w-full h-full object-cover rounded-tr-3xl hover:scale-110 transition-transform duration-700 cursor-pointer" alt="Sub 3" />
              </div>
              <div className="overflow-hidden group h-full">
                <img src={imgs[4] || mainImg} className="w-full h-full object-cover rounded-br-3xl hover:scale-110 transition-transform duration-700 cursor-pointer" alt="Sub 4" />
              </div>
           </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-2 flex flex-col gap-14">
            
            {/* Overview */}
            <section className="border-b border-outline-variant/30 pb-10">
              <h2 className="text-3xl font-display font-bold text-on-surface mb-6">{t('place_detail.about')}</h2>
              <p className="text-on-surface-variant font-body leading-loose text-lg font-medium opacity-90 text-justify">
                {item.description}
              </p>
            </section>

            {/* Reviews (Horizontal Scroll) */}
            {item.reviews && item.reviews.length > 0 && (
            <section className="border-b border-outline-variant/30 pb-10">
              <h2 className="text-3xl font-display font-bold text-on-surface mb-8 flex items-center gap-3">
                 <Star className="w-7 h-7 fill-secondary-container text-secondary-container" />
                 {item.overall_rating} <span className="opacity-70 text-2xl font-medium">({item.rating_count} {t('place_detail.reviews')})</span>
              </h2>
              
              <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
                {item.reviews.map((review, idx) => (
                  <GlassCard key={idx} className="p-8 flex flex-col gap-5 min-w-[320px] max-w-[320px] snap-center shrink-0 border border-outline-variant/30 bg-surface/40 hover:bg-surface/80 hover:-translate-y-1 transition-all duration-300">
                     <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-container to-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                            {review.reviewer_name ? (
                                <span className="font-display font-bold text-primary text-xl">{review.reviewer_name.charAt(0).toUpperCase()}</span>
                            ) : (
                                <UserCircle className="w-8 h-8 text-primary/70"/>
                            )}
                         </div>
                         <div className="flex flex-col">
                             <h4 className="font-bold text-on-surface text-lg line-clamp-1">{review.reviewer_name || t('place_detail.anonymous')}</h4>
                             <div className="flex items-center gap-1 text-secondary-container">
                                <Star className="w-3.5 h-3.5 fill-secondary-container" />
                                <span className="text-sm font-bold">{review.stars}</span>
                             </div>
                         </div>
                     </div>
                     <p className="text-on-surface-variant/90 text-base font-body line-clamp-4 flex-1">
                        "{review.comment}"
                     </p>
                  </GlassCard>
                ))}
              </div>
              
              {/* Custom scrollbar hide styles */}
              <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            </section>
            )}
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <GlassCard className="flex flex-col gap-6 p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-outline-variant/30 bg-surface-container-lowest dark:bg-surface-container backdrop-blur-2xl rounded-3xl">
                
                {/* Price Label */}
                <div className="flex justify-between items-end pb-6 border-b border-outline-variant/20">
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-on-surface-variant uppercase tracking-[0.2em] mb-2">{t('place_detail.experience_price')}</span>
                    <span className="text-5xl font-display font-black text-primary">{t('place_detail.free')}</span>
                  </div>
                </div>
                
                {/* Vital Stats */}
                <div className="flex flex-col gap-5 font-body text-base font-medium text-on-surface-variant py-2">
                  <div className="flex justify-between items-center group">
                    <span className="flex items-center gap-3"><Clock className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" /> {t('place_detail.opening_hours')}</span>
                    <span className="text-right truncate max-w-[150px] font-bold text-on-surface" title={item.opening_hours || t('place_detail.varies')}>
                        {item.opening_hours || t('place_detail.varies')}
                    </span>
                  </div>
                </div>

                {/* Call To Actions */}
                <Button variant="primary" className="w-full mt-4 !rounded-2xl py-4 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                  <span className="font-bold text-lg">{t('place_detail.check_availability')}</span> <Sparkles className="w-5 h-5 ml-2 inline" />
                </Button>
                
                <Button 
                    onClick={handleHeartClick}
                    variant="outline" 
                    className={`w-full !rounded-2xl py-4 bg-surface-container backdrop-blur-md border-2 transition-all font-bold flex items-center justify-center gap-2 ${
                        inWishlist 
                        ? 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10 text-red-500' 
                        : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary'
                    }`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  {inWishlist ? "Đã lưu vào Wishlist" : t('place_detail.save_wishlist')}
                </Button>

                <div className="mt-2 text-center text-xs font-medium text-on-surface-variant opacity-70">
                    {t('place_detail.no_charge_yet')}
                </div>
              </GlassCard>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
