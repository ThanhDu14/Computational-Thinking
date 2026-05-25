import React, { useState } from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendContactEmail } from '../../services/contactService';
import { useAuth } from '../../context/AuthContext';

export default function ContactPage() {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const token = await getToken();
      await sendContactEmail(formData, token);
      setStatus('success');
      setFormData({ first_name: '', last_name: '', email: '', message: '' });
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus('error');
      setErrorMessage(err.message || "Failed to send message. Please try again.");
    }
  };

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
            <a href="mailto:travel36.contact@gmail.com" className="font-body font-semibold text-primary hover:underline mt-2">Travel36.contact@gmail.com</a>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-on-surface">{t('contact.info.office_title')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('contact.info.office_desc')}</p>
            <p className="font-body font-semibold text-primary mt-2">Trường Đại Học Khoa Học Tự Nhiên - Đại Học Quốc Gia Thành Phố Hồ Chí Minh</p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-tertiary-container text-tertiary flex items-center justify-center mb-2">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-on-surface">{t('contact.info.phone_title')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('contact.info.phone_desc')}</p>
            <a href="tel:+840342524161" className="font-body font-semibold text-primary hover:underline mt-2">+84 342524161</a>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="h-full p-8 md:p-12">
            <h3 className="text-3xl font-display font-bold text-on-surface mb-8">{t('contact.form.title')}</h3>

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                <h4 className="text-2xl font-bold text-on-surface mb-2">Message Sent!</h4>
                <p className="text-on-surface-variant mb-6">We've received your inquiry and will get back to you soon.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-primary font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('contact.form.first_name')}</label>
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      type="text"
                      className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body"
                      placeholder={t('contact.form.first_name_ph')}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('contact.form.last_name')}</label>
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      type="text"
                      className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body"
                      placeholder={t('contact.form.last_name_ph')}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('contact.form.email')}</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    type="email"
                    className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body"
                    placeholder={t('contact.form.email_ph')}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('contact.form.message')}</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body resize-none"
                    placeholder={t('contact.form.message_ph')}
                  ></textarea>
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl text-sm font-medium border border-red-500/20">
                    <AlertCircle size={18} />
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  variant="primary"
                  className="mt-4 w-full md:w-auto self-start"
                >
                  {status === 'loading' ? 'Sending...' : t('contact.form.submit')}
                  {status !== 'loading' && <Send className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
