import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import datadalat from '../../data/data_da_lat_final.json';
import dataha from '../../data/data_HA_final.json';
import datathanhhoa from '../../data/data_thanh_hoa_final.json';

export default function DestinationsPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Combine datasets
    const allData = useMemo(() => {
        const dalat = datadalat.map(item => ({ ...item, region: 'Da Lat' }));
        const ha = dataha.map(item => ({ ...item, region: 'Hoi An' }));
        const th = datathanhhoa.map(item => ({ ...item, region: 'Thanh Hoa' }));
        return [...dalat, ...ha, ...th];
    }, []);

    const [selectedRegion, setSelectedRegion] = useState('All');

    const filteredData = useMemo(() => {
        if (selectedRegion === 'All') return allData;
        return allData.filter(item => item.region === selectedRegion);
    }, [allData, selectedRegion]);

    // Pagination setups
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 300, behavior: 'smooth' });
        }
    };

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
                    <span className="font-label text-xs font-bold tracking-[0.1em] text-primary uppercase mb-4 block">{t('destinations.header.label')}</span>
                    <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface tracking-tighter mb-6">
                        {t('destinations.header.title_1')}<span className="bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">{t('destinations.header.title_2')}</span>
                    </h1>
                    <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed font-body">
                        {t('destinations.header.desc')}
                    </p>
                </header>

                {/* Filter Bar */}
                <section className="mb-12">
                    <div className="glass-card-dest rounded-[2rem] p-6 flex flex-wrap items-center gap-6 shadow-[0_20px_40px_-10px_rgba(39,44,81,0.04)] border border-white/40">
                        {/* Price Range */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">{t('destinations.filter.price_range')}</label>
                            <div className="relative">
                                <select className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-on-surface appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-body">
                                    <option>{t('destinations.filter.price_free')}</option>
                                    <option>{t('destinations.filter.price_paid')}</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                            </div>
                        </div>
                        {/* Weather */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">{t('destinations.filter.weather')}</label>
                            <div className="flex gap-2 font-body">
                                <button className="px-5 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant text-sm font-medium hover:bg-white transition-all shadow-sm">{t('destinations.filter.weather_sunny')}</button>
                                <button className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium shadow-md">{t('destinations.filter.weather_moderate')}</button>
                                <button className="px-5 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant text-sm font-medium hover:bg-white transition-all shadow-sm">{t('destinations.filter.weather_tropical')}</button>
                            </div>
                        </div>
                        {/* Travel Type */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">{t('destinations.filter.region')}</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-on-surface appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-body"
                                    value={selectedRegion}
                                    onChange={(e) => {
                                        setSelectedRegion(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="All">{t('destinations.filter.region_all')}</option>
                                    <option value="Da Lat">Da Lat</option>
                                    <option value="Hoi An">Hoi An</option>
                                    <option value="Thanh Hoa">Thanh Hoa</option>
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
                    {currentItems.map((item, index) => {
                        const isLarge = index === 3;
                        const extractedRating = item.overall_rating ? item.overall_rating.split('/')[0].trim() : '4.5';
                        const imageSrc = item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/600x400?text=No+Image';

                        return (
                            <div key={`dest-${currentPage}-${index}`} onClick={() => navigate('/place/' + encodeURIComponent(item.location_name))} className={`group relative glass-card-dest rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-white/40 shadow-xl shadow-surface-tint/5 ${isLarge ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
                                <div className="h-80 overflow-hidden relative">
                                    <img alt={item.location_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={imageSrc} />
                                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-primary text-[10px] font-bold tracking-widest uppercase shadow-sm">
                                        {item.region}
                                    </div>
                                    <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md text-primary flex items-center justify-center hover:bg-white/80 transition-colors shadow-sm">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                                    </button>
                                </div>
                                <div className={`p-8 ${isLarge ? 'flex flex-col md:flex-row md:items-center justify-between gap-6' : ''}`}>
                                    <div className={isLarge ? 'max-w-xl' : ''}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className={`font-headline font-bold text-on-surface mb-1 shadow-none line-clamp-1 ${isLarge ? 'text-3xl tracking-tight' : 'text-2xl'}`}>{item.location_name}</h3>
                                                <div className="flex items-center gap-1 text-on-surface-variant text-[15px] font-body">
                                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                    {item.region}
                                                </div>
                                            </div>
                                            {!isLarge && (
                                                <div className="flex items-center gap-1 bg-secondary-container/50 px-3 py-1 rounded-full text-on-secondary-container font-bold text-sm h-fit shrink-0">
                                                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    {extractedRating}
                                                </div>
                                            )}
                                        </div>
                                        {isLarge && (
                                            <p className="text-on-surface-variant max-w-md font-body text-[15px] leading-relaxed line-clamp-2">{item.description}</p>
                                        )}
                                    </div>
                                    <div className={`flex ${isLarge ? 'flex-col items-end gap-4 min-w-[150px]' : 'items-center justify-between mt-8'}`}>
                                        {isLarge ? (
                                            <div className="text-right flex flex-col items-end">
                                                <div className="flex items-center gap-1 bg-secondary-container/50 px-3 py-1 rounded-full text-on-secondary-container font-bold text-sm mb-2">
                                                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    {extractedRating}
                                                </div>
                                                <span className="block font-label text-[10px] font-bold text-outline tracking-widest uppercase mb-1">{t('destinations.card.price')}</span>
                                                <span className="text-2xl font-extrabold text-primary font-display uppercase tracking-widest">{t('destinations.card.free')}</span>
                                            </div>
                                        ) : (
                                            <div>
                                                <span className="block font-label text-[10px] font-bold text-outline tracking-widest uppercase mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> {t('destinations.card.opening')}</span>
                                                <span className="text-sm font-bold text-on-surface truncate max-w-[120px] inline-block" title={item.opening_hours || t('destinations.card.varies')}>
                                                    {item.opening_hours ? item.opening_hours.split(',')[0] : t('destinations.card.varies')}
                                                </span>
                                            </div>
                                        )}
                                        <button className={isLarge ? "w-full md:w-auto px-8 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold shadow-xl hover:-translate-y-1 transition-transform font-body" : "px-6 py-3 rounded-full bg-surface-container-highest text-on-primary-container font-semibold hover:bg-primary hover:text-white transition-all scale-100 active:scale-95 font-body flex items-center gap-2"}>
                                            {t('destinations.card.view_details')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-16 mb-8 font-body">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary backdrop-blur-sm shadow-sm"
                        >
                            <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'wght' 600" }}>chevron_left</span>
                        </button>

                        <div className="px-6 py-3 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-white/40">
                            <span className="text-sm font-bold text-on-surface">{t('destinations.pagination.page', { current: currentPage, total: totalPages })}</span>
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary backdrop-blur-sm shadow-sm"
                        >
                            <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'wght' 600" }}>chevron_right</span>
                        </button>
                    </div>
                )}

                {/* Newsletter / CTA Asymmetric Section */}
                <section className="mt-16">
                    <div className="relative bg-gradient-to-br from-primary to-primary-container rounded-[3rem] p-12 md:p-20 overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-1/4 backdrop-blur-3xl"></div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-primary mb-6 leading-tight">
                                {t('destinations.cta.title')}</h2>
                            <p className="text-on-primary/90 font-body text-lg mb-10 leading-relaxed font-medium">
                                {t('destinations.cta.desc')}</p>
                            <div className="flex flex-col md:flex-row gap-4 font-body">
                                <input className="flex-1 bg-white/20 border border-white/40 rounded-full px-6 py-4 text-white placeholder:text-white/80 focus:ring-2 focus:ring-white/50 outline-none backdrop-blur-md shadow-inner" placeholder={t('destinations.cta.placeholder')} type="email" />
                                <button className="bg-white text-primary font-bold px-10 py-4 rounded-full hover:bg-on-primary transition-all shadow-xl active:scale-95 hover:-translate-y-1">{t('destinations.cta.button')}</button>
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
