import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SkeletonCard } from '../../components/common/Skeleton';

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // User selections
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);

  // Helper functions for styling
  const getItemClasses = (isSelected) => {
      return `group flex flex-col items-center p-8 bg-surface-container-lowest rounded-2xl transition-all duration-300 text-center cursor-pointer ${
          isSelected 
            ? 'border-2 border-primary/40 ring-4 ring-primary/5 shadow-lg -translate-y-3' 
            : 'border border-surface-variant/50 hover:-translate-y-1 hover:shadow-md'
      }`;
  };

  const getIconClasses = (isSelected) => {
      return `w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${
          isSelected ? 'bg-primary-container shadow-inner' : 'bg-surface-container-low group-hover:bg-primary-container'
      }`;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowResult(true);
      }, 2000);
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

      <main className="flex-grow flex items-center justify-center relative px-6 py-12 hero-gradient-bg-recom overflow-hidden">
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
                        {step === 1 ? t('recommendations.vibe_selection') : step === 2 ? t('recommendations.companion_selection') : t('recommendations.budget_selection')}
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
               <div className="flex flex-col items-center max-w-2xl mx-auto space-y-8 animate-fade-in-up pb-8">
                   <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center shadow-lg shadow-primary-container/40">
                     <span className="material-symbols-outlined text-4xl text-primary font-bold">check</span>
                   </div>
                   <div className="text-center">
                     <h2 className="text-3xl font-display font-bold text-on-surface mb-4">{t('recommendations.mock_result.title')}</h2>
                     <p className="text-on-surface-variant font-body leading-relaxed">{t('recommendations.mock_result.summary')}</p>
                   </div>

                   <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-xl hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                         <img alt="Hoi An" src="https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&q=80&w=300&h=300" className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                         <div>
                            <h3 className="text-xl font-bold font-display text-on-surface">{t('recommendations.mock_result.dest_name')}</h3>
                            <div className="flex gap-2 mt-2 hidden sm:flex">
                               <span className="text-xs px-2 py-1 bg-surface-container-high text-on-surface-variant font-semibold rounded-md">Culture</span>
                               <span className="text-xs px-2 py-1 bg-surface-container-high text-on-surface-variant font-semibold rounded-md">Friends</span>
                            </div>
                         </div>
                      </div>
                      <button onClick={() => navigate('/place/Hoi%20An')} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-primary-dim transition-all whitespace-nowrap">
                         {t('recommendations.btn_view_itinerary')}
                      </button>
                   </div>
                   
                   <button onClick={() => {setStep(1); setShowResult(false);}} className="mt-8 text-on-surface-variant font-medium hover:text-primary transition-colors flex items-center gap-2 font-body">
                     <span className="material-symbols-outlined text-sm">refresh</span>
                     {t('recommendations.btn_restart')}
                   </button>
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
                        <>
                            <button onClick={() => setSelectedVibe('chilling')} className={getItemClasses(selectedVibe === 'chilling')}>
                                <div className={getIconClasses(selectedVibe === 'chilling')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedVibe === 'chilling' ? {fontVariationSettings: "'FILL' 1"} : {}}>beach_access</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.chilling.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.chilling.desc')}</p>
                            </button>
                            <button onClick={() => setSelectedVibe('adventure')} className={getItemClasses(selectedVibe === 'adventure')}>
                                <div className={getIconClasses(selectedVibe === 'adventure')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedVibe === 'adventure' ? {fontVariationSettings: "'FILL' 1"} : {}}>explore</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.adventure.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.adventure.desc')}</p>
                            </button>
                            <button onClick={() => setSelectedVibe('culture')} className={getItemClasses(selectedVibe === 'culture')}>
                                <div className={getIconClasses(selectedVibe === 'culture')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedVibe === 'culture' ? {fontVariationSettings: "'FILL' 1"} : {}}>museum</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.culture.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.culture.desc')}</p>
                            </button>
                            <button onClick={() => setSelectedVibe('food')} className={getItemClasses(selectedVibe === 'food')}>
                                <div className={getIconClasses(selectedVibe === 'food')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedVibe === 'food' ? {fontVariationSettings: "'FILL' 1"} : {}}>restaurant</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.food.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.food.desc')}</p>
                            </button>
                        </>
                    )}
                    
                    {step === 2 && (
                        <>
                            <button onClick={() => setSelectedCompanion('solo')} className={getItemClasses(selectedCompanion === 'solo')}>
                                <div className={getIconClasses(selectedCompanion === 'solo')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedCompanion === 'solo' ? {fontVariationSettings: "'FILL' 1"} : {}}>person</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.solo.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.solo.desc')}</p>
                            </button>
                            <button onClick={() => setSelectedCompanion('couple')} className={getItemClasses(selectedCompanion === 'couple')}>
                                <div className={getIconClasses(selectedCompanion === 'couple')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedCompanion === 'couple' ? {fontVariationSettings: "'FILL' 1"} : {}}>favorite</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.couple.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.couple.desc')}</p>
                            </button>
                            <button onClick={() => setSelectedCompanion('family')} className={getItemClasses(selectedCompanion === 'family')}>
                                <div className={getIconClasses(selectedCompanion === 'family')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedCompanion === 'family' ? {fontVariationSettings: "'FILL' 1"} : {}}>home</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.family.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.family.desc')}</p>
                            </button>
                            <button onClick={() => setSelectedCompanion('friends')} className={getItemClasses(selectedCompanion === 'friends')}>
                                <div className={getIconClasses(selectedCompanion === 'friends')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedCompanion === 'friends' ? {fontVariationSettings: "'FILL' 1"} : {}}>groups</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.friends.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.friends.desc')}</p>
                            </button>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <button onClick={() => setSelectedBudget('eco')} className={getItemClasses(selectedBudget === 'eco')}>
                                <div className={getIconClasses(selectedBudget === 'eco')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedBudget === 'eco' ? {fontVariationSettings: "'FILL' 1"} : {}}>savings</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.budget_eco.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.budget_eco.desc')}</p>
                            </button>
                            <button onClick={() => setSelectedBudget('mid')} className={getItemClasses(selectedBudget === 'mid')}>
                                <div className={getIconClasses(selectedBudget === 'mid')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedBudget === 'mid' ? {fontVariationSettings: "'FILL' 1"} : {}}>account_balance_wallet</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.budget_mid.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.budget_mid.desc')}</p>
                            </button>
                            <button onClick={() => setSelectedBudget('lux')} className={getItemClasses(selectedBudget === 'lux')}>
                                <div className={getIconClasses(selectedBudget === 'lux')}>
                                    <span className="material-symbols-outlined text-primary text-3xl" style={selectedBudget === 'lux' ? {fontVariationSettings: "'FILL' 1"} : {}}>diamond</span>
                                </div>
                                <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">{t('recommendations.budget_lux.title')}</h3>
                                <p className="text-sm text-on-surface-variant font-body">{t('recommendations.budget_lux.desc')}</p>
                            </button>
                        </>
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
    </div>
  );
}
