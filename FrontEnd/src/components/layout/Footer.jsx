import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoImg from '../../assets/images/logo.png';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-surface-container-low pt-20 pb-12 mt-auto text-on-surface-variant font-body">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
          <div className="flex flex-col gap-4 max-w-sm">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 overflow-hidden bg-surface-container-highest">
                <img src={logoImg} alt="SmartTravel Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight text-on-surface">SmartTravel</span>
            </Link>
            <p className="text-sm leading-relaxed">
              {t('footer.desc')}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm font-medium">
            <div className="flex flex-col gap-3">
              <h4 className="text-on-surface font-display font-bold mb-1">{t('footer.company')}</h4>
              <Link to="/about" className="hover:text-primary transition-colors">{t('footer.about_us')}</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contact')}</Link>
              <a href="#" className="hover:text-primary transition-colors">{t('footer.careers')}</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-on-surface font-display font-bold mb-1">{t('footer.resources')}</h4>
              <Link to="/recommendations" className="hover:text-primary transition-colors">{t('footer.recommendations')}</Link>
              <a href="#" className="hover:text-primary transition-colors">{t('footer.help_center')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('footer.safety')}</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-on-surface font-display font-bold mb-1">{t('footer.legal')}</h4>
              <a href="#" className="hover:text-primary transition-colors">{t('footer.privacy_policy')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('footer.terms_of_service')}</a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium tracking-wide">
          <p>© {new Date().getFullYear()} SmartTravel Inc. {t('footer.all_rights_reserved')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
