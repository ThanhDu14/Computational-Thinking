import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles, Brain, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const illustration1Y = useTransform(scrollY, [0, 500], [0, -100]);
  const illustration2Y = useTransform(scrollY, [0, 500], [0, -150]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="w-full">
      <style>{`
        @keyframes custom-float {
            0%, 100% { transform: translateY(0) rotate(-12deg); }
            50% { transform: translateY(-20px) rotate(-10deg); }
        }
        @keyframes custom-float-delayed {
            0%, 100% { transform: translateY(0) rotate(8deg); }
            50% { transform: translateY(-30px) rotate(12deg); }
        }
        .animate-float {
            animation: custom-float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
            animation: custom-float-delayed 8s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .glass-card-custom {
          background: var(--bg-glass);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .luminous-gradient-custom {
          background: linear-gradient(135deg, var(--gradient-brand-start) 0%, var(--gradient-brand-end) 100%);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative w-full min-h-[100vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden mb-24 transition-colors duration-500" style={{ background: `linear-gradient(135deg, var(--gradient-hero-start) 0%, var(--gradient-hero-end) 100%)` }}>
        {/* Floating Illustrations */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <motion.div 
            style={{ y: illustration1Y }}
            className="absolute top-1/4 left-5 md:left-20 w-64 h-64 glass-card-custom rounded-[2.5rem] animate-float overflow-hidden border border-white/50 shadow-2xl p-2"
          >
            <img className="w-full h-full object-cover rounded-[2rem] opacity-90" alt="travel map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz_ASohrGDDEO80TYarTvT8xLBawL3JsAoIpyYuggsmSsTadOLQybIhczQXQKtamIyiCO3iWrUuLQA2GOGgxT43woz2fRHtFhCosVbVcd2Be06pg6K_Y4sTOPnFJrNj1MpCBhZ5fLwXZyvdyGmmGrgzyc8kKgUg1iPfcWKxi4TKqAnOUTYaonR1F8S1uJ_bc3V0XFatD6FsEfKP85ejQuuL9DQmZp8-Ky-1nGfR6qg9AFzWpxYIK3XG8mYvM5JZrxAluNxKqgly4c" />
          </motion.div>
          <motion.div 
            style={{ y: illustration2Y }}
            className="absolute bottom-10 right-5 md:right-20 w-72 h-72 glass-card-custom rounded-full animate-float-delayed overflow-hidden border border-white/50 shadow-2xl p-2"
          >
            <img className="w-full h-full object-cover rounded-full opacity-90" alt="globe" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf4CJmaqNVAqgoWdB-fVJzNejL3DEaX35x6xLDGQnV17bME2UrQlHqwfd07CB0btOJIEnaBguAeJ9N9ttKtH3umCSSj1Ael9lqzWAmvNA4k9NhPwJGq4H2m7-hv_VF0Fq9EgaUjGK-ixKorfQNdXmLYHLscE5H1qlbYhl7sR_3t9vPFrKY1VN_I9Y6GEbuGxopPd5tBL2ShXEHHSq4pK3dl1LBQjzfQOKaf5V8xBh-zRPouPKINKhZOc0Xe4pEOJeSgj4SwoRVZgw" />
          </motion.div>
        </div>

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-4xl text-center space-y-8 mt-10"
        >
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-[4rem] font-extrabold text-on-surface leading-[1.1] tracking-tight font-display"
          >
            {t('home.hero.title_1')} <br />
            <span className="text-primary italic">{t('home.hero.title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-on-surface-variant font-body max-w-2xl mx-auto"
          >
            {t('home.hero.subtitle')}
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-body"
          >
            <button
              onClick={() => navigate('/search')}
              className="luminous-gradient-custom text-on-primary px-8 py-4 rounded-full text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30"
            >
              {t('home.hero.explore_btn')}
            </button>
            <button
              onClick={() => navigate('/destinations')}
              className="bg-surface-container-lowest/50 backdrop-blur-md text-on-surface px-8 py-4 rounded-full text-lg font-bold hover:bg-white active:scale-95 transition-all shadow-md"
            >
              {t('home.hero.popular_btn')}
            </button>
          </motion.div>

          {/* Search Bar Component */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 w-full max-w-4xl mx-auto glass-card-custom p-4 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-4 font-body border border-white/70"
          >
            <div className="flex-1 w-full flex items-center px-4 bg-surface-container-low rounded-full py-3 focus-within:bg-white transition-colors group border border-outline-variant/30">
              <Search className="w-6 h-6 text-outline mr-3" />
              <input
                className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant font-medium outline-none"
                placeholder={t('home.hero.search_placeholder')}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate('/search?q=' + encodeURIComponent(searchQuery)) }}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button className="px-5 py-3 rounded-full bg-secondary-container text-on-secondary-container text-sm font-bold tracking-wide whitespace-nowrap hover:shadow-md active:scale-95 transition-all">{t('home.hero.tag_beach')}</button>
              <button className="px-5 py-3 rounded-full bg-surface text-on-surface-variant text-sm font-bold tracking-wide hover:bg-surface-container-high active:scale-95 transition-colors whitespace-nowrap border border-outline-variant/20">{t('home.hero.tag_mountain')}</button>
              <button className="px-5 py-3 rounded-full bg-surface text-on-surface-variant text-sm font-bold tracking-wide hover:bg-surface-container-high active:scale-95 transition-colors whitespace-nowrap border border-outline-variant/20">{t('home.hero.tag_culture')}</button>
            </div>
            <button className="bg-on-surface text-surface px-8 py-3 rounded-full font-bold ml-2 hover:bg-on-surface/90 active:scale-95 transition-colors" onClick={() => navigate('/search?q=' + encodeURIComponent(searchQuery))}>{t('home.hero.search_btn')}
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Trending Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="mb-32 px-6 max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-end mb-16">
          <motion.div variants={itemVariants} className="space-y-4">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold font-body">{t('home.trending.subtitle')}</span>
            <h2 className="text-4xl font-extrabold text-on-surface font-display">{t('home.trending.title')}</h2>
          </motion.div>
          <motion.button variants={itemVariants} onClick={() => navigate('/destinations')} className="text-primary font-bold flex items-center gap-2 group font-body">
            {t('home.trending.view_all')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Card 1 */}
          <motion.div variants={itemVariants} onClick={() => navigate('/destinations')} className="group cursor-pointer">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg mb-6">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ha Long Bay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAor8-VL8aSjFgd2aYj_8mO8V-yknKZRYUtrCe25pyZ50niS1U3L0Zx4567DCKL2KpCKV2HsUnAYWdEkbbwhnqzTMc76T221i-sDTDgJ7E6np289LksLcf1m7cY7YxNwoUJIo6kgo8AcTDzefsvFzZRiAAMxI4-h4jqXD8NznZe8aNFqTBSwLZ3tA7XJinmKo4p0eTHKo-jpentIXGDjMQhOPH43TRuDBh-ZP9fGjzeZj42yXcG_5u4wWbQmm-f39XBMRRfk4Gj6zo" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold uppercase text-primary font-body tracking-wider">{t('home.trending.card1.tag')}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 line-clamp-2 leading-tight font-display">{t('home.trending.card1.title')}</h3>
            <p className="text-on-surface-variant mb-4 line-clamp-2 font-body text-[15px]">{t('home.trending.card1.desc')}</p>
            <span className="text-on-surface font-bold text-sm underline underline-offset-4 decoration-primary-container hover:decoration-primary transition-all font-body">{t('home.trending.view_details')}</span>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} onClick={() => navigate('/destinations')} className="group cursor-pointer">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg mb-6">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Marrakesh" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3egscJhpY_1IoeW1Cv9kfFEoejfvUZYHukquUWQhfGIwc5TSYlvnCUSPR194EWjsKIFXEGMzg7p_btVjMdk_MK6Cxbm4OdaYCyMCYhvxpQL2kEyRgHDyykQ88L2ZVSsrd5cyy-QbLLiwwnt8QJ8Y2-zr5yYbR7eZ3xAI1kMOpXCvzDpAd4AxKTqxMA-PaKv0_XlAEfvvQnnolDc2kMPDpOQi7EoLlg03lFc5kWxfVko5mxjCYbaAcdePNGmeQ2qFQfmW-hKxz1eg" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold uppercase text-primary font-body tracking-wider">{t('home.trending.card2.tag')}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 line-clamp-2 leading-tight font-display">{t('home.trending.card2.title')}</h3>
            <p className="text-on-surface-variant mb-4 line-clamp-2 font-body text-[15px]">{t('home.trending.card2.desc')}</p>
            <span className="text-on-surface font-bold text-sm underline underline-offset-4 decoration-primary-container hover:decoration-primary transition-all font-body">{t('home.trending.view_details')}</span>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} onClick={() => navigate('/destinations')} className="group cursor-pointer">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg mb-6">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Swiss Alps" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDR69MUONwdFrqK0ny1AdsNsgSRtqFHDtdCoAj3Vc0nzZyOkn-RkFhpjCYDKHo7UbcpKFYkDhwSjD0Gx1jUFh4-o_aQVrAHM1hXCIJB93AYctHO2JPYDxrJS3NNaMSU6J78a-wec4_JjPTiB--CDHIrxGfvZQUCGAlSIMkZnLrj6q78MKF2TVlZVXmRxCEDsQdXrXfZbpBXll6tqeeuUuvR3fPWL9szQBHk5DdzCso1RK0lxp1VN41_SJMBRl_6MD9gnTShsswH6B0" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold uppercase text-primary font-body tracking-wider">{t('home.trending.card3.tag')}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 line-clamp-2 leading-tight font-display">{t('home.trending.card3.title')}</h3>
            <p className="text-on-surface-variant mb-4 line-clamp-2 font-body text-[15px]">{t('home.trending.card3.desc')}</p>
            <span className="text-on-surface font-bold text-sm underline underline-offset-4 decoration-primary-container hover:decoration-primary transition-all font-body">{t('home.trending.view_details')}</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Personalized AI Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-24 bg-surface-container-low rounded-[3rem] mb-32 max-w-[calc(100%-3rem)] md:max-w-7xl mx-auto"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={itemVariants} className="mb-16 text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/30 text-primary rounded-full font-bold text-xs uppercase tracking-widest mb-6 font-body">
              <Sparkles className="w-4 h-4 fill-primary" />
              {t('home.ai.subtitle')}
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 font-display">{t('home.ai.title')}</h2>
            <p className="text-lg text-on-surface-variant font-body">{t('home.ai.desc')}</p>
          </motion.div>

          <div className="flex flex-col gap-6">
            {/* AI Card 1 */}
            <motion.div variants={itemVariants} className="glass-card-custom p-8 md:p-10 rounded-[2rem] border border-white/40 flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-2xl hover:shadow-primary/5 transition-all">
              <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 md:gap-8">
                <div className="w-20 h-20 shrink-0 bg-primary-container rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Brain className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-on-surface mb-2 font-display uppercase tracking-tight">{t('home.ai.card1.title')}</h4>
                  <p className="text-on-surface-variant font-body text-[15px]">{t('home.ai.card1.desc')}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/recommendations')}
                className="luminous-gradient-custom text-on-primary px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/20 whitespace-nowrap font-body hover:scale-105 active:scale-95 transition-transform"
              >
                {t('home.ai.btn')}
              </button>
            </motion.div>

            {/* AI Card 2 */}
            <motion.div variants={itemVariants} className="glass-card-custom p-8 md:p-10 rounded-[2rem] border border-white/40 flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-2xl hover:shadow-primary/5 transition-all">
              <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 md:gap-8">
                <div className="w-20 h-20 shrink-0 bg-secondary-container rounded-full flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                  <Leaf className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-on-surface mb-2 font-display uppercase tracking-tight">{t('home.ai.card2.title')}</h4>
                  <p className="text-on-surface-variant font-body text-[15px]">{t('home.ai.card2.desc')}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/recommendations')}
                className="luminous-gradient-custom text-on-primary px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/20 whitespace-nowrap font-body hover:scale-105 active:scale-95 transition-transform"
              >
                {t('home.ai.btn')}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mb-32 px-6"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="glass-card-custom p-12 rounded-[2rem] border border-outline-variant/10 text-center space-y-4 shadow-sm hover:shadow-md hover:-translate-y-2 transition-all">
            <div className="text-5xl md:text-6xl font-extrabold text-primary font-display">10k+</div>
            <div className="text-sm uppercase tracking-widest text-on-surface-variant font-bold font-body">{t('home.stats.destinations')}</div>
          </motion.div>
          <motion.div variants={itemVariants} className="glass-card-custom p-12 rounded-[2rem] border border-outline-variant/10 text-center space-y-4 shadow-sm hover:shadow-md hover:-translate-y-2 transition-all">
            <div className="text-5xl md:text-6xl font-extrabold text-primary font-display">50+</div>
            <div className="text-sm uppercase tracking-widest text-on-surface-variant font-bold font-body">{t('home.stats.countries')}</div>
          </motion.div>
          <motion.div variants={itemVariants} className="glass-card-custom p-12 rounded-[2rem] border border-outline-variant/10 text-center space-y-4 shadow-sm hover:shadow-md hover:-translate-y-2 transition-all">
            <div className="text-5xl md:text-6xl font-extrabold text-primary font-display">95%</div>
            <div className="text-sm uppercase tracking-widest text-on-surface-variant font-bold font-body">{t('home.stats.happy')}</div>
          </motion.div>
        </div>
      </motion.section>

      {/* Inspiration Blog Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-24 bg-surface rounded-[3rem] border border-outline-variant/10 shadow-sm px-6 max-w-7xl mx-auto mb-10"
      >
        <div className="flex justify-between items-end mb-16">
          <motion.h2 variants={itemVariants} className="text-4xl font-extrabold text-on-surface font-display">{t('home.blog.title')}</motion.h2>
          <motion.div variants={itemVariants} className="hidden md:flex gap-4">
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white hover:border-transparent hover:shadow-md active:scale-90 transition-all text-on-surface">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white hover:border-transparent hover:shadow-md active:scale-90 transition-all text-on-surface">
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Blog Card 1 */}
          <motion.div variants={itemVariants} onClick={() => navigate('/blog')} className="group relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-lg border border-outline-variant/5 cursor-pointer">
            <div className="aspect-video overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="vintage camera" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa6Wh3loHh6ULBSzAreuZ9WGBZ6p_y83fPRq9uoqQU24bI5w55JKWJW6FE1Q2LHgnTkByE6c6ZKXSBqoaK96DsdsAvO94A6Dl84W0BHsVq_nYlrsfeSt8J-hVj0zR3-020Cz_Cba6nLofMZDNDW0-t8wq7g8nt3bnsV5X0ezOCyLaSnJnGFATOM3ffXCkuvfIOsLVqxamEDSz9dz7WM-rUAhujaqa5XYIHJHF6-KZ-Yx0USoJCz9mBqnaEwYyTXOsnu0JwqIHNZ8E" />
            </div>
            <div className="p-10 space-y-5">
              <h3 className="text-3xl font-bold text-on-surface leading-tight font-display">{t('home.blog.card1.title')}</h3>
              <p className="text-on-surface-variant font-body text-[15px] leading-relaxed">{t('home.blog.card1.desc')}</p>
              <div className="inline-flex items-center gap-2 text-primary font-bold group-hover:text-primary-dim transition-colors font-body mt-2">
                {t('home.blog.read_more')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Blog Card 2 */}
          <motion.div variants={itemVariants} onClick={() => navigate('/blog')} className="group relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-lg border border-outline-variant/5 cursor-pointer">
            <div className="aspect-video overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Tokyo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7BNSazCApVSLFmJvSD3YEyPpLyu6GvDLLytRumnQYmm--kNiqYQjFpSylvNAPWbGiEng-tPqji31xUZaaK6woSf_nfU9ZS02rbl-QA5dBJ0LDALLBZfa8YpdsAN7YHvOuWX1Iwm-4mMk483TtY9phH3Cviz-osgJQ_WXPLe1pkS7soxsZvs6VTOx3g3QcBq2YMNrx7x2PkrdTFt97RtAykgFBobSjTrjeWB2f8dyfUAdFVK1wJ67XqCf18ZelPGh1m-kabW1QkoE" />
            </div>
            <div className="p-10 space-y-5">
              <h3 className="text-3xl font-bold text-on-surface leading-tight font-display">{t('home.blog.card2.title')}</h3>
              <p className="text-on-surface-variant font-body text-[15px] leading-relaxed">{t('home.blog.card2.desc')}</p>
              <div className="inline-flex items-center gap-2 text-primary font-bold group-hover:text-primary-dim transition-colors font-body mt-2">
                {t('home.blog.read_more')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
