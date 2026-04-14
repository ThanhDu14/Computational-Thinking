import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import GlassCard from '../../components/common/GlassCard';
import { useTranslation } from 'react-i18next';

export default function BlogPage() {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-5xl mx-auto">
      <SectionHeader title={t('blog.header_title')} subtitle={t('blog.header_subtitle')} className="mb-12 text-center items-center" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard hoverEffect className="p-6">
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05" alt="Blog" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-display font-bold text-2xl text-on-surface mb-3">{t('blog.card1_title')}</h3>
          <p className="text-on-surface-variant font-body mb-4">{t('blog.card1_desc')}</p>
          <span className="text-primary font-bold text-sm tracking-wider uppercase cursor-pointer hover:underline">{t('blog.read_story')}</span>
        </GlassCard>
        
        <GlassCard hoverEffect className="p-6">
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26" alt="Tokyo" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-display font-bold text-2xl text-on-surface mb-3">{t('blog.card2_title')}</h3>
          <p className="text-on-surface-variant font-body mb-4">{t('blog.card2_desc')}</p>
          <span className="text-primary font-bold text-sm tracking-wider uppercase cursor-pointer hover:underline">{t('blog.read_story')}</span>
        </GlassCard>
      </div>
    </div>
  );
}
