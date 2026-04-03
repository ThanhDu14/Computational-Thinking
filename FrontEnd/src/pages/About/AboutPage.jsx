import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Du from '../../assets/images/Du.png';
import Hieu from '../../assets/images/Hieu.png';
import Duy from '../../assets/images/Duy.png'
import Anh from '../../assets/images/Anh.png'

export default function AboutPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen">
            <style>{`
        .glass-panel-about {
            background: var(--bg-glass);
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
                            {t('about.hero_title_1')} <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{t('about.hero_title_2')}</span>
                        </h1>
                        <p className="font-body text-[17px] md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                            {t('about.hero_subtitle')}
                        </p>
                    </div>
                </section>

                {/* Stats Section (Bento Style) */}
                <section className="max-w-7xl mx-auto px-6 md:px-8 -mt-24 relative z-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-panel-about shimmer-border-about rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-2">
                        <span className="material-symbols-outlined text-primary text-[40px] mb-4">travel_explore</span>
                        <div className="text-4xl font-display font-extrabold text-on-background">1M+</div>
                        <div className="text-sm font-body font-bold text-on-surface-variant uppercase tracking-widest mt-2">{t('about.stats.trips')}</div>
                    </div>
                    <div className="glass-panel-about shimmer-border-about rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-2">
                        <span className="material-symbols-outlined text-secondary text-[40px] mb-4">public</span>
                        <div className="text-4xl font-display font-extrabold text-on-background">50+</div>
                        <div className="text-sm font-body font-bold text-on-surface-variant uppercase tracking-widest mt-2">{t('about.stats.countries')}</div>
                    </div>
                    <div className="glass-panel-about shimmer-border-about rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-2">
                        <span className="material-symbols-outlined text-tertiary-dim text-[40px] mb-4">psychology</span>
                        <div className="text-4xl font-display font-extrabold text-on-background">99.9%</div>
                        <div className="text-sm font-body font-bold text-on-surface-variant uppercase tracking-widest mt-2">{t('about.stats.accuracy')}</div>
                    </div>
                    <div className="glass-panel-about shimmer-border-about rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-2">
                        <span className="material-symbols-outlined text-primary text-[40px] mb-4">star</span>
                        <div className="text-4xl font-display font-extrabold text-on-background">4.9/5</div>
                        <div className="text-sm font-body font-bold text-on-surface-variant uppercase tracking-widest mt-2">{t('about.stats.rating')}</div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-24 max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-primary font-body font-bold text-sm uppercase tracking-[0.2em] mb-4 block">{t('about.mission.title')}</span>
                        <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-background leading-tight mb-8">
                            {t('about.mission.heading_1')} <span className="italic text-primary">{t('about.mission.heading_2')}</span>
                        </h2>
                        <div className="space-y-6 text-on-surface-variant text-[17px] leading-relaxed font-body">
                            <p>{t('about.mission.p1')}</p>
                            <p>{t('about.mission.p2')}</p>
                            <p>{t('about.mission.p3')}</p>
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
                            <span className="text-primary font-body font-bold text-sm uppercase tracking-[0.2em] mb-4 block">{t('about.team.title')}</span>
                            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-background mb-6">{t('about.team.heading')}</h2>
                            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg font-body leading-relaxed">
                                {t('about.team.subtitle')}</p>
                        </div>

                        {/* First Row: 3 Members */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                            {/* Team Member 1 */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-primary/10 rounded-3xl -rotate-3 transition-transform group-hover:rotate-0 duration-500"></div>
                                <div className="relative glass-panel-about shimmer-border-about rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-6 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                                        <img alt="CEO Avatar" className="w-full h-full object-cover" src={Du} />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-on-background mb-1">Nguyen Thanh Du</h3>
                                    <p className="text-primary font-body font-bold mb-5 uppercase tracking-wider text-xs bg-primary/10 px-3 py-1 rounded-full">Front-End Developer</p>
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
                                    <h3 className="font-display text-2xl font-bold text-on-background mb-1">Nguyễn Quốc Đạt</h3>
                                    <p className="text-secondary font-body font-bold mb-5 uppercase tracking-wider text-xs bg-secondary/10 px-3 py-1 rounded-full">Leader-AI Enginner</p>
                                    <p className="text-[15px] text-on-surface-variant leading-relaxed">Pioneer in neural mapping, ensuring every destination recommendation feels like a personal discovery.</p>
                                </div>
                            </div>

                            {/* Team Member 3 */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-tertiary/10 rounded-3xl -rotate-2 transition-transform group-hover:rotate-0 duration-500"></div>
                                <div className="relative glass-panel-about shimmer-border-about rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-6 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                                        <img alt="Design Director Avatar" className="w-full h-full object-cover" src={Duy} />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-on-background mb-1">Nguyễn Đức Duy</h3>
                                    <p className="text-tertiary-dim font-body font-bold mb-5 uppercase tracking-wider text-xs bg-tertiary-dim/10 px-3 py-1 rounded-full">BackEnd Developer</p>
                                    <p className="text-[15px] text-on-surface-variant leading-relaxed">Crafting the "Ethereal Navigator" design language that makes planning as beautiful as the journey itself.</p>
                                </div>
                            </div>
                        </div>

                        {/* Second Row: 3 Members */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                            {/* Team Member 4 */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-2 transition-transform group-hover:rotate-0 duration-500"></div>
                                <div className="relative glass-panel-about shimmer-border-about rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-6 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                                        <img alt="Team member" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-on-background mb-1">Mai Văn Hiển</h3>
                                    <p className="text-primary font-body font-bold mb-5 uppercase tracking-wider text-xs bg-primary/10 px-3 py-1 rounded-full">FrontEnd Developer</p>
                                    <p className="text-[15px] text-on-surface-variant leading-relaxed">Mastermind behind our robust server architecture, ensuring lightning-fast searches worldwide.</p>
                                </div>
                            </div>

                            {/* Team Member 5 */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-secondary/10 rounded-3xl -rotate-3 transition-transform group-hover:rotate-0 duration-500"></div>
                                <div className="relative glass-panel-about shimmer-border-about rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-6 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                                        <img alt="Team member" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-on-background mb-1">Lê Quốc Hưng</h3>
                                    <p className="text-secondary font-body font-bold mb-5 uppercase tracking-wider text-xs bg-secondary/10 px-3 py-1 rounded-full">BackEnd Developer</p>
                                    <p className="text-[15px] text-on-surface-variant leading-relaxed">Translating complex data into seamless, intuitive interfaces that delight our travelers.</p>
                                </div>
                            </div>

                            {/* Team Member 6 */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-tertiary/10 rounded-3xl rotate-3 transition-transform group-hover:rotate-0 duration-500"></div>
                                <div className="relative glass-panel-about shimmer-border-about rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-6 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                                        <img alt="Team member" className="w-full h-full object-cover" src={Anh} />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-on-background mb-1">Nguyễn Thế Anh</h3>
                                    <p className="text-tertiary font-body font-bold mb-5 uppercase tracking-wider text-xs bg-tertiary/10 px-3 py-1 rounded-full">Data Scientist</p>
                                    <p className="text-[15px] text-on-surface-variant leading-relaxed">Analyzing global travel trends to continuously refine our personalized recommendation engine.</p>
                                </div>
                            </div>
                        </div>

                        {/* Third Row: 2 Members */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                            {/* Team Member 7 */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-primary/10 rounded-3xl -rotate-2 transition-transform group-hover:rotate-0 duration-500"></div>
                                <div className="relative glass-panel-about shimmer-border-about rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-6 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                                        <img alt="Team member" className="w-full h-full object-cover" src={Hieu} />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-on-background mb-1">Nguyễn Đại Hiếu</h3>
                                    <p className="text-primary font-body font-bold mb-5 uppercase tracking-wider text-xs bg-primary/10 px-3 py-1 rounded-full">Product Manager</p>
                                    <p className="text-[15px] text-on-surface-variant leading-relaxed">Orchestrating cross-functional teams to deliver exceptional features matching our vision.</p>
                                </div>
                            </div>

                            {/* Team Member 8 */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-secondary/10 rounded-3xl rotate-2 transition-transform group-hover:rotate-0 duration-500"></div>
                                <div className="relative glass-panel-about shimmer-border-about rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-6 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                                        <img alt="Team member" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-on-background mb-1">Trần Văn Nguyên</h3>
                                    <p className="text-secondary font-body font-bold mb-5 uppercase tracking-wider text-xs bg-secondary/10 px-3 py-1 rounded-full">Quality Assurance</p>
                                    <p className="text-[15px] text-on-surface-variant leading-relaxed">Rigorous testing expert dedicated to ensuring every journey booked is absolutely flawless.</p>
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
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-surface mb-6 leading-tight">{t('about.cta.heading')}</h2>
                            <p className="text-surface-dim text-lg mb-10 leading-relaxed font-body">{t('about.cta.subtitle')}</p>
                            <div className="flex flex-col sm:flex-row gap-4 font-body">
                                <button onClick={() => navigate('/search')} className="bg-gradient-to-br from-primary to-secondary text-on-primary px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all text-center">
                                    {t('about.cta.start')}
                                </button>
                                <button onClick={() => navigate('/contact')} className="glass-panel-about text-on-surface px-10 py-4 rounded-full font-bold text-lg shimmer-border-about hover:opacity-80 transition-all text-center">
                                    {t('about.cta.contact')}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
