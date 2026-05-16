import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { getAllLocations, filterLocations, searchLocations } from '../../services/locationService';
import { Loader2, MapPin, Star, Clock, Search, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';

const CITY_IMAGES = {
    'thành phố hồ chí minh': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    'hà nội': 'https://images.unsplash.com/photo-1597076545399-91a3ff0e71b3?w=800',
    'đà lạt': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'hội an': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    'đà nẵng': 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800',
    'thanh hóa': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    default: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
};

function getCityImage(city = '') {
    const key = city.toLowerCase().trim();
    return CITY_IMAGES[key] || CITY_IMAGES.default;
}

const ITEMS_PER_PAGE = 5;

const CITIES = [
    { label: 'Tất cả', value: '' },
    { label: 'Hà Nội', value: 'ha noi' },
    { label: 'Hồ Chí Minh', value: 'ho chi minh' },
    { label: 'Lâm Đồng', value: 'lam dong' },
    { label: 'Hội An', value: 'hoi an' },
    { label: 'Thanh Hóa', value: 'thanh hoa' },
];

const CATEGORIES = [
    { label: 'Tất cả', value: '' },
    { label: 'Ẩm Thực', value: 'Ẩm Thực' },
    { label: 'Văn Hóa', value: 'Văn Hóa' },
    { label: 'Khám Phá', value: 'Khám Phá' },
    { label: 'Thư Giãn', value: 'Thư Giãn' },
    { lable: 'Phiêu Lưu', value: 'Phiêu Lưu' },
];

export default function DestinationsPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();

    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isImmersiveMode, setIsImmersiveMode] = useState(false);

    // Filters
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            let result;

            if (appliedSearch) {
                // Có keyword → dùng searchLocations
                result = await searchLocations(
                    appliedSearch,
                    selectedCity || '',
                    selectedCategory || '',
                    currentPage,
                    ITEMS_PER_PAGE
                );
            } else if (selectedCity || selectedCategory) {
                // Chỉ có filter → dùng filterLocations
                result = await filterLocations({
                    city: selectedCity || undefined,
                    category: selectedCategory || undefined,
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                });
            } else {
                // Không có gì → lấy tất cả
                result = await getAllLocations(currentPage, ITEMS_PER_PAGE);
            }

            setLocations(result?.data || []);
            setTotalItems(result?.total || 0);
        } catch (err) {
            console.error('❌ fetchData error:', err);
            setError(err.message || 'Không thể tải dữ liệu địa điểm.');
            setLocations([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedCity, selectedCategory, appliedSearch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCity, selectedCategory, appliedSearch]);

    const handleSearch = () => {
        setAppliedSearch(searchInput.trim());
    };

    const handleHeartClick = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            if (window.confirm('Vui lòng đăng nhập để lưu vào Wishlist. Bạn có muốn tới trang đăng nhập không?')) {
                navigate('/login');
            }
            return;
        }
        toggleWishlist(item);
    };

    const handleCardClick = (item) => {
        // Ưu tiên dùng ID từ API, fallback sang location_name (dữ liệu cũ)
        const identifier = item.id || item.location_id || encodeURIComponent(item.location_name || item.name);
        navigate('/place/' + identifier);
    };

    const getItemImage = (item) => {
        if (item.images && item.images.length > 0) {
            const first = item.images[0];
            return typeof first === 'string' ? first : first.image || '';
        }
        return getCityImage(item.city || item.region || '');
    };

    const getItemName = (item) => item.location_name || item.name || 'Địa điểm';
    const getItemCity = (item) => item.city || item.region || '';
    const getItemCategory = (item) => {
        if (Array.isArray(item.categories) && item.categories.length > 0) {
            const first = item.categories[0];
            return typeof first === 'string' ? first : first.name || first.category || '';
        }
        return item.category || '';
    };
    const getItemRating = (item) => {
        const r = item.rating || item.overall_rating || 0;
        return typeof r === 'number' ? r.toFixed(1) : (r.split('/')[0].trim());
    };
    const getItemHours = (item) => item.opening_hours || '';

    return (
        <div className="destinations-bg font-body text-on-surface antialiased min-h-screen">
            <style>{`
        .destinations-bg {
            background: radial-gradient(circle at top right, #cad6ff 0%, #f8f5ff 40%),
                radial-gradient(circle at bottom left, #a0f5b4 0%, #f8f5ff 40%);
            background-attachment: fixed;
        }
        .dark .destinations-bg {
            background: radial-gradient(circle at top right, #1a2040 0%, #0f101f 40%),
                radial-gradient(circle at bottom left, #0a1a12 0%, #0f101f 40%);
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
        .dark .glass-card-dest {
            background: rgba(38, 41, 69, 0.75);
            border-color: rgba(70, 74, 107, 0.4);
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .card-animate {
            animation: fadeInUp 0.6s ease-out forwards;
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
                    <div className="glass-card-dest rounded-[2rem] p-6 flex flex-wrap items-end gap-5 shadow-[0_20px_40px_-10px_rgba(39,44,81,0.04)] border border-white/40 dark:border-outline-variant/30">

                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">Tìm kiếm</label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="Nhập tên thành phố, địa điểm..."
                                    className="w-full bg-surface-container-low border-none rounded-2xl py-3 pl-4 pr-10 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none font-body"
                                />
                                <button onClick={handleSearch} className="absolute right-3 text-on-surface-variant hover:text-primary transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* City Filter */}
                        <div className="flex-1 min-w-[160px]">
                            <label className="block font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">Thành phố</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-on-surface appearance-none focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                >
                                    {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex-1 min-w-[160px]">
                            <label className="block font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">Danh mục</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-on-surface appearance-none focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                            </div>
                        </div>

                        {/* Immersive Mode button */}
                        <div className="flex gap-3 shrink-0">
                            <button
                                onClick={() => setIsImmersiveMode(true)}
                                className="h-12 px-6 rounded-full bg-slate-900 text-white flex items-center gap-2 shadow-lg hover:scale-105 transition-transform active:scale-95 font-body font-bold"
                            >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>view_carousel</span>
                                Lướt
                            </button>
                        </div>
                    </div>
                </section>

                {/* Status */}
                {!loading && !error && (
                    <p className="text-sm text-on-surface-variant mb-6 font-medium">
                        {totalItems > 0
                            ? `Hiển thị ${locations.length} / ${totalItems} địa điểm`
                            : 'Không tìm thấy địa điểm nào.'}
                    </p>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-card-dest rounded-3xl overflow-hidden border border-white/40 h-[450px]">
                                <Skeleton className="h-72 w-full rounded-none" />
                                <div className="p-7 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-7 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                        <Skeleton className="h-8 w-12 rounded-full" />
                                    </div>
                                    <div className="flex justify-between items-center pt-4">
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-20" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <Skeleton className="h-10 w-28 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="text-5xl">😕</div>
                        <p className="text-on-surface-variant font-medium">{error}</p>
                        <button onClick={fetchData} className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-colors">
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Destination Grid */}
                {!loading && !error && locations.length > 0 && (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {locations.map((item, index) => {
                            const isLarge = index === 3;
                            const imageSrc = getItemImage(item);
                            const rating = getItemRating(item);

                            return (
                                <div
                                    key={item.id || item.location_id || index}
                                    onClick={() => handleCardClick(item)}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    className={`group relative glass-card-dest rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-white/40 shadow-xl shadow-surface-tint/5 card-animate opacity-0 ${isLarge ? 'lg:col-span-2' : 'lg:col-span-1'}`}
                                >
                                    <div className="h-72 overflow-hidden relative">
                                        <img alt={getItemName(item)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={imageSrc} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                            {getItemCity(item) && (
                                                <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-primary text-[10px] font-bold tracking-widest uppercase shadow-md border border-white/50">
                                                    {getItemCity(item)}
                                                </span>
                                            )}
                                            {getItemCategory(item) && (
                                                <span className="px-3 py-1.5 rounded-full bg-primary text-white text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-primary/20">
                                                    {getItemCategory(item)}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => handleHeartClick(e, item)}
                                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md text-primary flex items-center justify-center hover:bg-white hover:text-red-500 transition-all shadow-lg z-10 border border-white/50"
                                        >
                                            <span className={`material-symbols-outlined ${isInWishlist(item) ? 'text-red-500' : ''}`} style={{ fontVariationSettings: isInWishlist(item) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                                        </button>

                                        {item.rating > 4.5 && (
                                            <div className="absolute bottom-4 left-4 px-3 py-1 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-tighter rounded-md flex items-center gap-1 shadow-xl">
                                                <TrendingUp className="w-3 h-3" /> Xu hướng
                                            </div>
                                        )}
                                    </div>

                                    <div className={`p-7 ${isLarge ? 'flex flex-col md:flex-row md:items-center justify-between gap-6' : ''}`}>
                                        <div className={isLarge ? 'max-w-xl' : ''}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className={`font-headline font-bold text-on-surface mb-1 line-clamp-1 group-hover:text-primary transition-colors ${isLarge ? 'text-3xl tracking-tight' : 'text-xl'}`}>{getItemName(item)}</h3>
                                                    <div className="flex items-center gap-1 text-on-surface-variant text-sm font-body font-medium">
                                                        <MapPin className="w-3.5 h-3.5 text-primary/70" />
                                                        {getItemCity(item) || 'Việt Nam'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-secondary-container/30 border border-secondary-container/50 px-3 py-1.5 rounded-2xl text-on-secondary-container font-black text-sm h-fit shrink-0 ml-2">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    {rating}
                                                </div>
                                            </div>
                                            {isLarge && (
                                                <p className="text-on-surface-variant text-base leading-relaxed line-clamp-2 mt-2 font-body opacity-80">{item.description}</p>
                                            )}
                                        </div>

                                        <div className={`flex ${isLarge ? 'flex-col items-end gap-4 min-w-[180px]' : 'items-center justify-between mt-6 pt-6 border-t border-outline-variant/10'}`}>
                                            {!isLarge && getItemHours(item) && (
                                                <div>
                                                    <span className="block font-label text-[9px] font-bold text-outline tracking-widest uppercase mb-1 flex items-center gap-1 opacity-70">
                                                        <Clock className="w-3 h-3" /> GIỜ MỞ CỬA
                                                    </span>
                                                    <span className="text-xs font-black text-on-surface truncate max-w-[140px] inline-block">
                                                        {getItemHours(item).split(',')[0]}
                                                    </span>
                                                </div>
                                            )}
                                            <button className={isLarge
                                                ? 'w-full md:w-auto px-8 py-4 rounded-2xl bg-primary text-white font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all text-sm uppercase tracking-widest'
                                                : 'px-5 py-2.5 rounded-2xl bg-surface-container-high text-on-surface font-bold hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 transition-all text-xs flex items-center gap-2'
                                            }>
                                                {t('destinations.card.view_details')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-14 mb-6 font-body">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-6 py-3 rounded-full bg-surface-container backdrop-blur-md shadow-sm border border-outline-variant/30">
                            <span className="text-sm font-bold text-on-surface">Trang {currentPage} / {totalPages}</span>
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* CTA Section */}
                <section className="mt-16">
                    <div className="relative bg-gradient-to-br from-primary to-primary-container rounded-[3rem] p-12 md:p-20 overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-1/4 backdrop-blur-3xl"></div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-primary mb-6 leading-tight">
                                {t('destinations.cta.title')}
                            </h2>
                            <p className="text-on-primary/90 font-body text-lg mb-10 leading-relaxed font-medium">
                                {t('destinations.cta.desc')}
                            </p>
                            <div className="flex flex-col md:flex-row gap-4 font-body">
                                <input className="flex-1 bg-white/20 border border-white/40 rounded-full px-6 py-4 text-white placeholder:text-white/80 focus:ring-2 focus:ring-white/50 outline-none backdrop-blur-md shadow-inner" placeholder={t('destinations.cta.placeholder')} type="email" />
                                <button className="bg-white text-primary font-bold px-10 py-4 rounded-full hover:bg-on-primary transition-all shadow-xl active:scale-95 hover:-translate-y-1">{t('destinations.cta.button')}</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* IMMERSIVE MODE */}
            {isImmersiveMode && (
                <div className="fixed inset-0 z-[9999] bg-black text-white h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
                    <button
                        onClick={() => setIsImmersiveMode(false)}
                        className="fixed top-8 left-6 z-[10000] w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors border border-white/20"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>

                    {locations.map((item, index) => {
                        const imageSrc = getItemImage(item);
                        return (
                            <div key={`tiktok-${index}`} className="relative h-screen w-full snap-start snap-always shrink-0 bg-black flex items-center justify-center overflow-hidden border-b border-black">
                                <div className="absolute inset-0 hidden md:block">
                                    <img src={imageSrc} alt="" className="w-full h-full object-cover opacity-50 blur-[50px] scale-125" />
                                </div>
                                <div className="relative w-full md:max-w-md lg:max-w-[480px] h-full shadow-[0_0_80px_rgba(0,0,0,1)] bg-zinc-950 flex flex-col justify-end border-x border-white/10 z-10">
                                    <img src={imageSrc} alt={getItemName(item)} className="absolute inset-0 w-full h-full object-cover rounded-sm" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/95 pointer-events-none"></div>
                                    <div className="absolute bottom-8 left-6 right-20 pb-4 pointer-events-auto z-20">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase border border-white/30 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                {getItemCity(item)}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-2 text-white drop-shadow-2xl">{getItemName(item)}</h2>
                                        <p className="text-white/90 font-body text-sm md:text-base line-clamp-3 mb-6 drop-shadow-lg font-medium">
                                            {item.description}
                                        </p>
                                        <button
                                            onClick={() => { setIsImmersiveMode(false); handleCardClick(item); }}
                                            className="bg-primary hover:bg-primary-dim text-white font-bold px-8 py-3.5 rounded-full flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 border border-white/20 shadow-xl"
                                        >
                                            Khám Phá <span className="material-symbols-outlined text-[18px]">explore</span>
                                        </button>
                                    </div>
                                    <div className="absolute bottom-16 right-4 flex flex-col items-center gap-7 pointer-events-auto">
                                        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={(e) => handleHeartClick(e, item)}>
                                            <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-red-500/20 transition-all active:scale-90">
                                                <span className={`material-symbols-outlined text-[28px] ${isInWishlist(item) ? 'text-red-500' : 'text-white'}`} style={{ fontVariationSettings: isInWishlist(item) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                                            </button>
                                            <span className="text-[11px] font-bold text-white drop-shadow-md">{isInWishlist(item) ? 'Đã lưu' : 'Lưu'}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 cursor-pointer">
                                            <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-green-500/20 transition-all active:scale-90">
                                                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                                            </button>
                                            <span className="text-[11px] font-bold text-white drop-shadow-md">{getItemRating(item)}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 cursor-pointer">
                                            <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/40 transition-all active:scale-90">
                                                <span className="material-symbols-outlined text-[28px] text-white">share</span>
                                            </button>
                                            <span className="text-[11px] font-bold text-white drop-shadow-md">Share</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
