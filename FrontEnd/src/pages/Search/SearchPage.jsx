import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Button from '../../components/common/Button';
import PlaceCard from '../../components/places/PlaceCard';
import { useTranslation } from 'react-i18next';

export default function SearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  
  const searchResults = [
    { id: '10', name: 'Alps Ski Resort', location: 'Switzerland', price: 300, rating: 4.8, image: 'https://images.unsplash.com/photo-1548682181-e23f10f44358?auto=format&fit=crop&q=80&w=800' },
    { id: '11', name: 'Ha Long Bay', location: 'Quang Ninh, Vietnam', price: 90, rating: 4.7, image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800' },
    { id: '12', name: 'Bali Beaches', location: 'Bali, Indonesia', price: 110, rating: 4.6, image: 'https://images.unsplash.com/photo-1537996192700-11b33346d048?auto=format&fit=crop&q=80&w=800' },
  ];

  return (
    <div className="w-full">
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
                placeholder={t('search_page.search_placeholder')} 
                className="w-full bg-transparent border-none outline-none text-on-surface text-lg placeholder-on-surface-variant/70 font-body font-medium"
              />
            </div>
            <Button variant="primary" className="py-4 px-10 text-lg shadow-lg hover:shadow-xl bg-white text-primary hover:text-primary-dim">
              {t('search_page.search_btn')}
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 py-2 font-body text-[15px] font-semibold text-primary-container">
            <span className="text-white/80">{t('search_page.popular')}</span>
            <span className="cursor-pointer hover:text-white transition-colors">Santorini</span>
            <span className="cursor-pointer hover:text-white transition-colors">Kyoto</span>
            <span className="cursor-pointer hover:text-white transition-colors">Bali</span>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex justify-between items-end mb-8 border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface mb-1">{t('search_page.results_title')}</h2>
        </div>
        <span className="text-on-surface-variant font-body font-bold text-sm uppercase tracking-wider bg-surface-container-low px-4 py-1.5 rounded-full">{searchResults.length} {t('search_page.places_count')}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {searchResults.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}
