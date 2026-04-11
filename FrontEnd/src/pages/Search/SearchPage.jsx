import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import PlaceCard from '../../components/places/PlaceCard';
import { useTranslation } from 'react-i18next';

import datadalat from '../../data/data_da_lat_final.json';
import dataha from '../../data/data_HA_final.json';
import datathanhhoa from '../../data/data_thanh_hoa_final.json';

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Combine datasets
  const allData = useMemo(() => {
      const dalat = datadalat.map(item => ({ ...item, region: 'Da Lat' }));
      const ha = dataha.map(item => ({ ...item, region: 'Hoi An' }));
      const th = datathanhhoa.map(item => ({ ...item, region: 'Thanh Hoa' }));
      return [...dalat, ...ha, ...th];
  }, []);

  // Update query state if URL parameter changes (e.g. searching from Home Page again)
  useEffect(() => {
      const q = searchParams.get('q') || '';
      setQuery(q);
      setActiveQuery(q);
  }, [searchParams]);

  const handleSearch = useCallback(() => {
      setActiveQuery(query);
      setCurrentPage(1);
      setSearchParams(query ? { q: query } : {});
  }, [query, setSearchParams]);

  const handleTagClick = useCallback((tag) => {
      setQuery(tag);
      setActiveQuery(tag);
      setCurrentPage(1);
      setSearchParams({ q: tag });
  }, [setSearchParams]);

  const searchResults = useMemo(() => {      
      if (!activeQuery.trim()) return [];
      const lowerQuery = activeQuery.toLowerCase();
      // Filter dataset
      const filtered = allData.filter(item => {
          return (item.location_name && item.location_name.toLowerCase().includes(lowerQuery)) ||
                 (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
                 (item.region && item.region.toLowerCase().includes(lowerQuery));
      });
      // Map to PlaceCard format
      return filtered.map((item, index) => {
          const extractedRating = item.overall_rating ? parseFloat(item.overall_rating.split('/')[0].trim()) : 4.5;
          const imageSrc = item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/600x400?text=No+Image';
          return {
              id: `search-${index}`,
              title: item.location_name, // fallback internally based on what PlaceCard accepts. usually name or title
              name: item.location_name,  
              location: item.region,
              price: 0, 
              rating: extractedRating,
              image: imageSrc,
              originalItem: item // passing if necessary later
          };
      });
  }, [allData, activeQuery]);

  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return searchResults.slice(start, start + ITEMS_PER_PAGE);
  }, [searchResults, currentPage, ITEMS_PER_PAGE]);

  return (
    <div className="w-full pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Search hero area */}
      <div className="bg-gradient-to-br from-primary to-primary-container rounded-[3rem] p-10 md:p-20 mb-16 text-center text-white relative overflow-hidden shadow-xl shadow-primary/20">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200')] bg-cover mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-primary/30 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-10 tracking-tighter drop-shadow-md">{t('search_page.hero_title')}</h1>
          
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-grow bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl flex items-center px-6 py-4 shadow-lg border border-white/40 group focus-within:ring-2 focus-within:ring-white">
              <Search className="w-6 h-6 text-on-surface-variant mr-3 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('search_page.search_placeholder')} 
                className="w-full bg-transparent border-none outline-none text-on-surface text-lg placeholder-on-surface-variant/70 font-body font-medium"
              />
            </div>
            <Button onClick={handleSearch} variant="primary" className="py-4 px-10 text-lg shadow-lg hover:shadow-xl bg-white text-primary hover:text-primary-dim border-none">
              {t('search_page.search_btn')}
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 py-2 font-body text-[15px] font-semibold text-primary-container">
            <span className="text-white/80">{t('search_page.popular')}</span>
            <span onClick={() => handleTagClick('Da Lat')} className="cursor-pointer hover:text-white transition-colors">{t('search_page.tag_dalat', 'Đà Lạt')}</span>
            <span onClick={() => handleTagClick('Hoi An')} className="cursor-pointer hover:text-white transition-colors">{t('search_page.tag_hoian', 'Hội An')}</span>
            <span onClick={() => handleTagClick('Thanh Hoa')} className="cursor-pointer hover:text-white transition-colors">{t('search_page.tag_thanhhoa', 'Thanh Hóa')}</span>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-outline-variant/20 pb-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-on-surface mb-1">{t('search_page.results_title')}</h2>
            {activeQuery && <p className="text-on-surface-variant font-body">{t('search_page.results_for', 'Kết quả cho: ')}<span className="font-bold text-primary">"{activeQuery}"</span></p>}
          </div>
          <span className="text-on-surface-variant font-body font-bold text-sm uppercase tracking-wider bg-surface-container-low px-4 py-1.5 rounded-full">{searchResults.length} {t('search_page.places_count')}</span>
        </div>
        
        {searchResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedResults.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(p - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className="w-11 h-11 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container hover:border-transparent transition-all disabled:opacity-30 disabled:cursor-not-allowed text-on-surface"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-11 h-11 rounded-full font-bold font-body text-sm transition-all ${
                      currentPage === page
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/30'
                        : 'border border-outline-variant text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => { setCurrentPage(p => Math.min(p + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                  className="w-11 h-11 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container hover:border-transparent transition-all disabled:opacity-30 disabled:cursor-not-allowed text-on-surface"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full py-20 text-center flex flex-col items-center">
             <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-outline" />
             </div>
             <h3 className="text-2xl font-bold font-display text-on-surface mb-2">{t('search_page.no_results_title', 'Không tìm thấy kết quả')}</h3>
             <p className="text-on-surface-variant font-body">{t('search_page.no_results_desc', 'Thử nhập từ khóa khác hoặc tham khảo các thẻ gợi ý phía trên.')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
