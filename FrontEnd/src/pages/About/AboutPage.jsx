import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <style>{`
        .glass-panel-about {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
        }
        .shimmer-border-about {
            border: 1px solid rgba(172, 179, 183, 0.15);
        }
      `}</style>

      <main className="pt-4 pb-20">
        {/* Hero Section */}
        <section className="relative h-[650px] md:h-[819px] flex items-center justify-center overflow-hidden px-6 md:px-8 rounded-b-[3rem] md:rounded-[3rem] max-w-7xl mx-auto shadow-xl">
            <div className="absolute inset-0 z-0">
                <img alt="Serene landscape" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQWZDDgAlEDwBcdpuddQKOM7WqG9W1g8Lz0YOm1YpNCuNON1jxBhICNGy5b_y5DNgUQZKoJD5uHWvsd4Vel-gdu_UYG7bT0N42dzbuWVR3T2m2OI4sdziB0hrD1bjQvy0MyEco9ogjBoTVCz5RTBsSFbUimcMZzKpEMUmNtWK7M62Xrgh-Hyt4SJR-asOZSy4ZiQLv7sU2UqzKdDxQ0keb1Z2x8Ykq9xA6gqyrAjpjn4bUswkSiDaZon3dqKSLeFfq98I8anAL3Wc" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-surface"></div>
            </div>
            
            <div className="relative z-10 glass-panel-about shimmer-border-about rounded-[2rem] p-8 md:p-16 max-w-4xl text-center shadow-2xl mx-4">
                <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-on-background mb-6 leading-tight">
                    Engineering the <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Future of Travel</span>
                </h1>
                <p className="font-body text-[17px] md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                    We're not just a booking platform. We're your digital gateway to the stratosphere of luxury
                    exploration, powered by the most sophisticated AI on the planet.
                </p>
            </div>
        </section>

        {/* Stats Section (Bento Style) */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 -mt-24 relative z-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel-about shimmer-border-about rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-2">
                <span className="material-symbols-outlined text-primary text-[40px] mb-4">travel_explore</span>
                <div className="text-4xl font-display font-extrabold text-on-background">1M+</div>
                <div className="text-sm font-body font-bold text-on-surface-variant uppercase tracking-widest mt-2">Trips Curated</div>
            </div>
            <div className="glass-panel-about shimmer-border-about rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-2">
                <span className="material-symbols-outlined text-secondary text-[40px] mb-4">public</span>
                <div className="text-4xl font-display font-extrabold text-on-background">50+</div>
                <div className="text-sm font-body font-bold text-on-surface-variant uppercase tracking-widest mt-2">Countries</div>
            </div>
            <div className="glass-panel-about shimmer-border-about rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-2">
                <span className="material-symbols-outlined text-tertiary-dim text-[40px] mb-4">psychology</span>
                <div className="text-4xl font-display font-extrabold text-on-background">99.9%</div>
                <div className="text-sm font-body font-bold text-on-surface-variant uppercase tracking-widest mt-2">AI Accuracy</div>
            </div>
            <div className="glass-panel-about shimmer-border-about rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-2">
                <span className="material-symbols-outlined text-primary text-[40px] mb-4">star</span>
                <div className="text-4xl font-display font-extrabold text-on-background">4.9/5</div>
                <div className="text-sm font-body font-bold text-on-surface-variant uppercase tracking-widest mt-2">User Rating</div>
            </div>
        </section>

        {/* Mission Section */}
        <section className="py-24 max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
                <span className="text-primary font-body font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Our Purpose</span>
                <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-background leading-tight mb-8">
                    Personalization at the <span className="italic text-primary">Speed of Thought.</span>
                </h2>
                <div className="space-y-6 text-on-surface-variant text-[17px] leading-relaxed font-body">
                    <p>
                        In an era of endless options, the true luxury is relevance. SmartTravel was founded on the
                        belief that travel shouldn't be about scrolling through generic listings—it should be about
                        discovering experiences that resonate with your soul.
                    </p>
                    <p>
                        Our proprietary AI engines process millions of data points, from real-time climate patterns to
                        local cultural festivals, ensuring that every itinerary we generate is as unique as a
                        fingerprint. We bridge the gap between human intuition and machine precision.
                    </p>
                    <p>
                        Whether you're seeking a silent retreat in the Andes or a high-energy culinary tour through
                        Tokyo, our Digital Concierge understands the nuance of your desires before you even voice them.
                    </p>
                </div>
            </div>
            <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700 opacity-70"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shimmer-border-about">
                    <img alt="Futuristic AI interface" className="w-full aspect-square object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCblTnE6tu2FgRKs9jk1C0VPw9eOMBhQiGjLCyI0v_Tp2so5CN1TqzNqxzSQ_Zqj02x8UFj5zNTzCExiC4M_gcVo7jrVjFXte4I10aF-IZIlL2y7Id2H8Q-vavhhVEhLGJg-lg02XxRj100zKUsxciEtq0mVO5y2NIemYVtMp9N3VFp7IAWsE4twyBQapCj5Z3TFDUr7ZfGpIAhAbtqfiSBPrIX64nxSi8hpxBE3voEpUjBFTyoKn_q-1Xh53l3rYNKf1thDPQaEwA" />
                </div>
            </div>
        </section>

        {/* Team Section */}
        <section className="py-32 bg-surface-container-low overflow-hidden rounded-[3rem] max-w-7xl mx-auto shadow-sm">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
                <div className="text-center mb-16">
                    <span className="text-primary font-body font-bold text-sm uppercase tracking-[0.2em] mb-4 block">The Team</span>
                    <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-background mb-6">The Architects of Journey</h2>
                    <p className="text-on-surface-variant max-w-2xl mx-auto text-lg font-body leading-relaxed">
                        Meet the visionaries blending aerospace engineering with hospitality to redefine your transit.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Team Member 1 */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-primary/10 rounded-3xl -rotate-3 transition-transform group-hover:rotate-0 duration-500"></div>
                        <div className="relative glass-panel-about shimmer-border-about rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-6 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                                <img alt="CEO Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdBVgkGLKMyArK5y87uUnPNcX2G4PV3khw4iQSH1KpjVHEfdswyF5f3jb-aQ6L1rg3ZhJ13ZDgYXKRWhcat_PAHS0arUlgMmvdyZMrFZ-2Dt63mY9xi8Iji1GouIkrLCdavvd3wMMFDTL4eRx6XRkpfuDRBsZfQYZVwYXZoV3JFEuqxGgxq-8sFJTf7aN7pWXdR6uJ2gScnIsi2MXXtF9C2u2kWbTGUbQFhYm8Ln5MHLGCxupalUffidwhx8EzMmqerBD6kimQy-M" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-on-background mb-1">Marcus Thorne</h3>
                            <p className="text-primary font-body font-bold mb-5 uppercase tracking-wider text-xs bg-primary/10 px-3 py-1 rounded-full">Founder &amp; CEO</p>
                            <p className="text-[15px] text-on-surface-variant leading-relaxed">Former aerospace engineer dedicated to making the world more accessible through intelligent data.</p>
                        </div>
                    </div>

                    {/* Team Member 2 */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-secondary/10 rounded-3xl rotate-3 transition-transform group-hover:rotate-0 duration-500"></div>
                        <div className="relative glass-panel-about shimmer-border-about rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-6 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                                <img alt="CTO Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDf2yqOzbanJgpFoTYvw5F4gLdSkCOY54KHwSjCwzmWm32uiYNUB89G6wvQ4Sz6p33h36iDTuhutJhrm1wX_UmAcLlil6R53KXmWAeEEkrCwKvsYXkYvVCykywOCqewsAZqWcyRVaNaZEc26jQTVy9QRh8IzOAPqvJ-iZzK6OaRatBBHkPBgcLePF5bAwqJkNgkJ8I_drI44GOLXzjba8ZfDuVxui1sg8Sru2A36GktGYWo_1EtGVLLiu9DIvDKF7UurL8ID7wDK4" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-on-background mb-1">Elena Vance</h3>
                            <p className="text-secondary font-body font-bold mb-5 uppercase tracking-wider text-xs bg-secondary/10 px-3 py-1 rounded-full">Head of AI</p>
                            <p className="text-[15px] text-on-surface-variant leading-relaxed">Pioneer in neural mapping, ensuring every destination recommendation feels like a personal discovery.</p>
                        </div>
                    </div>

                    {/* Team Member 3 */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-tertiary/10 rounded-3xl -rotate-2 transition-transform group-hover:rotate-0 duration-500"></div>
                        <div className="relative glass-panel-about shimmer-border-about rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-6 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                                <img alt="Design Director Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqN6kx1xxcahgf2gjkUfJ87LwYX3M_fAflED8PCay40wJB32EBHFYBnq9uxwdFyUH4php9AMVwDzPSuJgCrp3-GXyAPfODStONnvrmjFogmIXfAc5Y8OTzK0y7WHKeGB9lAk9bAIls-tgVuDyCmKNdjkCh3J_OLVRSaKsvto3LW88Ufhw2SRtwSY7fC98JWC5VAjRVxioP_9SAJcvjtBvXFFpFU3TKjSGFcZ2LyFR6TdhEeewVHJbZhiunvtuwS0AArKZtjXUKAlg" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-on-background mb-1">Kaelen Moore</h3>
                            <p className="text-tertiary-dim font-body font-bold mb-5 uppercase tracking-wider text-xs bg-tertiary-dim/10 px-3 py-1 rounded-full">Experience Director</p>
                            <p className="text-[15px] text-on-surface-variant leading-relaxed">Crafting the "Ethereal Navigator" design language that makes planning as beautiful as the journey itself.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 max-w-7xl mx-auto px-6 md:px-8">
            <div className="relative rounded-[3rem] bg-inverse-surface p-12 md:p-20 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none mix-blend-screen">
                    <img alt="Global connectivity" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO4fcxo80SRIu7bG0L4-oMmA4co-69CInj_BrvZoAvfbO5UbkJA_-Drey2q8ag3WjBlm3RrtaUMlhrjTcpghhCLgJxTLzrUJTFFqQuvceONbReAhM-GP2XCjYXrkORYm48ubK0_vtlOYs8kkEHCwsIgbiKHZghUJmV4bj6t_sv4vcgfyEdvBpnY7HzGn4vSr55DkEaWtppurofVPoxURrW1yc-5J3UhEPSkOaCUPtpMHEh-_PPgH1l_f6pRgCpcs5shD61vypzfZI" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-surface mb-6 leading-tight">Ready to transcend the ordinary?</h2>
                    <p className="text-surface-dim text-lg mb-10 leading-relaxed font-body">Our concierge is standing by to build your next
                        stratosphere journey. Reach out to our global support team or start your exploration today.</p>
                    <div className="flex flex-col sm:flex-row gap-4 font-body">
                        <button onClick={() => navigate('/search')} className="bg-gradient-to-br from-primary to-secondary text-on-primary px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all text-center">
                            Start Planning
                        </button>
                        <button onClick={() => navigate('/contact')} className="glass-panel-about text-on-surface px-10 py-4 rounded-full font-bold text-lg shimmer-border-about hover:bg-white/90 transition-all text-center border-white">
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
