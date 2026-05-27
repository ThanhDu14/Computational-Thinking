import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SkeletonCard } from '../../components/common/Skeleton';
import TripPlanner from '../../components/places/TripPlanner';
import { getRecommendations, saveRecommendation, getRecommendationDetail } from '../../services/recommendationService';
import CustomSelect from '../../components/common/CustomSelect';
import { VIETNAM_PROVINCES } from '../../data/vietnamProvinces';
import { useAuth } from '../../context/AuthContext';
import SweetModal from '../../components/common/SweetModal';

import datadalat from '../../data/data_da_lat_final.json';
import dataha from '../../data/data_HA_final.json';
import datathanhhoa from '../../data/data_thanh_hoa_final.json';

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [plannerData, setPlannerData] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const daysCount = plannerData ? Object.keys(plannerData).length : 3;
  const nightsCount = Math.max(0, daysCount - 1);

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

  // User selections
  const [province, setProvince] = useState('');
  const [categories, setCategories] = useState([]);
  const [placeStyle, setPlaceStyle] = useState('must_go');
  const [startingPoint, setStartingPoint] = useState('Trung tâm');
  const [transportation, setTransportation] = useState('motorbike');

  const [searchParams, setSearchParams] = useSearchParams();
  const planIdParam = searchParams.get('planId');

  // Restore planner state from sessionStorage on mount (if not loading a specific planId)
  useEffect(() => {
    if (planIdParam) return; // If loading a specific plan, ignore sessionStorage

    const savedStateStr = sessionStorage.getItem('smarttravel_planner_state');
    if (savedStateStr) {
      try {
        const savedState = JSON.parse(savedStateStr);
        if (savedState.showResult || savedState.step > 1) {
          setStep(savedState.step || 1);
          setShowResult(savedState.showResult || false);
          setPlannerData(savedState.plannerData || null);
          setRawResponse(savedState.rawResponse || null);
          setProvince(savedState.province || '');
          setCategories(savedState.categories || []);
          setPlaceStyle(savedState.placeStyle || 'must_go');
          setStartingPoint(savedState.startingPoint || 'Trung tâm');
          setTransportation(savedState.transportation || 'motorbike');
        }
      } catch (err) {
        console.error("Error parsing restored planner state:", err);
      }
    }
  }, [planIdParam]);

  // Persist planner state to sessionStorage whenever states change
  useEffect(() => {
    const stateToSave = {
      step,
      showResult,
      plannerData,
      rawResponse,
      province,
      categories,
      placeStyle,
      startingPoint,
      transportation
    };
    sessionStorage.setItem('smarttravel_planner_state', JSON.stringify(stateToSave));
  }, [step, showResult, plannerData, rawResponse, province, categories, placeStyle, startingPoint, transportation]);

  useEffect(() => {
    if (!planIdParam) return;

    const loadPlan = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await getRecommendationDetail(planIdParam, token);

        if (response) {
          const planData = response.plan || response;
          console.log("planData", planData);
          setRawResponse(planData);

          // Re-populate user selection states if available
          const planProvince = planData.destination?.province || planData.province || '';
          const planCategories = planData.preferences?.categories || planData.categories || [];
          const planStyle = planData.preferences?.place_style || planData.placeStyle || 'must_go';
          const planStart = planData.logistics?.starting_point?.name || planData.startingPoint || 'Trung tâm';
          const planTrans = planData.logistics?.transportation || planData.transportation || 'motorbike';

          if (planCategories.length > 0) setCategories(planCategories);
          setPlaceStyle(planStyle);
          setStartingPoint(planStart);
          setTransportation(planTrans);

          // Build plannerData columns from fetched itinerary
          if (planData.itinerary) {
            const columns = {};
            Object.keys(planData.itinerary).forEach((dayKey, index) => {
              const dayData = planData.itinerary[dayKey];
              columns[`day-${index + 1}`] = {
                title: t('recommendations.day_title', { index: index + 1 }),
                items: dayData.places.map((place, pIdx) => ({
                  ...place,
                  location_id: place.location_id || place.id,
                  id: `${dayKey}-place-${pIdx}`,
                  tag: planCategories[0] || 'Khám phá'
                }))
              };
            });
            setPlannerData(columns);
            setShowResult(true);
          }
        }
      } catch (err) {
        console.error("Error loading plan in workspace:", err);
        showModal('error', t('recommendations.load_error_title'), t('recommendations.load_error_msg'));
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [planIdParam]);

  // Helper functions for styling
  const getItemClasses = (isSelected) => {
    return `group flex flex-col items-center p-8 bg-surface-container-lowest rounded-2xl transition-all duration-300 text-center cursor-pointer ${isSelected
      ? 'border-2 border-primary/40 ring-4 ring-primary/5 shadow-lg -translate-y-3'
      : 'border border-surface-variant/50 hover:-translate-y-1 hover:shadow-md'
      }`;
  };

  const getIconClasses = (isSelected) => {
    return `w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${isSelected ? 'bg-primary-container shadow-inner' : 'bg-surface-container-low group-hover:bg-primary-container'
      }`;
  };

  const generateItinerary = () => {
    const allData = [...datadalat, ...dataha, ...datathanhhoa];
    const randomItems = [];
    const dataCopy = [...allData];
    for (let i = 0; i < 9; i++) {
      if (dataCopy.length === 0) break;
      const randomIndex = Math.floor(Math.random() * dataCopy.length);
      randomItems.push(dataCopy.splice(randomIndex, 1)[0]);
    }

    const columns = {
      'day-1': { title: t('recommendations.day_title', { index: 1 }), items: randomItems.slice(0, 3).map((item, idx) => ({ ...item, location_id: item.location_id || item.id, id: `mock-day-1-place-${idx}` })) },
      'day-2': { title: t('recommendations.day_title', { index: 2 }), items: randomItems.slice(3, 6).map((item, idx) => ({ ...item, location_id: item.location_id || item.id, id: `mock-day-2-place-${idx}` })) },
      'day-3': { title: t('recommendations.day_title', { index: 3 }), items: randomItems.slice(6, 9).map((item, idx) => ({ ...item, location_id: item.location_id || item.id, id: `mock-day-3-place-${idx}` })) }
    };
    setPlannerData(columns);
  };

  const toggleCategory = (cat) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    if (!rawResponse) {
      showModal('warning', t('recommendations.save_warning_title'), t('recommendations.save_warning_msg'));
      return;
    }
    setIsSaving(true);
    try {
      // Clone rawResponse so we don't mutate state directly
      const updatedResponse = JSON.parse(JSON.stringify(rawResponse));

      // CHỦ ĐỘNG GẮN PROVINCE VÀO PAYLOAD TRƯỚC KHI LƯU
      // Gắn vào nhiều trường để chắc chắn Backend hoặc Database lưu được
      const finalProvince = province || 'Khánh Hòa';
      updatedResponse.province = finalProvince;
      updatedResponse.destination_name = finalProvince;

      if (!updatedResponse.destination) {
        updatedResponse.destination = { province: finalProvince };
      } else {
        updatedResponse.destination.province = finalProvince;
      }

      if (updatedResponse.itinerary && plannerData) {
        // Reconstruct itinerary days based on the dragged and sorted columns
        Object.keys(plannerData).forEach((columnKey) => {
          // E.g., columnKey = 'day-1' -> dayKey = 'day_1'
          const dayKey = columnKey.replace('-', '_');

          if (updatedResponse.itinerary[dayKey]) {
            // Map the sorted items back to places, keeping the original location_id and stripping temporary DnD fields
            updatedResponse.itinerary[dayKey].places = plannerData[columnKey].items.map((item) => {
              const { id, tag, ...rest } = item;
              return {
                ...rest,
                location_id: item.location_id || (item.id && !String(item.id).includes('place') ? item.id : undefined)
              };
            });
          }
        });
      }

      console.log("🚀 Payload gửi lên lưu API /recommend/save:", updatedResponse);
      const token = await getToken();
      await saveRecommendation(updatedResponse, token);
      showModal('success', t('recommendations.save_success_title'), t('recommendations.save_success_msg'));
    } catch (err) {
      console.error("Save Recommendation Error:", err);
      showModal('error', t('recommendations.save_error_title'), err.message || t('recommendations.save_error_msg'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      setRawResponse(null);
      try {
        const payload = {
          destination: { province: province || 'Khánh Hòa' },
          preferences: {
            categories: categories.length > 0 ? categories : ['Khám phá', 'Ẩm thực'],
            place_style: placeStyle
          },
          logistics: {
            starting_point: { type: 'address', name: startingPoint },
            transportation: transportation
          }
        };
        const token = await getToken();
        const response = await getRecommendations(payload, token);
        if (response) {
          setProvince(response.province);
        }
        const columns = {};
        if (response?.itinerary) {
          Object.keys(response.itinerary).forEach((dayKey, index) => {
            const dayData = response.itinerary[dayKey];
            columns[`day-${index + 1}`] = {
              title: `Day ${index + 1}`,
              items: dayData.places.map((place, pIdx) => ({
                ...place,
                location_id: place.location_id || place.id,
                id: `${dayKey}-place-${pIdx}`,
                tag: categories[0] || 'Khám phá'
              }))
            };
          });
          setPlannerData(columns);
          setRawResponse(response);
        } else {
          generateItinerary();
        }
      } catch (err) {
        console.error('API Error:', err);
        generateItinerary();
      } finally {
        setIsLoading(false);
        setShowResult(true);
      }
    }
  };

  return (
    <div className="bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col font-body">
      <style>{`
        .glass-container-recom {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(24px);
            border: 1.5px solid rgba(217, 221, 224, 0.3);
            box-shadow: 0 20px 40px rgba(79, 91, 125, 0.06);
        }
        .dark .glass-container-recom {
            background: rgba(28, 31, 54, 0.75);
            border: 1.5px solid rgba(70, 74, 107, 0.4);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .primary-gradient-recom {
            background: linear-gradient(135deg, #909CC2 0%, #C7D2FE 100%);
        }

        .hero-gradient-bg-recom {
            background: radial-gradient(circle at top left, #cad6ff 0%, #f5f7f9 40%, #dee5fd 80%);
        }
        .dark .hero-gradient-bg-recom {
            background: radial-gradient(circle at top left, #1a2040 0%, #0f101f 40%, #13162e 80%);
        }

        .step-node-active-recom {
            box-shadow: 0 0 15px rgba(144, 156, 194, 0.4);
        }
      `}</style>

      <main className="flex-grow flex items-center justify-center relative px-6 pt-36 pb-12 hero-gradient-bg-recom overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C7D2FE] rounded-full mix-blend-multiply filter blur-3xl opacity-30">
        </div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#909CC2] rounded-full mix-blend-multiply filter blur-3xl opacity-20">
        </div>

        {/* Wizard Card */}
        <div className="glass-container-recom w-full max-w-4xl rounded-3xl p-8 md:p-14 relative z-10">
          {/* Signature Stepper */}
          <div className="mb-14">
            <div className="flex justify-between items-center mb-4">
              <span className="font-display text-[0.75rem] uppercase tracking-[0.05em] text-on-surface-variant font-semibold">
                {step === 1 ? t('recommendations.step1') : step === 2 ? t('recommendations.step2') : t('recommendations.step3')}
              </span>
              <span className="font-display text-[0.75rem] uppercase tracking-[0.05em] text-primary font-bold">
                {step === 1 ? t('recommendations.vibe_selection') : step === 2 ? t('recommendations.place_style_selection') : t('recommendations.logistics_selection')}
              </span>
            </div>
            <div className="relative w-full h-[0.35rem] bg-surface-container-high rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full primary-gradient-recom rounded-full transition-all duration-500" style={{ width: step === 1 ? '33.33%' : step === 2 ? '66.66%' : '100%' }}></div>
            </div>
            <div className="flex justify-between mt-3 px-1">
              <div className={`w-3 h-3 rounded-full border-2 border-primary ${step >= 1 ? 'bg-surface-container-lowest step-node-active-recom' : 'bg-surface-container-high'}`}></div>
              <div className={`w-3 h-3 rounded-full border-2 ${step >= 2 ? 'border-primary bg-surface-container-lowest step-node-active-recom' : 'border-transparent bg-surface-container-high'}`}></div>
              <div className={`w-3 h-3 rounded-full border-2 ${step >= 3 ? 'border-primary bg-surface-container-lowest step-node-active-recom' : 'border-transparent bg-surface-container-high'}`}></div>
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center py-16 space-y-6 w-full max-w-2xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-on-surface text-center animate-pulse mb-8">
                {t('recommendations.loading_ai')}
              </h2>
              <div className="w-full space-y-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          )}

          {showResult && !isLoading && (
            <div className="flex flex-col items-center w-full space-y-8 animate-fade-in-up pb-8 mt-6">
              <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center shadow-lg shadow-primary-container/40">
                <span className="material-symbols-outlined text-4xl text-primary font-bold">auto_awesome</span>
              </div>
              <div className="text-center max-w-2xl px-4">
                <h2 className="text-3xl md:text-4xl font-display font-black text-on-surface mb-4">
                  {t('recommendations.result_title')}{' '}
                  <span className="text-primary">
                    {t('recommendations.result_title_days', { days: daysCount, nights: nightsCount })}
                  </span>
                </h2>
                <p className="text-on-surface-variant font-body leading-relaxed text-lg">
                  {t('recommendations.result_desc')}
                  <strong className="text-primary font-bold">{t('recommendations.result_desc_drag')}</strong>
                  {t('recommendations.result_desc_after')}
                </p>
              </div>

              <div className="w-full mt-6 px-4 md:px-10 z-20">
                {plannerData && <TripPlanner initialData={plannerData} onChange={(newCols) => setPlannerData(newCols)} />}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full justify-center">
                <button
                  onClick={() => {
                    setStep(1);
                    setShowResult(false);
                    setSearchParams({});
                    sessionStorage.removeItem('smarttravel_planner_state');
                  }}
                  className="group text-on-surface-variant font-black hover:text-primary transition-all flex items-center justify-center gap-3 font-body px-10 py-5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-outline-variant/30 hover:border-primary/50 shadow-sm hover:shadow-md"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-500">refresh</span>
                  {t('recommendations.btn_recreate')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !rawResponse}
                  className={`group bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-body px-10 py-5 rounded-2xl shadow-2xl shadow-primary/20 ${isSaving || !rawResponse ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:scale-125 transition-transform">
                    {isSaving ? 'sync' : 'auto_awesome'}
                  </span>
                  {isSaving ? t('recommendations.btn_saving') : t('recommendations.btn_save', { days: daysCount, nights: nightsCount })}
                </button>
              </div>
            </div>
          )}

          {!isLoading && !showResult && (
            <div className="space-y-10 animate-fade-in-up">
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-[2.5rem] md:text-[3.5rem] leading-tight font-display font-bold tracking-tight text-on-surface mb-4">
                  {step === 1 ? t('recommendations.title') : step === 2 ? t('recommendations.title_step2') : t('recommendations.title_step3')}
                </h1>
                <p className="text-lg text-on-surface-variant font-body">
                  {step === 1 ? t('recommendations.subtitle') : step === 2 ? t('recommendations.subtitle_step2') : t('recommendations.subtitle_step3')}
                </p>
              </div>

              {/* Selection Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${step === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
                {step === 1 && (
                  <div className="col-span-full">
                    <div className="mb-8 max-w-xl mx-auto relative z-50">
                      <label className="block text-sm font-bold text-on-surface mb-2 font-display">{t('recommendations.province_ph')}</label>
                      <CustomSelect
                        options={VIETNAM_PROVINCES.slice(1).map(p => ({ label: p.label, value: p.label }))}
                        value={province}
                        onChange={(e) => { setProvince(e.target.value); }}
                        placeholder={t('recommendations.province_ph')}
                        buttonClassName="w-full px-5 py-4 rounded-xl border-2 border-outline-variant/30 bg-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-body outline-none flex justify-between items-center text-left"
                        dropdownClassName="absolute z-50 w-full mt-2 bg-surface border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl"
                        optionClassName="text-on-surface hover:bg-surface-container-high"
                        activeOptionClassName="bg-primary/10 text-primary font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <button onClick={() => toggleCategory('Thư giãn')} className={getItemClasses(categories.includes('Thư giãn'))}>
                        <div className={getIconClasses(categories.includes('Thư giãn'))}>
                          <span className="material-symbols-outlined text-primary text-3xl" style={categories.includes('Thư giãn') ? { fontVariationSettings: "'FILL' 1" } : {}}>beach_access</span>
                        </div>
                        <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.chilling.title')}</h3>
                        <p className="text-sm text-on-surface-variant font-body">{t('recommendations.chilling.desc')}</p>
                      </button>
                      <button onClick={() => toggleCategory('Khám phá')} className={getItemClasses(categories.includes('Khám phá'))}>
                        <div className={getIconClasses(categories.includes('Khám phá'))}>
                          <span className="material-symbols-outlined text-primary text-3xl" style={categories.includes('Khám phá') ? { fontVariationSettings: "'FILL' 1" } : {}}>explore</span>
                        </div>
                        <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.adventure.title')}</h3>
                        <p className="text-sm text-on-surface-variant font-body">{t('recommendations.adventure.desc')}</p>
                      </button>
                      <button onClick={() => toggleCategory('Văn hóa')} className={getItemClasses(categories.includes('Văn hóa'))}>
                        <div className={getIconClasses(categories.includes('Văn hóa'))}>
                          <span className="material-symbols-outlined text-primary text-3xl" style={categories.includes('Văn hóa') ? { fontVariationSettings: "'FILL' 1" } : {}}>museum</span>
                        </div>
                        <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.culture.title')}</h3>
                        <p className="text-sm text-on-surface-variant font-body">{t('recommendations.culture.desc')}</p>
                      </button>
                      <button onClick={() => toggleCategory('Ẩm thực')} className={getItemClasses(categories.includes('Ẩm thực'))}>
                        <div className={getIconClasses(categories.includes('Ẩm thực'))}>
                          <span className="material-symbols-outlined text-primary text-3xl" style={categories.includes('Ẩm thực') ? { fontVariationSettings: "'FILL' 1" } : {}}>restaurant</span>
                        </div>
                        <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.food.title')}</h3>
                        <p className="text-sm text-on-surface-variant font-body">{t('recommendations.food.desc')}</p>
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button onClick={() => setPlaceStyle('must_go')} className={getItemClasses(placeStyle === 'must_go')}>
                      <div className={getIconClasses(placeStyle === 'must_go')}>
                        <span className="material-symbols-outlined text-primary text-3xl" style={placeStyle === 'must_go' ? { fontVariationSettings: "'FILL' 1" } : {}}>star</span>
                      </div>
                      <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.must_go.title')}</h3>
                      <p className="text-sm text-on-surface-variant font-body">{t('recommendations.must_go.desc')}</p>
                    </button>
                    <button onClick={() => setPlaceStyle('high_quality')} className={getItemClasses(placeStyle === 'high_quality')}>
                      <div className={getIconClasses(placeStyle === 'high_quality')}>
                        <span className="material-symbols-outlined text-primary text-3xl" style={placeStyle === 'high_quality' ? { fontVariationSettings: "'FILL' 1" } : {}}>thumb_up</span>
                      </div>
                      <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.high_quality.title')}</h3>
                      <p className="text-sm text-on-surface-variant font-body">{t('recommendations.high_quality.desc')}</p>
                    </button>
                    <button onClick={() => setPlaceStyle('hidden_gem')} className={getItemClasses(placeStyle === 'hidden_gem')}>
                      <div className={getIconClasses(placeStyle === 'hidden_gem')}>
                        <span className="material-symbols-outlined text-primary text-3xl" style={placeStyle === 'hidden_gem' ? { fontVariationSettings: "'FILL' 1" } : {}}>diamond</span>
                      </div>
                      <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.hidden_gem.title')}</h3>
                      <p className="text-sm text-on-surface-variant font-body">{t('recommendations.hidden_gem.desc')}</p>
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="col-span-full space-y-10">
                    <div>
                      <h3 className="text-lg font-bold text-on-surface mb-4 font-display">{t('recommendations.starting_point_label')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => setStartingPoint('Trung tâm')} className={getItemClasses(startingPoint === 'Trung tâm')}>
                          <span className="material-symbols-outlined text-primary text-3xl mb-2" style={startingPoint === 'Trung tâm' ? { fontVariationSettings: "'FILL' 1" } : {}}>location_city</span>
                          <h4 className="text-lg font-semibold">{t('recommendations.center')}</h4>
                        </button>
                        <button onClick={() => setStartingPoint('Ngoại ô')} className={getItemClasses(startingPoint === 'Ngoại ô')}>
                          <span className="material-symbols-outlined text-primary text-3xl mb-2" style={startingPoint === 'Ngoại ô' ? { fontVariationSettings: "'FILL' 1" } : {}}>landscape</span>
                          <h4 className="text-lg font-semibold">{t('recommendations.suburb')}</h4>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-on-surface mb-4 font-display">{t('recommendations.transport_label')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onClick={() => setTransportation('motorbike')} className={getItemClasses(transportation === 'motorbike')}>
                          <span className="material-symbols-outlined text-primary text-3xl mb-2" style={transportation === 'motorbike' ? { fontVariationSettings: "'FILL' 1" } : {}}>two_wheeler</span>
                          <h4 className="text-lg font-semibold">{t('recommendations.motorbike')}</h4>
                        </button>
                        <button onClick={() => setTransportation('car')} className={getItemClasses(transportation === 'car')}>
                          <span className="material-symbols-outlined text-primary text-3xl mb-2" style={transportation === 'car' ? { fontVariationSettings: "'FILL' 1" } : {}}>directions_car</span>
                          <h4 className="text-lg font-semibold">{t('recommendations.car')}</h4>
                        </button>
                        <button onClick={() => setTransportation('public_transport')} className={getItemClasses(transportation === 'public_transport')}>
                          <span className="material-symbols-outlined text-primary text-3xl mb-2" style={transportation === 'public_transport' ? { fontVariationSettings: "'FILL' 1" } : {}}>directions_bus</span>
                          <h4 className="text-lg font-semibold">{t('recommendations.public_transport')}</h4>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-10 flex flex-col items-center">
                <button onClick={handleNext} className="primary-gradient-recom text-on-primary px-10 py-5 rounded-full text-lg font-semibold shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all duration-300 w-full md:w-auto min-w-[300px] font-body">
                  {step < 3 ? t('recommendations.btn_next') : t('recommendations.btn_generate')}
                </button>
                <button onClick={() => navigate('/destinations')} className="mt-6 text-on-surface-variant font-medium hover:text-primary transition-colors flex items-center gap-2 font-body group">
                  {t('recommendations.btn_skip')}
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Decorative Floating Image (Asymmetric Layout) */}
        <div className="hidden lg:block absolute bottom-12 right-12 w-64 h-80 rounded-2xl overflow-hidden glass-container-recom p-3 rotate-3 shadow-2xl">
          <img alt="tropical beach" className="w-full h-full object-cover rounded-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCuPcvJ8uUeMJfSwigPXygkCoBFrXKDbtzQghpSwJ3g2N6zAFLAbSbfd0yEG6LdVylcojsyuqWepz1DnxhWuV8ekemuOF7M2BKHmGs4aGXTdYoiDDCvzbkTkJ8y5IhmrC-NfA_4K3CXx4kg9wVnWkAdQcf3Jhbn7L2a89RdROo2Em_OhmSjfPSTLC075XzCDhuuuKofJ_n5Yzm_32s8v_U3E02yL-SO52JWRH0EUx3aDFFsIvHIPCqqiBKF9KdSG5fHRbum3LnKZc" />
        </div>
        <div className="hidden lg:block absolute top-24 left-12 w-48 h-48 rounded-2xl overflow-hidden glass-container-recom p-3 -rotate-6 shadow-2xl">
          <img alt="mountain lake" className="w-full h-full object-cover rounded-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVYhJ13K6Q2pbm8QNKRYJuU49J1IeRjipQIDMW7JYEwTA28apXREYStHabfIrO2kkS86b6laI9YuPWD1hivhSYjTDGJg39WnVDPi3ef0e_d4nxu1s1pHIdlyIRVBMkkj4O0xN8BuQ9slwxCSjjlntHiebNQz67bShphs5FmRQbDBOOJML6R-XW6-n9tjw9wHMGGtHel_tgIqtW36SoTnLUvQtPGuXMOqtVz_yetHeBhI5wLEzeZ2pGxx_LL2XXLlJCd7MSRyz2JVo" />
        </div>
      </main>

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
