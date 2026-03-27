import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecommendationsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col font-body">
      <style>{`
        .glass-container-recom {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(24px);
            border: 1.5px solid rgba(217, 221, 224, 0.3);
            box-shadow: 0 20px 40px rgba(79, 91, 125, 0.06);
        }

        .primary-gradient-recom {
            background: linear-gradient(135deg, #909CC2 0%, #C7D2FE 100%);
        }

        .hero-gradient-bg-recom {
            background: radial-gradient(circle at top left, #cad6ff 0%, #f5f7f9 40%, #dee5fd 80%);
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
                    <span className="font-display text-[0.75rem] uppercase tracking-[0.05em] text-on-surface-variant font-semibold">Step 1 of 3</span>
                    <span className="font-display text-[0.75rem] uppercase tracking-[0.05em] text-primary font-bold">Vibe Selection</span>
                </div>
                <div className="relative w-full h-[0.35rem] bg-surface-container-high rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full primary-gradient-recom w-1/3 rounded-full"></div>
                </div>
                <div className="flex justify-between mt-3 px-1">
                    <div className="w-3 h-3 rounded-full bg-surface-container-lowest border-2 border-primary step-node-active-recom">
                    </div>
                    <div className="w-3 h-3 rounded-full bg-surface-container-high"></div>
                    <div className="w-3 h-3 rounded-full bg-surface-container-high"></div>
                </div>
            </div>

            {/* Content Area: Step 1 (Active) */}
            <div className="space-y-10">
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-[2.5rem] md:text-[3.5rem] leading-tight font-display font-bold tracking-tight text-on-surface mb-4">
                        What's your vibe?
                    </h1>
                    <p className="text-lg text-on-surface-variant font-body">Tell us how you want to feel on this journey.
                        We'll curate destinations that match your frequency.</p>
                </div>

                {/* Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Option 1 */}
                    <button className="group flex flex-col items-center p-8 bg-surface-container-lowest rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center border border-surface-variant/50">
                        <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
                            <span className="material-symbols-outlined text-primary text-3xl">beach_access</span>
                        </div>
                        <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">chilling</h3>
                        <p className="text-sm text-on-surface-variant font-body">Slow living, sunsets, and serene horizons.</p>
                    </button>

                    {/* Option 2 (Active Demo) */}
                    <button className="group flex flex-col items-center p-8 bg-surface-container-lowest rounded-2xl border-2 border-primary/40 ring-4 ring-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center">
                        <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-6 shadow-inner">
                            <span className="material-symbols-outlined text-primary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>explore</span>
                        </div>
                        <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">adventure</h3>
                        <p className="text-sm text-on-surface-variant font-body">Thrill-seeking and off-the-beaten-path.</p>
                    </button>

                    {/* Option 3 */}
                    <button className="group flex flex-col items-center p-8 bg-surface-container-lowest rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center border border-surface-variant/50">
                        <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
                            <span className="material-symbols-outlined text-primary text-3xl">museum</span>
                        </div>
                        <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">culture</h3>
                        <p className="text-sm text-on-surface-variant font-body">History, art, and local traditions.</p>
                    </button>

                    {/* Option 4 */}
                    <button className="group flex flex-col items-center p-8 bg-surface-container-lowest rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center border border-surface-variant/50">
                        <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
                            <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
                        </div>
                        <h3 className="text-xl font-semibold text-on-surface mb-2 font-display">food</h3>
                        <p className="text-sm text-on-surface-variant font-body">Culinary journeys and hidden flavors.</p>
                    </button>
                </div>

                {/* Action Footer */}
                <div className="pt-10 flex flex-col items-center">
                    <button onClick={() => navigate('/search')} className="primary-gradient-recom text-on-primary px-10 py-5 rounded-full text-lg font-semibold shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all duration-300 w-full md:w-auto min-w-[300px] font-body">
                        Generate my perfect journey
                    </button>
                    <button onClick={() => navigate('/destinations')} className="mt-6 text-on-surface-variant font-medium hover:text-primary transition-colors flex items-center gap-2 font-body group">
                        Skip for now
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>
            </div>
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
