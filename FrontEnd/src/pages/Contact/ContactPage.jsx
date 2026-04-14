import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-5xl mx-auto pt-20 pb-20 px-6">
      <div className="text-center mb-16">
        <SectionHeader title={t('contact.header.title')} subtitle={t('contact.header.subtitle')} className="items-center" />
        <p className="text-lg text-on-surface-variant font-body mt-6 max-w-2xl mx-auto">
          {t('contact.header.desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassCard className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center mb-2">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-on-surface">{t('contact.info.email_title')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('contact.info.email_desc')}</p>
            <a href="mailto:smartTravel@gmail.com" className="font-body font-semibold text-primary hover:underline mt-2">smartTravel@gmail.com</a>
          </GlassCard>
          
          <GlassCard className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-on-surface">{t('contact.info.office_title')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('contact.info.office_desc')}</p>
            <p className="font-body font-semibold text-primary mt-2">Trường ĐH KHTN</p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-tertiary-container text-tertiary flex items-center justify-center mb-2">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-on-surface">{t('contact.info.phone_title')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('contact.info.phone_desc')}</p>
            <a href="tel:+15550000000" className="font-body font-semibold text-primary hover:underline mt-2">+1 (555) 000-0000</a>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="h-full p-8 md:p-12">
            <h3 className="text-3xl font-display font-bold text-on-surface mb-8">{t('contact.form.title')}</h3>
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('contact.form.first_name')}</label>
                  <input type="text" className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body" placeholder={t('contact.form.first_name_ph')} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('contact.form.last_name')}</label>
                  <input type="text" className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body" placeholder={t('contact.form.last_name_ph')} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('contact.form.email')}</label>
                <input type="email" className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body" placeholder={t('contact.form.email_ph')} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('contact.form.message')}</label>
                <textarea rows="4" className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body resize-none" placeholder={t('contact.form.message_ph')}></textarea>
              </div>
              <Button variant="primary" className="mt-4 w-full md:w-auto self-start">
                {t('contact.form.submit')} <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
