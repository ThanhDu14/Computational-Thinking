import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DestinationsPage() {
  const navigate = useNavigate();

  return (
    <div className="destinations-bg font-body text-on-surface antialiased min-h-screen">
      <style>{`
        .destinations-bg {
            background: radial-gradient(circle at top right, #cad6ff 0%, #f8f5ff 40%),
                radial-gradient(circle at bottom left, #a0f5b4 0%, #f8f5ff 40%);
            background-attachment: fixed;
        }

        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }

        .glass-card-dest {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
        }
      `}</style>
      
      <main className="pt-20 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-16">
            <span className="font-label text-xs font-bold tracking-[0.1em] text-primary uppercase mb-4 block">Global
                Discovery</span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface tracking-tighter mb-6">
                Where to <span className="bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">next?</span>
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed font-body">
                Explore our curated selection of breathtaking landscapes, cultural hubs, and hidden gems designed for
                the weightless voyage.
            </p>
        </header>

        {/* Filter Bar */}
        <section className="mb-12">
            <div className="glass-card-dest rounded-[2rem] p-6 flex flex-wrap items-center gap-6 shadow-[0_20px_40px_-10px_rgba(39,44,81,0.04)] border border-white/40">
                {/* Price Range */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">Price Range</label>
                    <div className="relative">
                        <select className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-on-surface appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-body">
                            <option>Any Budget</option>
                            <option>$0 - $1,500</option>
                            <option>$1,500 - $4,000</option>
                            <option>$4,000+</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                    </div>
                </div>
                {/* Weather */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">Weather</label>
                    <div className="flex gap-2 font-body">
                        <button className="px-5 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant text-sm font-medium hover:bg-white transition-all shadow-sm">Sunny</button>
                        <button className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium shadow-md">Snowy</button>
                        <button className="px-5 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant text-sm font-medium hover:bg-white transition-all shadow-sm">Tropical</button>
                    </div>
                </div>
                {/* Travel Type */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">Travel Type</label>
                    <div className="relative">
                        <select className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-on-surface appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-body">
                            <option>Adventure</option>
                            <option>Relaxation</option>
                            <option>Culture</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                    </div>
                </div>
                <button className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95 shrink-0 mt-6 md:mt-0">
                    <span className="material-symbols-outlined">tune</span>
                </button>
            </div>
        </section>

        {/* Destination Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Santorini */}
            <div onClick={() => navigate('/place/1')} className="group relative glass-card-dest rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-white/40 shadow-xl shadow-surface-tint/5">
                <div className="h-80 overflow-hidden relative">
                    <img alt="Santorini, Greece" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgZ_t3tf6zy0jC63e-Ac6zY1jBNgL0ZDnxMLbIVfIKmP7NMfgjCShuUa2fkRnUTxKsjO9Pa0pMfTqn_TjOLvBDcWsO6qM3w3ceAUo1sTDtkyx-n4pI38E_b05f3B7AOUDnYxrLG1Ywe8kctRPnkwKs6ZCYlGoXypTaiYPRGhSKNi2glWgDaRdkswfO7q8Doc4J7bULmB9U5o-DZkRhroKJku496ua3MxWDj63n0ZY4aapWy79W9MXCJenHRZOwZ9jcuZBV9G5vOvQ" />
                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-primary text-[10px] font-bold tracking-widest uppercase shadow-sm">
                        Mediterranean
                    </div>
                    <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md text-primary flex items-center justify-center hover:bg-white/80 transition-colors shadow-sm">
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>favorite</span>
                    </button>
                </div>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-headline text-2xl font-bold text-on-surface mb-1 shadow-none">Santorini, Greece</h3>
                            <div className="flex items-center gap-1 text-on-surface-variant text-[15px] font-body">
                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                Cyclades Islands
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-secondary-container/50 px-3 py-1 rounded-full text-on-secondary-container font-bold text-sm">
                            <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                            4.9
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-8">
                        <div>
                            <span className="block font-label text-[10px] font-bold text-outline tracking-widest uppercase mb-1">Starting from</span>
                            <span className="text-2xl font-bold text-on-surface">$2,400</span>
                        </div>
                        <button className="px-6 py-3 rounded-full bg-surface-container-highest text-on-primary-container font-semibold hover:bg-primary hover:text-white transition-all scale-100 active:scale-95 font-body">
                            View details
                        </button>
                    </div>
                </div>
            </div>

            {/* Kyoto */}
            <div onClick={() => navigate('/place/2')} className="group relative glass-card-dest rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-white/40 shadow-xl shadow-surface-tint/5">
                <div className="h-80 overflow-hidden relative">
                    <img alt="Kyoto, Japan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQKx8eONXNwM6IK4tvkzztBxG6MmUCGILC6jeJc8iX0V9gZBZ1evdn_eUXErsBmbxUVif9iSHvXwCJXRgGmFNThMEsuZKsH72UyZgTZRFcwPOZRMlrkNXMfG7se-2oQ1KlsiEyisWEhjKNq8Wl3faH-OAAeAFog_vdhhtYT57cuhOcv4MQp3laYt3FEVst71vFcBzY_fErWihiTSYbD0FzDcbgBWgApAT7DtOGFVIOVlVAQTF3WDOYJ28jsmUdH4aEOA4Z5EkkNDU" />
                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-primary text-[10px] font-bold tracking-widest uppercase shadow-sm">
                        Cultural Heritage
                    </div>
                    <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md text-primary flex items-center justify-center hover:bg-white/80 transition-colors shadow-sm">
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>favorite</span>
                    </button>
                </div>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-headline text-2xl font-bold text-on-surface mb-1">Kyoto, Japan</h3>
                            <div className="flex items-center gap-1 text-on-surface-variant text-[15px] font-body">
                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                Honshu Island
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-secondary-container/50 px-3 py-1 rounded-full text-on-secondary-container font-bold text-sm">
                            <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                            4.8
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-8">
                        <div>
                            <span className="block font-label text-[10px] font-bold text-outline tracking-widest uppercase mb-1">Starting from</span>
                            <span className="text-2xl font-bold text-on-surface">$1,950</span>
                        </div>
                        <button className="px-6 py-3 rounded-full bg-surface-container-highest text-on-primary-container font-semibold hover:bg-primary hover:text-white transition-all scale-100 active:scale-95 font-body">
                            View details
                        </button>
                    </div>
                </div>
            </div>

            {/* Swiss Alps */}
            <div onClick={() => navigate('/place/3')} className="group relative glass-card-dest rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 lg:col-span-1 cursor-pointer border border-white/40 shadow-xl shadow-surface-tint/5">
                <div className="h-80 overflow-hidden relative">
                    <img alt="Swiss Alps" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUDZV821hGIxE1HpskeUt1XWMVFhJFQy6biTuMPpwPBzL6DVPl1oDB_TyanHtMU82-hT3ODMom5uu0K500k_i2SpCVNWlLJ9KvNvIQClzn20ajS9e0C6y5D8DH9mLPYo7s39xRal64L3GLuvl50mXv0abnHVELLIMq3ParicUHJT8AJQb79Q7dJql6Ub3KHYCgzWsMj2gm6nHYWwav-RTW9ALJbUocoAB4rFOQyT8Eg4jK--_9p_iNK6HyXNFhofXDKxfgZiyOLLU" />
                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-primary text-[10px] font-bold tracking-widest uppercase shadow-sm">
                        Adventure
                    </div>
                    <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md text-primary flex items-center justify-center hover:bg-white/80 transition-colors shadow-sm">
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>favorite</span>
                    </button>
                </div>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-headline text-2xl font-bold text-on-surface mb-1">Swiss Alps, Switzerland</h3>
                            <div className="flex items-center gap-1 text-on-surface-variant text-[15px] font-body">
                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                Central Europe
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-secondary-container/50 px-3 py-1 rounded-full text-on-secondary-container font-bold text-sm">
                            <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                            5.0
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-8">
                        <div>
                            <span className="block font-label text-[10px] font-bold text-outline tracking-widest uppercase mb-1">Starting from</span>
                            <span className="text-2xl font-bold text-on-surface">$3,100</span>
                        </div>
                        <button className="px-6 py-3 rounded-full bg-surface-container-highest text-on-primary-container font-semibold hover:bg-primary hover:text-white transition-all scale-100 active:scale-95 font-body">
                            View details
                        </button>
                    </div>
                </div>
            </div>

            {/* Amalfi Coast (Asymmetric larger card) */}
            <div onClick={() => navigate('/place/4')} className="group relative glass-card-dest rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 lg:col-span-2 cursor-pointer border border-white/40 shadow-xl shadow-surface-tint/5">
                <div className="h-80 overflow-hidden relative">
                    <img alt="Amalfi Coast, Italy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_JU8n0sf3glqE4hrB2QOJPb1cPkpgHCDiCj-BcjzEFXeUEMCJQj3_hypuFlrKCcMJ4mDryY7T7DRVN8kb3NOzxgwvisrkn3hxQZryftK-g0vdRhWBT5bz5B976H58M4UCsfsBH38dNqVwgGsNIgZf2WZwBjer-RdG70emI0Tt4CMFiO8V0SUSmxHgNWLcR9VonPQKCHdRJQYTZpKDfV1QbUamXxHSqK_qXhJTDCQ8y48HuHH4Edrt163eebu8bCQiFbQKRA1z4uA" />
                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-primary text-[10px] font-bold tracking-widest uppercase shadow-sm">
                        Coastal Luxury
                    </div>
                </div>
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <h3 className="font-headline text-3xl font-extrabold text-on-surface mb-2 tracking-tight">Amalfi Coast, Italy</h3>
                        <p className="text-on-surface-variant max-w-md font-body text-[15px] leading-relaxed">Experience the dramatic cliffs and turquoise waters of Italy's most iconic coastline. Perfect for slow travel and high-end gastronomy.</p>
                    </div>
                    <div className="flex flex-col items-end gap-4 min-w-[150px]">
                        <div className="text-right">
                            <span className="block font-label text-[10px] font-bold text-outline tracking-widest uppercase mb-1">Best Value</span>
                            <span className="text-4xl font-extrabold text-on-surface font-display">$4,200</span>
                        </div>
                        <button className="w-full md:w-auto px-8 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold shadow-xl hover:-translate-y-1 transition-transform font-body">
                            Check Availability
                        </button>
                    </div>
                </div>
            </div>

            {/* Bali */}
            <div onClick={() => navigate('/place/5')} className="group relative glass-card-dest rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-white/40 shadow-xl shadow-surface-tint/5">
                <div className="h-80 overflow-hidden relative">
                    <img alt="Bali, Indonesia" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFLn5ciqg1A1bmb1n0TgNfZJiUlzcU3CNcLxV8ItRRS4murdGXQSIdj0w0n93DygtEiogeL5CTqueC6HQIz1wXJBvzDjckgNhKSVCuO8YXDjkj_f-7UYQD7t8Nzs49lC-rkAGOGN6s77EzaoHnKoml1HGrJalD0rHHLIE2QfSMQg3khPL4jhGgtNBE8VBdhqcdHtxVk7JormMgum58B6wv17cw2mZnYf7CgdFMr9F9jRnPSbYTu3Vb8HMfXwnjJEYD_EAzC86RvBE" />
                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-primary text-[10px] font-bold tracking-widest uppercase shadow-sm">
                        Relaxation
                    </div>
                    <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md text-primary flex items-center justify-center hover:bg-white/80 transition-colors shadow-sm">
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>favorite</span>
                    </button>
                </div>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-headline text-2xl font-bold text-on-surface mb-1">Ubud, Bali</h3>
                            <div className="flex items-center gap-1 text-on-surface-variant text-[15px] font-body">
                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                Indonesia
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-secondary-container/50 px-3 py-1 rounded-full text-on-secondary-container font-bold text-sm">
                            <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                            4.7
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-8">
                        <div>
                            <span className="block font-label text-[10px] font-bold text-outline tracking-widest uppercase mb-1">Starting from</span>
                            <span className="text-2xl font-bold text-on-surface">$1,200</span>
                        </div>
                        <button className="px-6 py-3 rounded-full bg-surface-container-highest text-on-primary-container font-semibold hover:bg-primary hover:text-white transition-all scale-100 active:scale-95 font-body">
                            View details
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* Newsletter / CTA Asymmetric Section */}
        <section className="mt-32">
            <div className="relative bg-gradient-to-br from-primary to-primary-container rounded-[3rem] p-12 md:p-20 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-1/4 backdrop-blur-3xl"></div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-primary mb-6 leading-tight">
                        Join the weightless voyage.</h2>
                    <p className="text-on-primary/90 font-body text-lg mb-10 leading-relaxed font-medium">
                        Subscribe to receive exclusive itineraries and early access to ethereal destinations curated for our community.</p>
                    <div className="flex flex-col md:flex-row gap-4 font-body">
                        <input className="flex-1 bg-white/20 border border-white/40 rounded-full px-6 py-4 text-white placeholder:text-white/80 focus:ring-2 focus:ring-white/50 outline-none backdrop-blur-md shadow-inner" placeholder="Enter your email" type="email" />
                        <button className="bg-white text-primary font-bold px-10 py-4 rounded-full hover:bg-on-primary transition-all shadow-xl active:scale-95 hover:-translate-y-1">Subscribe</button>
                    </div>
                </div>
            </div>
        </section>
      </main>
      
      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40">
          <span className="material-symbols-outlined text-3xl">chat_bubble</span>
      </button>
    </div>
  );
}
