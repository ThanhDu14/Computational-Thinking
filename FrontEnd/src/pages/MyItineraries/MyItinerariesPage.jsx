import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRecommendationHistory, deleteRecommendation } from '../../services/recommendationService';
import SectionHeader from '../../components/common/SectionHeader';
import ItineraryDetailModal from '../../components/places/ItineraryDetailModal';
import { Compass, Trash2, Calendar, MapPin, Loader2, Bike, Car, Footprints, ArrowRight, Image as ImageIcon, Sparkles, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import SweetModal from '../../components/common/SweetModal';

export default function MyItinerariesPage() {
  const { getToken } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Modal states
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // SweetModal states
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    showCancel: false,
    onConfirm: null
  });

  const showModal = (type, title, message, showCancel = false, onConfirm = null) => {
    setModalConfig({ isOpen: true, type, title, message, showCancel, onConfirm });
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getRecommendationHistory(token);

      // Ensure data is array
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data?.history && Array.isArray(data.history)) {
        setHistory(data.history);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Fetch Itineraries History Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Format dates in Vietnamese
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Đang cập nhật...';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getPlanMeta = (plan) => {
    if (!plan?.itinerary) return { daysCount: 0, placesCount: 0 };
    const days = Object.keys(plan.itinerary);
    let placesCount = 0;
    days.forEach(d => {
      placesCount += (plan.itinerary[d]?.places?.length || 0);
    });
    return { daysCount: days.length, placesCount };
  };

  const getCoverImage = (plan) => {
    if (plan?.itinerary) {
      const days = Object.keys(plan.itinerary).sort();
      for (const day of days) {
        const places = plan.itinerary[day]?.places || [];
        for (const place of places) {
          const img = place.image_url || place.image || place.images?.[0];
          if (img) return img;
        }
      }
    }
    return null;
  };

  const getTransportIcon = (mode) => {
    const formatMode = String(mode || '').toLowerCase();
    if (formatMode.includes('bike') || formatMode.includes('xe máy') || formatMode.includes('moto')) {
      return <Bike className="w-4 h-4" />;
    }
    if (formatMode.includes('car') || formatMode.includes('ô tô') || formatMode.includes('taxi')) {
      return <Car className="w-4 h-4" />;
    }
    return <Footprints className="w-4 h-4" />;
  };

  const getTransportLabel = (mode) => {
    const formatMode = String(mode || '').toLowerCase();
    if (formatMode.includes('bike') || formatMode.includes('xe máy') || formatMode.includes('moto')) return 'Xe máy';
    if (formatMode.includes('car') || formatMode.includes('ô tô') || formatMode.includes('taxi')) return 'Ô tô';
    return 'Đi bộ';
  };

  const handleDelete = (planId, provinceName) => {
    showModal(
      'warning',
      'Xác Nhận Xóa',
      `Bạn có chắc chắn muốn xóa lịch trình đi ${provinceName || 'địa điểm này'} không? Hành động này không thể hoàn tác.`,
      true,
      async () => {
        setDeletingId(planId);
        try {
          const token = await getToken();
          await deleteRecommendation(planId, token);
          setHistory(prev => prev.filter(p => (p.plan_id || p.id || p.planId) !== planId));
        } catch (err) {
          console.error("Delete Plan Error:", err);
          showModal('error', 'Lỗi', 'Không thể xóa lịch trình lúc này. Vui lòng thử lại sau.');
        } finally {
          setDeletingId(null);
        }
      }
    );
  };

  const openDetail = (planId) => {
    setSelectedPlanId(planId);
    setIsDetailOpen(true);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-500 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              AI Travel Planner
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-on-surface tracking-tight">
              Lịch Trình <span className="text-primary">Của Tôi</span>
            </h1>
            <p className="text-on-surface-variant font-body max-w-xl text-lg leading-relaxed">
              Quản lý và xem lại hành trình du lịch thông minh do Quản gia AI thiết kế riêng cho Sếp
            </p>
          </div>

          {!loading && history.length > 0 && (
            <div className="bg-surface/50 backdrop-blur-md border border-outline-variant/20 px-6 py-4 rounded-3xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Tổng số</p>
                <p className="text-2xl font-display font-black text-on-surface">{history.length} <span className="text-sm font-medium text-on-surface-variant">Lịch trình</span></p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Compass className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-on-surface-variant font-bold text-lg animate-pulse">Đang nạp dữ liệu từ kho lưu trữ...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-2xl mx-auto bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-[40px] p-12 backdrop-blur-2xl shadow-2xl shadow-primary/5">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mb-8 rotate-12">
              <Compass className="w-12 h-12 text-primary animate-bounce" />
            </div>
            <h3 className="text-3xl font-display font-black text-on-surface mb-4">
              Chưa có lịch trình nào!
            </h3>
            <p className="text-on-surface-variant font-body mb-10 text-lg leading-relaxed">
              Kế hoạch du lịch của Sếp đang trống trơn. Hãy để Quản gia AI đồng hành và thiết kế cho Sếp những hành trình đáng nhớ nhất.
            </p>
            <Link
              to="/recommendations"
              className="group flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-dim transition-all shadow-xl shadow-primary/25 hover:-translate-y-1 active:translate-y-0"
            >
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Tạo lịch trình ngay
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {history.map((plan, index) => {
              const planId = plan.plan_id || plan.id || plan.planId;

              // Exact mapping based on API format confirmed by user
              const province = plan.province ||
                plan.destination?.province ||
                plan.destination_name ||
                'Việt Nam';

              const transMode = plan.logistics?.transportation || plan.transportation || 'motorbike';
              const categories = plan.preferences?.categories || plan.categories || [];
              const createdAt = plan.created_at || plan.timestamp || plan.createdAt;

              const { daysCount, placesCount } = getPlanMeta(plan);
              const coverImg = getCoverImage(plan);
              const isDeleting = deletingId === planId;

              // Force 3 days 2 nights label if requested by user for 3-day plans
              const durationLabel = daysCount === 3 ? "3 Ngày 2 Đêm" : `${daysCount} Ngày`;

              return (
                <div
                  key={planId}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 flex flex-col animate-fade-in-up"
                >

                  {/* Premium Thumbnail Section */}
                  <div className="relative h-56 overflow-hidden shrink-0">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={province}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-primary/30 bg-primary/5">
                        <ImageIcon className="w-16 h-16 stroke-[1]" />
                      </div>
                    )}

                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Status Badges */}
                    <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                      <div className="bg-white/15 backdrop-blur-xl text-white text-[11px] font-black px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2 shadow-xl">
                        <Calendar className="w-3.5 h-3.5 text-primary-light" />
                        {formatDate(createdAt)}
                      </div>

                      <button
                        onClick={() => handleDelete(planId, province)}
                        disabled={isDeleting}
                        className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500 backdrop-blur-md border border-white/10 text-red-500 hover:text-white flex items-center justify-center transition-all duration-300 shadow-xl"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex items-center gap-2 text-primary-light font-black text-xs uppercase tracking-[0.2em] mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{province}</span>
                      </div>
                      <h4 className="text-2xl font-black font-display tracking-tight drop-shadow-xl line-clamp-1">
                        {province} - {durationLabel}
                      </h4>
                    </div>
                  </div>

                  {/* Body Section */}
                  <div className="p-6 flex-1 flex flex-col gap-6">

                    {/* Details Row */}
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-primary/5 text-primary text-[11px] font-black px-3 py-1.5 rounded-lg flex items-center gap-2 border border-primary/10">
                        {getTransportIcon(transMode)}
                        {getTransportLabel(transMode).toUpperCase()}
                      </div>
                      {categories.slice(0, 2).map((cat, idx) => (
                        <div key={idx} className="bg-slate-100 dark:bg-slate-800 text-on-surface-variant text-[11px] font-black px-3 py-1.5 rounded-lg border border-outline-variant/10 uppercase">
                          {cat}
                        </div>
                      ))}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-px bg-outline-variant/10 rounded-2xl overflow-hidden border border-outline-variant/10">
                      <div className="bg-white/40 dark:bg-slate-800/40 p-4 text-center">
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.15em] font-black mb-1">Thời gian</p>
                        <p className="text-lg font-black text-primary font-display">{durationLabel}</p>
                      </div>
                      <div className="bg-white/40 dark:bg-slate-800/40 p-4 text-center">
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.15em] font-black mb-1">Địa điểm</p>
                        <p className="text-lg font-black text-on-surface font-display">{placesCount} Điểm dừng</p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => openDetail(planId)}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 rounded-2xl transition-all shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group/btn"
                    >
                      XEM CHI TIẾT LỊCH TRÌNH
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Detail Modal */}
      <ItineraryDetailModal
        planId={selectedPlanId}
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedPlanId(null); }}
        onSaveSuccess={fetchHistory}
      />

      {/* SweetModal for Alerts/Confirms */}
      <SweetModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        showCancel={modalConfig.showCancel}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.showCancel ? "Xác nhận xóa" : "Đồng ý"}
      />
    </div>
  );
}
