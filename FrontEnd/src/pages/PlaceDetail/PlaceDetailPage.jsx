import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import ReviewCard from '../../components/reviews/ReviewCard';
import ReviewForm from '../../components/reviews/ReviewForm';
import {
  MapPin, Star, Clock, Sparkles, Heart, MessageSquarePlus,
  Loader2, ChevronDown, Tag, Timer, AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { getLocationById } from '../../services/locationService';
import { getLocationReviews, deleteReview } from '../../services/reviewService';

const REVIEWS_PER_PAGE = 6;

// Placeholder images dựa trên city
const CITY_IMAGES = {
  'hà nội': 'https://images.unsplash.com/photo-1597076545399-91a3ff0e71b3?w=1200',
  'hồ chí minh': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200',
  'đà lạt': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
  'hội an': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
  'đà nẵng': 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200',
  default: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200',
};

function getCityImage(city = '') {
  const key = city.toLowerCase().trim();
  return CITY_IMAGES[key] || CITY_IMAGES.default;
}

export default function PlaceDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user, getToken } = useAuth();

  // ── Location state ──
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState('');

  // ── Review state ──
  const [reviews, setReviews] = useState([]);
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  // ── Fetch location ──
  const fetchLocation = useCallback(async () => {
    if (!id) return;
    setLocLoading(true);
    setLocError('');
    try {
      const data = await getLocationById(id);
      setLocation(data);
    } catch (err) {
      setLocError(err.message || 'Không tìm thấy địa điểm.');
    } finally {
      setLocLoading(false);
    }
  }, [id]);

  // ── Fetch reviews ──
  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setRevLoading(true);
    setRevError('');
    try {
      const data = await getLocationReviews(id);
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setRevError('Không thể tải đánh giá.');
    } finally {
      setRevLoading(false);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchLocation();
    fetchReviews();
  }, [fetchLocation, fetchReviews]);

  // ── Handlers ──
  const handleReviewSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
    setTimeout(() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = await getToken();
      await deleteReview(token, reviewId);
      setReviews(prev => prev.filter(r => r.review_id !== reviewId));
    } catch (err) {
      alert('Xóa thất bại: ' + err.message);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      if (window.confirm('Vui lòng đăng nhập để viết đánh giá.')) navigate('/login');
      return;
    }
    setEditingReview(null);
    setShowForm(p => !p);
    setTimeout(() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (window.confirm('Vui lòng đăng nhập để lưu Wishlist.')) navigate('/login');
      return;
    }
    toggleWishlist(location);
  };

  // ── Loading / Error ──
  if (locLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-4 text-on-surface-variant">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="font-medium text-lg">Đang tải địa điểm...</span>
      </div>
    );
  }

  if (locError || !location) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 pt-20">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <p className="text-xl font-bold text-on-surface">{locError || 'Không tìm thấy địa điểm.'}</p>
        <Button variant="primary" onClick={() => navigate('/destinations')}>← Quay lại danh sách</Button>
      </div>
    );
  }

  // ── Normalise API fields ──
  const name = location.name || '';
  const city = location.city || '';
  const address = location.address || '';
  const description = location.description || '';
  const openingHours = location.opening_hours || '';
  const durationMins = location.duration_minutes || 0;
  const rating = Number(location.rating || 0).toFixed(1);
  const countRating = location.count_rating || reviews.length || 0;
  const categories = Array.isArray(location.categories)
    ? location.categories.map(c => (typeof c === 'string' ? c : c.name || c.category || '')).filter(Boolean)
    : [];
  const allImages = (location.images || []).map(img => typeof img === 'string' ? img : img.image).filter(Boolean);
  const displayImages = allImages.length > 0 ? allImages.slice(0, 4) : [getCityImage(city)];
  const heroImage = displayImages[0];
  const inWishlist = isInWishlist(location);
  const currentUserId = user?.uid || user?.id;
  const visibleReviews = reviews.slice(0, visibleCount);

  // Tính avg rating từ reviews API nếu có, fallback sang data
  const displayRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : rating;
  const displayCount = reviews.length > 0 ? reviews.length : countRating;

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">

      {/* ── Hero Gallery ── */}
      <div className="relative h-[60vh] md:h-[75vh] bg-black overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 h-full gap-1 md:gap-2 p-1 md:p-2">
          {/* Main Large Image */}
          <div className={`${displayImages.length > 1 ? 'md:col-span-2' : 'md:col-span-4'} h-full overflow-hidden rounded-sm md:rounded-l-2xl`}>
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              src={displayImages[0]}
              alt={name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
            />
          </div>

          {/* Side Images Grid */}
          {displayImages.length > 1 && (
            <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-1 md:gap-2 h-full">
              {displayImages.slice(1, 4).map((img, i) => (
                <div 
                  key={i} 
                  className={`overflow-hidden ${
                    i === 1 && displayImages.length === 3 ? 'col-span-2' : ''
                  } ${
                    i === 1 && displayImages.length === 4 ? 'rounded-tr-2xl' : ''
                  } ${
                    i === 2 && displayImages.length === 4 ? 'rounded-br-2xl' : ''
                  }`}
                >
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    src={img}
                    alt={`${name} ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 cursor-pointer"
                  />
                </div>
              ))}
              
              {/* If fewer than 4 images, fill with empty/pattern or just stretch others */}
              {displayImages.length === 2 && (
                <div className="col-span-2 bg-surface-container-low flex items-center justify-center rounded-r-2xl border border-white/10">
                   <Sparkles className="w-8 h-8 text-primary/20" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gradient overlay - more subtle for gallery */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Categories badges */}
        <div className="absolute top-20 left-6 flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
              {cat}
            </span>
          ))}
        </div>

        {/* Bottom info on hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white tracking-tight drop-shadow-2xl mb-3">
            {name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90 font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary-container" />
              {city}{address ? ` · ${address}` : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold">{displayRating}</span>
              <span className="opacity-70">({displayCount} đánh giá)</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left – Main */}
          <div className="lg:col-span-2 flex flex-col gap-12">

            {/* About */}
            <section className="border-b border-outline-variant/30 pb-10">
              <h2 className="text-2xl font-display font-bold text-on-surface mb-4">Giới thiệu</h2>
              {description
                ? <p className="text-on-surface-variant leading-loose text-base font-medium">{description}</p>
                : <p className="text-on-surface-variant/50 italic">Chưa có mô tả.</p>
              }
            </section>

            {/* Info chips */}
            {(openingHours || durationMins > 0) && (
              <section className="border-b border-outline-variant/30 pb-10 flex flex-wrap gap-4">
                {openingHours && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/20 text-sm font-semibold text-on-surface">
                    <Clock className="w-4 h-4 text-primary" /> {openingHours}
                  </div>
                )}
                {durationMins > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/20 text-sm font-semibold text-on-surface">
                    <Timer className="w-4 h-4 text-primary" />
                    Thời gian tham quan: ~{durationMins >= 60 ? `${Math.floor(durationMins / 60)}h${durationMins % 60 > 0 ? (durationMins % 60) + 'm' : ''}` : `${durationMins} phút`}
                  </div>
                )}
                {categories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/8 border border-primary/20 text-sm font-semibold text-primary">
                    <Tag className="w-4 h-4" /> {cat}
                  </div>
                ))}
              </section>
            )}

            {/* ── Reviews ── */}
            <section>
              <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
                <h2 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  {displayRating}
                  <span className="text-lg text-on-surface-variant font-medium">({displayCount} đánh giá)</span>
                </h2>
                <button
                  onClick={handleWriteReview}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  {showForm && !editingReview ? 'Đóng' : 'Viết đánh giá'}
                </button>
              </div>

              {/* Form */}
              {showForm && (
                <div id="review-form" className="mb-8">
                  <GlassCard className="p-6 rounded-2xl border border-outline-variant/20">
                    <h3 className="font-bold text-on-surface mb-5">
                      {editingReview ? '✏️ Chỉnh sửa đánh giá' : '✍️ Viết đánh giá của bạn'}
                    </h3>
                    <ReviewForm
                      locationId={id}
                      getToken={getToken}
                      initialData={editingReview}
                      onSuccess={handleReviewSuccess}
                      onCancel={() => { setShowForm(false); setEditingReview(null); }}
                    />
                  </GlassCard>
                </div>
              )}

              {/* Loading */}
              {revLoading && (
                <div className="flex items-center gap-3 py-10 text-on-surface-variant">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>Đang tải đánh giá...</span>
                </div>
              )}

              {/* Error */}
              {!revLoading && revError && (
                <p className="text-red-500 text-sm py-4">{revError} <button onClick={fetchReviews} className="underline">Thử lại</button></p>
              )}

              {/* Empty */}
              {!revLoading && !revError && reviews.length === 0 && (
                <div className="flex flex-col items-center py-12 gap-3 border-2 border-dashed border-outline-variant/30 rounded-2xl text-on-surface-variant">
                  <span className="text-5xl">💬</span>
                  <p className="font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                </div>
              )}

              {/* Grid */}
              {!revLoading && visibleReviews.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleReviews.map(review => (
                      <ReviewCard
                        key={review.review_id}
                        review={review}
                        currentUserId={currentUserId}
                        onEdit={handleEditReview}
                        onDelete={handleDeleteReview}
                      />
                    ))}
                  </div>
                  {visibleCount < reviews.length && (
                    <button
                      onClick={() => setVisibleCount(c => c + REVIEWS_PER_PAGE)}
                      className="mt-7 mx-auto flex items-center gap-2 px-6 py-2.5 rounded-full border border-outline-variant/30 text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      Xem thêm <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Right – Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <GlassCard className="flex flex-col gap-5 p-7 shadow-xl border border-outline-variant/30 bg-surface-container-lowest backdrop-blur-2xl rounded-3xl">

                {/* Rating summary */}
                <div className="pb-5 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2 mb-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-5 h-5 ${s <= Math.round(Number(displayRating)) ? 'fill-amber-400 text-amber-400' : 'text-outline-variant/30'}`} />
                    ))}
                    <span className="ml-1 font-bold text-on-surface text-lg">{displayRating}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{displayCount} lượt đánh giá</p>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-4 text-sm font-medium text-on-surface-variant">
                  {city && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{address || city}</span>
                    </div>
                  )}
                  {openingHours && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span>{openingHours || 'Liên hệ để biết giờ mở cửa'}</span>
                    </div>
                  )}
                  {durationMins > 0 && (
                    <div className="flex items-center gap-3">
                      <Timer className="w-4 h-4 text-primary shrink-0" />
                      <span>~{durationMins >= 60 ? `${Math.floor(durationMins / 60)} tiếng` : `${durationMins} phút`} tham quan</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Button variant="primary" className="w-full !rounded-2xl py-3.5 mt-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                  <Sparkles className="w-4 h-4 mr-2 inline" /> Lên kế hoạch đến đây
                </Button>

                <button
                  onClick={handleWishlist}
                  className={`w-full py-3.5 rounded-2xl border-2 font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                    inWishlist
                      ? 'border-red-500/50 bg-red-500/5 text-red-500 hover:bg-red-500/10'
                      : 'border-primary/20 text-primary hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  {inWishlist ? 'Đã lưu vào Wishlist' : 'Lưu vào Wishlist'}
                </button>
              </GlassCard>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
