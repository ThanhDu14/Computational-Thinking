import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { X, Calendar, MapPin, Compass, Star, Image as ImageIcon, Bike, Car, Footprints, Edit, Save, Loader2, ArrowRight } from 'lucide-react';
import { getRecommendationDetail, saveRecommendation } from '../../services/recommendationService';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SweetModal from '../common/SweetModal';

export default function ItineraryDetailModal({ planId, isOpen, onClose, onSaveSuccess }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState('day_1');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // SweetModal states
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showModal = (type, title, message) => {
    setModalConfig({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    if (!isOpen || !planId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      setHasChanges(false);
      try {
        const token = await getToken();
        const data = await getRecommendationDetail(planId, token);
        const planData = data.plan || data;
        setPlan(planData);
        
        // Find first day that has places to make it active by default
        if (planData?.itinerary) {
          const days = Object.keys(planData.itinerary).sort();
          if (days.length > 0) {
            setActiveDay(days[0]);
          }
        }
      } catch (err) {
        console.error("Fetch Plan Detail Error:", err);
        setError(t('itinerary_detail_modal.error_load'));
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [planId, isOpen]);

  if (!isOpen) return null;

  // Helper to format transportation methods nicely
  const getTransportIcon = (mode) => {
    const formatMode = String(mode || '').toLowerCase();
    if (formatMode.includes('bike') || formatMode.includes('xe máy') || formatMode.includes('moto')) {
      return <Bike className="w-5 h-5 text-primary" />;
    }
    if (formatMode.includes('car') || formatMode.includes('ô tô') || formatMode.includes('taxi')) {
      return <Car className="w-5 h-5 text-primary" />;
    }
    return <Footprints className="w-5 h-5 text-primary" />;
  };

  const getTransportLabel = (mode) => {
    const formatMode = String(mode || '').toLowerCase();
    if (formatMode.includes('bike') || formatMode.includes('xe máy') || formatMode.includes('moto')) return t('itinerary_detail_modal.transport.motorbike');
    if (formatMode.includes('car') || formatMode.includes('ô tô') || formatMode.includes('taxi')) return t('itinerary_detail_modal.transport.car');
    return t('itinerary_detail_modal.transport.walk');
  };

  // Helper to clean ratings (e.g. "4.8/5" -> "4.8")
  const cleanRating = (rating) => {
    if (!rating) return '4.5';
    const ratingStr = String(rating);
    if (ratingStr.includes('/')) {
      return ratingStr.split('/')[0].trim();
    }
    return ratingStr;
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    const places = [...dayData.places];
    const [removed] = places.splice(source.index, 1);
    places.splice(destination.index, 0, removed);

    setPlan(prev => ({
      ...prev,
      itinerary: {
        ...prev.itinerary,
        [activeDay]: {
          ...prev.itinerary[activeDay],
          places: places
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getToken();
      await saveRecommendation(plan, token);
      setHasChanges(false);
      showModal('success', t('itinerary_detail_modal.save_success_title'), t('itinerary_detail_modal.save_success_msg'));
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Save plan changes error:", err);
      showModal('error', t('itinerary_detail_modal.save_error_title'), t('itinerary_detail_modal.save_error_msg'));
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to resolve fields defensively
  const province = plan?.destination?.province || plan?.province || 'Việt Nam';
  const categories = plan?.preferences?.categories || plan?.categories || [];
  const transMode = plan?.logistics?.transportation || plan?.transportation || 'motorbike';

  // Get active day data
  const dayData = plan?.itinerary?.[activeDay] || { places: [] };
  const sortedDays = plan?.itinerary ? Object.keys(plan.itinerary).sort() : [];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Glassmorphic Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card Content */}
      <div className="relative w-full max-w-3xl bg-surface/90 dark:bg-surface-container-high/90 backdrop-blur-2xl border border-outline-variant/30 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Section */}
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start">
          <div className="space-y-1 pr-6">
            <div className="flex flex-wrap gap-2 items-center text-xs text-on-surface-variant mb-2">
              <span className="flex items-center gap-1 bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
                <Compass className="w-3.5 h-3.5" />
                {t('itinerary_detail_modal.ai_suggestion')}
              </span>
              {categories.map((cat, idx) => (
                <span key={idx} className="bg-surface-variant text-on-surface-variant font-medium px-2.5 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-on-surface flex items-center gap-2">
              {t('itinerary_detail_modal.title', { province })}
            </h2>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <div className="flex items-center gap-1.5 py-1">
                {getTransportIcon(transMode)}
                <span>{t('itinerary_detail_modal.transport_by')}: <strong>{getTransportLabel(transMode)}</strong></span>
              </div>
              {!loading && !error && (
                <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full select-none">
                  {t('itinerary_detail_modal.drag_hint')}
                </span>
              )}
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-surface-variant/50 transition-colors text-on-surface-variant hover:text-on-surface"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            /* Premium Shimmer Skeleton Loader */
            <div className="space-y-6 py-4 animate-pulse">
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 w-24 bg-outline-variant/30 rounded-full" />
                ))}
              </div>
              <div className="space-y-8 pt-4">
                {[1, 2].map((n) => (
                  <div key={n} className="flex gap-4">
                    <div className="w-24 h-24 bg-outline-variant/30 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-outline-variant/30 rounded-md w-1/3" />
                      <div className="h-4 bg-outline-variant/30 rounded-md w-1/4" />
                      <div className="h-4 bg-outline-variant/30 rounded-md w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-4">
              <span className="material-symbols-outlined text-5xl text-red-500">error</span>
              <p className="text-on-surface-variant font-medium">{error}</p>
              <button 
                onClick={onClose}
                className="bg-primary text-white font-bold px-6 py-2.5 rounded-full hover:bg-primary-dim transition-colors"
              >
                {t('itinerary_detail_modal.close_btn')}
              </button>
            </div>
          ) : (
            <>
              {/* Day Selection Tabs */}
              {sortedDays.length > 0 && (
                <div className="flex gap-2 border-b border-outline-variant/10 pb-4 overflow-x-auto">
                  {sortedDays.map((dayKey, index) => {
                    const isActive = activeDay === dayKey;
                    return (
                      <button
                        key={dayKey}
                        onClick={() => setActiveDay(dayKey)}
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 ${
                          isActive 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                            : 'bg-surface-variant/40 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        {t('itinerary_detail_modal.day', { day: index + 1 })}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Interactive Places Timeline with Drag & Drop */}
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="timeline-places">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-0 relative pl-4 md:pl-6 border-l-2 border-primary/10 ml-2 py-2"
                    >
                      {dayData.places && dayData.places.length > 0 ? (
                        dayData.places.map((place, index) => {
                          const ratingVal = cleanRating(place.rating || place.overall_rating);
                          const draggableId = place.name || place.location_name || `place-${index}`;
                          
                          return (
                            <Draggable 
                              key={draggableId} 
                              draggableId={draggableId} 
                              index={index}
                            >
                              {(dragProvided, dragSnapshot) => (
                                <div 
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={`relative pb-10 last:pb-2 group transition-all select-none ${
                                    dragSnapshot.isDragging ? 'scale-102 opacity-90 z-50' : ''
                                  }`}
                                >
                                  {/* Bullet Marker Pin */}
                                  <div className="absolute -left-[27px] md:-left-[31px] top-1.5 w-6 h-6 rounded-full bg-surface dark:bg-surface-container-high border-2 border-primary flex items-center justify-center shadow-md shadow-primary/10 group-hover:scale-110 transition-transform duration-200">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                  </div>

                                  {/* Place Card Content */}
                                  <div className="bg-surface-container/40 dark:bg-surface-container-high/40 hover:bg-surface-container/60 dark:hover:bg-surface-container-high/60 backdrop-blur-md border border-outline-variant/20 rounded-2xl p-4 md:p-5 ml-4 transition-all duration-300 hover:shadow-md hover:border-primary/20 flex flex-col md:flex-row gap-4 items-start cursor-grab active:cursor-grabbing">
                                    
                                    {/* Attraction Image */}
                                    <div 
                                      className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-surface-container-highest shrink-0 relative shadow-sm border border-outline-variant/10 cursor-pointer group/img"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const identifier = place.location_id || (place.id && !String(place.id).includes('place') ? place.id : '') || encodeURIComponent(place.name || place.location_name);
                                        onClose();
                                        navigate(`/place/${identifier}`);
                                      }}
                                    >
                                      {place.image_url || place.image || place.images?.[0] ? (
                                        <img 
                                          src={place.image_url || place.image || place.images?.[0]} 
                                          alt={place.name || place.location_name} 
                                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                          draggable="false"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 bg-surface-container transition-transform duration-500 group-hover/img:scale-110">
                                          <ImageIcon className="w-8 h-8 stroke-[1.2]" />
                                          <span className="text-[10px] mt-1 font-body">No Photo</span>
                                        </div>
                                      )}

                                      {/* Rating Badge Overlay */}
                                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                        <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                                        {ratingVal}
                                      </div>
                                    </div>

                                    {/* Attraction Description Text */}
                                    <div className="flex-1 space-y-2">
                                      <h4 
                                        className="text-lg font-bold text-on-surface font-display group-hover:text-primary transition-colors cursor-pointer hover:underline inline-flex items-center gap-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const identifier = place.location_id || (place.id && !String(place.id).includes('place') ? place.id : '') || encodeURIComponent(place.name || place.location_name);
                                          onClose();
                                          navigate(`/place/${identifier}`);
                                        }}
                                      >
                                        {place.name || place.location_name}
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </h4>
                                      
                                      {place.description && (
                                        <p className="text-sm text-on-surface-variant font-body leading-relaxed select-none">
                                          {place.description}
                                        </p>
                                      )}

                                      {place.recommended_time && (
                                        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/5 py-1 px-2.5 rounded-md inline-flex border border-primary/10">
                                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                                          {t('itinerary_detail_modal.recommended_time', { time: place.recommended_time })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-on-surface-variant font-body">
                          {t('itinerary_detail_modal.no_places')}
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 border-t border-outline-variant/10 bg-surface-container/20 flex justify-end gap-3 rounded-b-3xl">
          {hasChanges ? (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white font-bold transition-all text-sm font-body flex items-center gap-1.5 shadow-md shadow-emerald-600/20 hover:-translate-y-0.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  {t('itinerary_detail_modal.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4.5 h-4.5" />
                  {t('itinerary_detail_modal.save_changes')}
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={() => {
                onClose();
                navigate(`/recommendations?planId=${planId}`);
              }}
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dim text-white font-bold transition-all text-sm font-body flex items-center gap-1.5 shadow-md shadow-primary/20 hover:-translate-y-0.5"
            >
              <Edit className="w-4.5 h-4.5" />
              {t('itinerary_detail_modal.edit_itinerary')}
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-outline-variant/40 hover:bg-surface-variant/50 text-on-surface-variant font-bold transition-all text-sm font-body"
          >
            {t('itinerary_detail_modal.close')}
          </button>
        </div>

      </div>

      {/* SweetModal for success/error alerts */}
      <SweetModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </div>
  );
}
