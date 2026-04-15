import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Heart, Settings as SettingsIcon, Shield, Camera, Globe, Moon, Sun, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    displayName: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: ''
  });

  const [preferences, setPreferences] = useState(['adventure', 'culture']);

  const tabs = [
    { id: 'profile', icon: User, label: t('settings.tabs.profile', 'Profile Information') },
    { id: 'preferences', icon: Heart, label: t('settings.tabs.preferences', 'Travel Preferences') },
    { id: 'appearance', icon: SettingsIcon, label: t('settings.tabs.appearance', 'Appearance & Settings') },
    { id: 'security', icon: Shield, label: t('settings.tabs.security', 'Security') },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePreference = (pref) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter(p => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const toggleLanguage = () => {
    const currentLang = i18n.language || '';
    const newLang = currentLang.startsWith('vi') ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  // Avatar First Letter
  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-background pt-28 pb-16 px-6 font-body text-on-surface">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold tracking-tight text-on-surface mb-2">
            {t('settings.header.title', 'Settings')}
          </h1>
          <p className="text-on-surface-variant font-medium">
            {t('settings.header.subtitle', 'Manage your account details and preferences')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Tabs */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 font-semibold text-sm ${
                      isActive 
                        ? 'bg-surface-lowest shadow-sm text-primary ring-1 ring-outline-variant/20' 
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-surface-lowest rounded-3xl p-6 lg:p-8 shadow-[0_20px_40px_-20px_rgba(39,44,81,0.06)] border border-outline-variant/10">
                    <h2 className="text-xl font-display font-bold mb-6">{t('settings.profile.title', 'Profile Information')}</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-3xl font-display font-bold shadow-lg shadow-primary/20">
                          {avatarLetter}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-surface-lowest text-on-surface rounded-full shadow-md border border-outline-variant/20 hover:text-primary transition-colors">
                          <Camera size={16} />
                        </button>
                      </div>
                      <div>
                        <button className="px-5 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-sm rounded-full transition-colors border border-outline-variant/20">
                          {t('settings.profile.upload_btn', 'Upload new picture')}
                        </button>
                      </div>
                    </div>

                    {/* Forms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('settings.profile.display_name', 'Display Name')}</label>
                        <input 
                          type="text" 
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low focus:bg-surface-lowest border border-transparent focus:border-outline-variant/30 text-on-surface rounded-2xl px-4 py-3 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('settings.profile.email', 'Email Address')}</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          disabled
                          className="w-full bg-surface-container/50 border border-transparent text-on-surface-variant rounded-2xl px-4 py-3 outline-none opacity-70 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('settings.profile.phone', 'Phone Number')}</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low focus:bg-surface-lowest border border-transparent focus:border-outline-variant/30 text-on-surface rounded-2xl px-4 py-3 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('settings.profile.bio', 'Short Bio')}</label>
                        <textarea 
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder={t('settings.profile.bio_ph', 'Tell us about your travel style...')}
                          className="w-full bg-surface-container-low focus:bg-surface-lowest border border-transparent focus:border-outline-variant/30 text-on-surface rounded-2xl px-4 py-3 outline-none transition-all resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                      {t('settings.save_changes', 'Save Changes')}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-surface-lowest rounded-3xl p-6 lg:p-8 shadow-[0_20px_40px_-20px_rgba(39,44,81,0.06)] border border-outline-variant/10">
                    <h2 className="text-xl font-display font-bold mb-6">{t('settings.appearance.title', 'Appearance Settings')}</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-surface-lowest flex items-center justify-center text-primary shadow-sm">
                            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{t('settings.appearance.dark_mode', 'Dark Mode')}</p>
                            <p className="text-xs text-on-surface-variant">{t('settings.appearance.dark_mode_desc', 'Switch between light and dark themes')}</p>
                          </div>
                        </div>
                        <button 
                          onClick={toggleTheme}
                          className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-outline-variant/30'}`}
                        >
                          <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-surface-lowest flex items-center justify-center text-primary shadow-sm">
                            <Globe size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{t('settings.appearance.language', 'Language')}</p>
                            <p className="text-xs text-on-surface-variant">{t('settings.appearance.language_desc', 'Choose your preferred language')}</p>
                          </div>
                        </div>
                        <select 
                          value={(i18n.language || '').startsWith('vi') ? 'vi' : 'en'} 
                          onChange={toggleLanguage}
                          className="px-4 py-2 bg-surface-lowest border border-outline-variant/20 rounded-xl text-sm font-semibold text-on-surface outline-none cursor-pointer"
                        >
                          <option value="en">English (US)</option>
                          <option value="vi">Tiếng Việt</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-surface-lowest rounded-3xl p-6 lg:p-8 shadow-[0_20px_40px_-20px_rgba(39,44,81,0.06)] border border-outline-variant/10">
                    <h2 className="text-xl font-display font-bold mb-6">{t('settings.preferences.title', 'Travel Preferences')}</h2>
                    <p className="text-sm text-on-surface-variant mb-6">
                      {t('settings.preferences.desc', 'Select your preferred travel vibes to help our AI curate better destinations for you.')}
                    </p>

                    <div className="flex flex-wrap gap-3 mb-8">
                      {['adventure', 'beach', 'culture', 'food', 'nature', 'city'].map(pref => (
                        <button
                          key={pref}
                          onClick={() => togglePreference(pref)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                            preferences.includes(pref) 
                              ? 'bg-secondary-container border-transparent text-on-secondary-container' 
                              : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/50'
                          }`}
                        >
                          {preferences.includes(pref) && <Check size={14} className="text-on-secondary-container" />}
                          {t(`settings.preferences.tags.${pref}`, pref.charAt(0).toUpperCase() + pref.slice(1))}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                      {t('settings.save_changes', 'Save Changes')}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-surface-lowest rounded-3xl p-6 lg:p-8 shadow-[0_20px_40px_-20px_rgba(39,44,81,0.06)] border border-outline-variant/10">
                    <h2 className="text-xl font-display font-bold mb-6">{t('settings.security.title', 'Security')}</h2>
                    <p className="text-sm text-on-surface-variant mb-6">
                      {t('settings.security.desc', 'Feature coming soon.')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
