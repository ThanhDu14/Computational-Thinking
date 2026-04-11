import React from 'react';
import { Search, ArrowRight, Sparkles, Brain, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HomePage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const floatBgY = useTransform(scrollY, [0, 1000], [0, 150]);

  // Framer Motion variants
  const fadeInUP = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .luminous-gradient-custom {
          background: linear-gradient(135deg, #4f5b7d 0%, #cad6ff 100%);
        }
      `}</style>
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[100vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 bg-[linear-gradient(135deg,#cad6ff_0%,#f8f5ff_100%)] overflow-hidden mb-24">
        {/* Floating Illustrations */}
        <motion.div style={{ y: floatBgY }} className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute top-1/4 left-5 md:left-20 w-64 h-64 glass-card-custom rounded-[2.5rem] animate-float overflow-hidden border border-white/50 shadow-2xl p-2">
            <img className="w-full h-full object-cover rounded-[2rem] opacity-90" alt="travel map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz_ASohrGDDEO80TYarTvT8xLBawL3JsAoIpyYuggsmSsTadOLQybIhczQXQKtamIyiCO3iWrUuLQA2GOGgxT43woz2fRHtFhCosVbVcd2Be06pg6K_Y4sTOPnFJrNj1MpCBhZ5fLwXZyvdyGmmGrgzyc8kKgUg1iPfcWKxi4TKqAnOUTYaonR1F8S1uJ_bc3V0XFatD6FsEfKP85ejQuuL9DQmZp8-Ky-1nGfR6qg9AFzWpxYIK3XG8mYvM5JZrxAluNxKqgly4c" />
          </div>
          <div className="absolute bottom-10 right-5 md:right-20 w-72 h-72 glass-card-custom rounded-full animate-float-delayed overflow-hidden border border-white/50 shadow-2xl p-2">
            <img className="w-full h-full object-cover rounded-full opacity-90" alt="globe" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf4CJmaqNVAqgoWdB-fVJzNejL3DEaX35x6xLDGQnV17bME2UrQlHqwfd07CB0btOJIEnaBguAeJ9N9ttKtH3umCSSj1Ael9lqzWAmvNA4k9NhPwJGq4H2m7-hv_VF0Fq9EgaUjGK-ixKorfQNdXmLYHLscE5H1qlbYhl7sR_3t9vPFrKY1VN_I9Y6GEbuGxopPd5tBL2ShXEHHSq4pK3dl1LBQjzfQOKaf5V8xBh-zRPouPKINKhZOc0Xe4pEOJeSgj4SwoRVZgw" />
          </div>
        </motion.div>
        
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-4xl text-center space-y-8 mt-10">
          <h1 className="text-5xl md:text-[4rem] font-extrabold text-on-surface leading-[1.1] tracking-tight font-display">
            Discover your next <br />
            <span className="text-primary italic">unforgettable journey</span>
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant font-body max-w-2xl mx-auto">
            AI-powered suggestions for destinations you'll love, crafted for the modern wanderer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-body">
            <button 
              onClick={() => navigate('/search')}
              className="luminous-gradient-custom text-on-primary px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-xl shadow-primary/30"
            >
              Explore destinations
            </button>
            <button 
              onClick={() => navigate('/destinations')}
              className="bg-surface-container-lowest/50 backdrop-blur-md text-on-surface px-8 py-4 rounded-full text-lg font-bold hover:bg-white transition-all shadow-md"
            >
              View popular places
            </button>
          </div>

          {/* Search Bar Component */}
          <div className="mt-16 w-full max-w-4xl mx-auto glass-card-custom p-4 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-4 font-body border border-white/70">
            <div className="flex-1 w-full flex items-center px-4 bg-surface-container-low rounded-full py-3 focus-within:bg-white transition-colors group border border-outline-variant/30">
              <Search className="w-6 h-6 text-outline mr-3" />
              <input 
                className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant font-medium outline-none" 
                placeholder="Where do you want to go?" 
                type="text" 
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button className="px-5 py-3 rounded-full bg-secondary-container text-on-secondary-container text-sm font-bold tracking-wide whitespace-nowrap hover:shadow-md transition-all">Beach</button>
              <button className="px-5 py-3 rounded-full bg-surface text-on-surface-variant text-sm font-bold tracking-wide hover:bg-surface-container-high transition-colors whitespace-nowrap border border-outline-variant/20">Mountain</button>
              <button className="px-5 py-3 rounded-full bg-surface text-on-surface-variant text-sm font-bold tracking-wide hover:bg-surface-container-high transition-colors whitespace-nowrap border border-outline-variant/20">Culture</button>
            </div>
            <button className="bg-on-surface text-surface px-8 py-3 rounded-full font-bold ml-2 hover:bg-on-surface/90 transition-colors">Search</button>
          </div>
        </motion.div>
      </section>

      {/* Trending Section */}
      <motion.section 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mb-32 px-6 max-w-7xl mx-auto"
      >
        <motion.div variants={fadeInUP} className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold font-body">Inspiration</span>
            <h2 className="text-4xl font-extrabold text-on-surface font-display">Trending Destinations</h2>
          </div>
          <button onClick={() => navigate('/destinations')} className="text-primary font-bold flex items-center gap-2 group font-body">
            View all <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Card 1 */}
          <motion.div variants={fadeInUP} onClick={() => navigate('/destinations')} className="group cursor-pointer">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg mb-6">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ha Long Bay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAor8-VL8aSjFgd2aYj_8mO8V-yknKZRYUtrCe25pyZ50niS1U3L0Zx4567DCKL2KpCKV2HsUnAYWdEkbbwhnqzTMc76T221i-sDTDgJ7E6np289LksLcf1m7cY7YxNwoUJIo6kgo8AcTDzefsvFzZRiAAMxI4-h4jqXD8NznZe8aNFqTBSwLZ3tA7XJinmKo4p0eTHKo-jpentIXGDjMQhOPH43TRuDBh-ZP9fGjzeZj42yXcG_5u4wWbQmm-f39XBMRRfk4Gj6zo" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold uppercase text-primary font-body tracking-wider">Nature</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 line-clamp-2 leading-tight font-display">Azure Coastlines of the Mediterranean</h3>
            <p className="text-on-surface-variant mb-4 line-clamp-2 font-body text-[15px]">Experience the hidden coves and sapphire waters of the Amalfi Coast's best kept secrets.</p>
            <span className="text-on-surface font-bold text-sm underline underline-offset-4 decoration-primary-container hover:decoration-primary transition-all font-body">View details</span>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={fadeInUP} onClick={() => navigate('/destinations')} className="group cursor-pointer">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg mb-6">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Marrakesh" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3egscJhpY_1IoeW1Cv9kfFEoejfvUZYHukquUWQhfGIwc5TSYlvnCUSPR194EWjsKIFXEGMzg7p_btVjMdk_MK6Cxbm4OdaYCyMCYhvxpQL2kEyRgHDyykQ88L2ZVSsrd5cyy-QbLLiwwnt8QJ8Y2-zr5yYbR7eZ3xAI1kMOpXCvzDpAd4AxKTqxMA-PaKv0_XlAEfvvQnnolDc2kMPDpOQi7EoLlg03lFc5kWxfVko5mxjCYbaAcdePNGmeQ2qFQfmW-hKxz1eg" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold uppercase text-primary font-body tracking-wider">Culture</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 line-clamp-2 leading-tight font-display">Ancient Markets of the Silk Road</h3>
            <p className="text-on-surface-variant mb-4 line-clamp-2 font-body text-[15px]">A sensory journey through the spices, silks, and stories of historical Uzbekistan.</p>
            <span className="text-on-surface font-bold text-sm underline underline-offset-4 decoration-primary-container hover:decoration-primary transition-all font-body">View details</span>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={fadeInUP} onClick={() => navigate('/destinations')} className="group cursor-pointer">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg mb-6">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Swiss Alps" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDR69MUONwdFrqK0ny1AdsNsgSRtqFHDtdCoAj3Vc0nzZyOkn-RkFhpjCYDKHo7UbcpKFYkDhwSjD0Gx1jUFh4-o_aQVrAHM1hXCIJB93AYctHO2JPYDxrJS3NNaMSU6J78a-wec4_JjPTiB--CDHIrxGfvZQUCGAlSIMkZnLrj6q78MKF2TVlZVXmRxCEDsQdXrXfZbpBXll6tqeeuUuvR3fPWL9szQBHk5DdzCso1RK0lxp1VN41_SJMBRl_6MD9gnTShsswH6B0" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold uppercase text-primary font-body tracking-wider">Nature</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 line-clamp-2 leading-tight font-display">Glacial Peaks and Silent Valleys</h3>
            <p className="text-on-surface-variant mb-4 line-clamp-2 font-body text-[15px]">Escape to the serenity of the high Alps, where time moves as slowly as the glaciers.</p>
            <span className="text-on-surface font-bold text-sm underline underline-offset-4 decoration-primary-container hover:decoration-primary transition-all font-body">View details</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Personalized AI Section */}
      <motion.section 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-24 bg-surface-container-low rounded-[3rem] mb-32 max-w-[calc(100%-3rem)] md:max-w-7xl mx-auto"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeInUP} className="mb-16 text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/30 text-primary rounded-full font-bold text-xs uppercase tracking-widest mb-6 font-body">
              <Sparkles className="w-4 h-4 fill-primary" />
              Smart Assistant
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 font-display">Tailored for your taste</h2>
            <p className="text-lg text-on-surface-variant font-body">Our AI learns from your preferences to curate the perfect escape.</p>
          </motion.div>
          
          <div className="flex flex-col gap-6">
            {/* AI Card 1 */}
            <motion.div variants={fadeInUP} className="glass-card-custom p-8 md:p-10 rounded-[2rem] border border-white/40 flex flex-col md:flex-row items-center justify-between gap-8 hover:-translate-y-1 transition-all shadow-xl shadow-surface-tint/5">
              <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 md:gap-8">
                <div className="w-20 h-20 shrink-0 bg-primary-container rounded-full flex items-center justify-center text-primary">
                  <Brain className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-on-surface mb-2 font-display">The Solo Adventurer's Path</h4>
                  <p className="text-on-surface-variant font-body text-[15px]">Safety-focused, high-engagement solo itineraries in safe urban hubs.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/recommendations')}
                className="luminous-gradient-custom text-on-primary px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/20 whitespace-nowrap font-body hover:scale-105 transition-transform"
              >
                Generate plan
              </button>
            </motion.div>

            {/* AI Card 2 */}
            <motion.div variants={fadeInUP} className="glass-card-custom p-8 md:p-10 rounded-[2rem] border border-white/40 flex flex-col md:flex-row items-center justify-between gap-8 hover:-translate-y-1 transition-all shadow-xl shadow-surface-tint/5">
              <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 md:gap-8">
                <div className="w-20 h-20 shrink-0 bg-secondary-container rounded-full flex items-center justify-center text-secondary">
                  <Leaf className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-on-surface mb-2 font-display">Eco-Conscious Escapes</h4>
                  <p className="text-on-surface-variant font-body text-[15px]">Sustainable stays and low-carbon transport journeys through lush rainforests.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/recommendations')}
                className="luminous-gradient-custom text-on-primary px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/20 whitespace-nowrap font-body hover:scale-105 transition-transform"
              >
                Generate plan
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="mb-32 px-6"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div variants={fadeInUP} className="glass-card-custom p-12 rounded-[2rem] border border-outline-variant/10 text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-5xl md:text-6xl font-extrabold text-primary font-display">10k+</div>
            <div className="text-sm uppercase tracking-widest text-on-surface-variant font-bold font-body">Destinations</div>
          </motion.div>
          <motion.div variants={fadeInUP} className="glass-card-custom p-12 rounded-[2rem] border border-outline-variant/10 text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-5xl md:text-6xl font-extrabold text-primary font-display">50+</div>
            <div className="text-sm uppercase tracking-widest text-on-surface-variant font-bold font-body">Countries</div>
          </motion.div>
          <motion.div variants={fadeInUP} className="glass-card-custom p-12 rounded-[2rem] border border-outline-variant/10 text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-5xl md:text-6xl font-extrabold text-primary font-display">95%</div>
            <div className="text-sm uppercase tracking-widest text-on-surface-variant font-bold font-body">Happy Travelers</div>
          </motion.div>
        </div>
      </motion.section>

      {/* Inspiration Blog Section */}
      <section className="py-24 bg-surface rounded-[3rem] border border-outline-variant/10 shadow-sm px-6 max-w-7xl mx-auto mb-10">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl font-extrabold text-on-surface font-display">Traveler Stories</h2>
          <div className="hidden md:flex gap-4">
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white hover:border-transparent hover:shadow-md transition-all text-on-surface">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white hover:border-transparent hover:shadow-md transition-all text-on-surface">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 cursor-pointer">
          {/* Blog Card 1 */}
          <div onClick={() => navigate('/blog')} className="group relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-lg border border-outline-variant/5">
            <div className="aspect-video overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="vintage camera" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa6Wh3loHh6ULBSzAreuZ9WGBZ6p_y83fPRq9uoqQU24bI5w55JKWJW6FE1Q2LHgnTkByE6c6ZKXSBqoaK96DsdsAvO94A6Dl84W0BHsVq_nYlrsfeSt8J-hVj0zR3-020Cz_Cba6nLofMZDNDW0-t8wq7g8nt3bnsV5X0ezOCyLaSnJnGFATOM3ffXCkuvfIOsLVqxamEDSz9dz7WM-rUAhujaqa5XYIHJHF6-KZ-Yx0USoJCz9mBqnaEwYyTXOsnu0JwqIHNZ8E" />
            </div>
            <div className="p-10 space-y-5">
              <h3 className="text-3xl font-bold text-on-surface leading-tight font-display">The Art of Minimalist Packing: 10 Days in One Bag</h3>
              <p className="text-on-surface-variant font-body text-[15px] leading-relaxed">Learn how to traverse the globe with only the essentials without sacrificing style or comfort.</p>
              <div className="inline-flex items-center gap-2 text-primary font-bold group-hover:text-primary-dim transition-colors font-body mt-2">
                Read more <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Blog Card 2 */}
          <div onClick={() => navigate('/blog')} className="group relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-lg border border-outline-variant/5">
            <div className="aspect-video overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Tokyo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7BNSazCApVSLFmJvSD3YEyPpLyu6GvDLLytRumnQYmm--kNiqYQjFpSylvNAPWbGiEng-tPqji31xUZaaK6woSf_nfU9ZS02rbl-QA5dBJ0LDALLBZfa8YpdsAN7YHvOuWX1Iwm-4mMk483TtY9phH3Cviz-osgJQ_WXPLe1pkS7soxsZvs6VTOx3g3QcBq2YMNrx7x2PkrdTFt97RtAykgFBobSjTrjeWB2f8dyfUAdFVK1wJ67XqCf18ZelPGh1m-kabW1QkoE" />
            </div>
            <div className="p-10 space-y-5">
              <h3 className="text-3xl font-bold text-on-surface leading-tight font-display">Hidden Tokyo: Beyond the Neon and Crowds</h3>
              <p className="text-on-surface-variant font-body text-[15px] leading-relaxed">Discover the quiet temples and artisanal coffee shops tucked away in the world's busiest city.</p>
              <div className="inline-flex items-center gap-2 text-primary font-bold group-hover:text-primary-dim transition-colors font-body mt-2">
                Read more <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
