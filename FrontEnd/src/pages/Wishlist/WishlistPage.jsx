import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import PlaceCard from '../../components/places/PlaceCard';
import SectionHeader from '../../components/common/SectionHeader';
import { Heart, Map, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const { wishlist, loading } = useWishlist();

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          title="Bộ Sưu Tập Của Bạn"
          subtitle="Những địa điểm tuyệt vời bạn đã lưu"
          align="left"
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-on-surface-variant font-medium">Đang tải danh sách yêu thích...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-on-surface mb-3">
              Wishlist của bạn đang trống
            </h2>
            <p className="text-on-surface-variant font-body mb-8 max-w-md">
              Hãy khám phá các điểm đến hấp dẫn và lưu lại bằng cách nhấn vào biểu tượng trái tim nhé!
            </p>
            <Link 
              to="/destinations"
              className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-dim transition-colors shadow-lg shadow-primary/30"
            >
              <Map className="w-5 h-5" />
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-on-surface-variant font-body mb-8 font-medium">
              Bạn đang có <span className="text-primary font-bold">{wishlist.length}</span> địa điểm trong danh sách.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map(place => (
                <PlaceCard key={place.id || place.location_id} place={place} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

