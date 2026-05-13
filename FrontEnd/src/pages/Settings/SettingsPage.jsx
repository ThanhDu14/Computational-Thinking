import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../context/ProfileContext';
import { User, Heart, Settings as SettingsIcon, Shield, Camera, Globe, Moon, Sun, Check, Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInfo, uploadAvatar } from '../../services/profileService';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user, changePasswordUser, getToken } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { updateProfile, updateLoading, updateStatus, clearUpdateStatus } = useProfile();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    displayName: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    avatar: user?.avatar || ''
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);

  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);

      const token = await getToken();
      if (token) {
        try {
          const data = await uploadAvatar(token, file);
          if (data && data.avatar_url) {
            setFormData(prev => ({ ...prev, avatar: data.avatar_url }));
            setPreviewAvatar(null); // Clear preview to use the real URL
          }
        } catch (error) {
          console.error("Failed to upload avatar", error);
        }
      }
    }
  };

  const [preferences, setPreferences] = useState(['adventure', 'culture']);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await getInfo(token);
        if (data) {
          setFormData(prev => ({
            ...prev,
            displayName: data.display_name || prev.displayName,
            email: data.email || prev.email,
            phone: data.phone_number || prev.phone,
            bio: data.bio || prev.bio,
            avatar: data.avatar || prev.avatar
          }));
          if (data.travel_preferences && Array.isArray(data.travel_preferences)) {
            setPreferences(data.travel_preferences);
          }
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
      }
    };
    fetchProfileData();
  }, [user, getToken]);

  // --- Change Password State ---
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState(null); // { type: 'success'|'error', message: string }

  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  const togglePwShow = (field) => setPwShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwStatus(null);

    if (pwForm.newPw !== pwForm.confirm) {
      setPwStatus({ type: 'error', message: t('settings.security.pw_mismatch', 'New passwords do not match.') });
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwStatus({ type: 'error', message: t('settings.security.pw_too_short', 'New password must be at least 6 characters.') });
      return;
    }

    setPwLoading(true);
    try {
      const payload = {
        old_password: pwForm.current,
        new_password: pwForm.newPw,
        confirm_password: pwForm.confirm
      };

      console.log("=== THÔNG TIN GỬI LÊN BACKEND ===");
      console.log(payload);

      await changePasswordUser(payload);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwStatus({ type: 'success', message: t('settings.security.pw_success', 'Password changed successfully!') });
    } catch (err) {
      setPwStatus({ type: 'error', message: err.message || t('settings.security.pw_error', 'Failed to change password.') });
    } finally {
      setPwLoading(false);
    }
  };

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
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (clearUpdateStatus) clearUpdateStatus();
                      setPwStatus(null);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 font-semibold text-sm ${isActive
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
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-3xl font-display font-bold shadow-lg shadow-primary/20 overflow-hidden">
                          {previewAvatar || formData.avatar ? (
                            <img src={previewAvatar || formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            avatarLetter
                          )}
                        </div>
                        <button
                          onClick={handleAvatarClick}
                          className="absolute bottom-0 right-0 p-2 bg-surface-lowest text-on-surface rounded-full shadow-md border border-outline-variant/20 hover:text-primary transition-colors"
                        >
                          <Camera size={16} />
                        </button>
                      </div>
                      <div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
                        <button
                          onClick={handleAvatarClick}
                          className="px-5 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-sm rounded-full transition-colors border border-outline-variant/20"
                        >
                          {t('settings.profile.upload_btn', 'Upload new picture')}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {updateStatus && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className={`flex items-center gap-3 mb-6 px-5 py-4 rounded-2xl text-sm font-semibold ${updateStatus.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/25 text-green-600 dark:text-green-400'
                            : 'bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400'
                            }`}
                        >
                          {updateStatus.type === 'success'
                            ? <CheckCircle2 size={18} className="flex-shrink-0" />
                            : <AlertCircle size={18} className="flex-shrink-0" />}
                          {updateStatus.message}
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                          disabled={user?.authType === 'google'}
                          onChange={handleInputChange}
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
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${preferences.includes(pref)
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
                    <button
                      onClick={() => updateProfile({ ...formData, preferences })}
                      disabled={updateLoading}
                      className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {updateLoading && (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      )}
                      {updateLoading ? t('settings.security.saving', 'Saving...') : t('settings.save_changes', 'Save Changes')}
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
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${preferences.includes(pref)
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
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold">{t('settings.security.title', 'Security')}</h2>
                        <p className="text-xs text-on-surface-variant">{t('settings.security.subtitle', 'Manage your password and account security')}</p>
                      </div>
                    </div>

                    {/* Google user — cannot change password */}
                    {user?.authType === 'google' ? (
                      <div className="flex items-start gap-4 p-5 bg-blue-500/8 border border-blue-500/20 rounded-2xl">
                        <AlertCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-on-surface text-sm">{t('settings.security.google_title', 'Google Account')}</p>
                          <p className="text-sm text-on-surface-variant mt-1">
                            {t('settings.security.google_desc', 'Your account uses Google Sign-In. Password management is handled by Google.')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleChangePassword} className="space-y-5">
                        {/* Status Banner */}
                        <AnimatePresence>
                          {pwStatus && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold ${pwStatus.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/25 text-green-600 dark:text-green-400'
                                : 'bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400'
                                }`}
                            >
                              {pwStatus.type === 'success'
                                ? <CheckCircle2 size={18} className="flex-shrink-0" />
                                : <AlertCircle size={18} className="flex-shrink-0" />}
                              {pwStatus.message}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Current Password */}
                        {[{ name: 'current', label: t('settings.security.current_pw', 'Current Password'), placeholder: '••••••••' },
                        { name: 'newPw', label: t('settings.security.new_pw', 'New Password'), placeholder: t('settings.security.new_pw_ph', 'Min. 6 characters') },
                        { name: 'confirm', label: t('settings.security.confirm_pw', 'Confirm New Password'), placeholder: '••••••••' },
                        ].map(({ name, label, placeholder }) => (
                          <div key={name} className="space-y-2">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{label}</label>
                            <div className="relative">
                              <input
                                type={pwShow[name] ? 'text' : 'password'}
                                name={name}
                                value={pwForm[name]}
                                onChange={handlePwChange}
                                placeholder={placeholder}
                                required
                                className="w-full bg-surface-container-low focus:bg-surface-lowest border border-transparent focus:border-outline-variant/40 text-on-surface rounded-2xl px-4 py-3 pr-12 outline-none transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => togglePwShow(name)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                              >
                                {pwShow[name] ? <EyeOff size={17} /> : <Eye size={17} />}
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={pwLoading}
                            className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
                          >
                            {pwLoading && (
                              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            )}
                            {pwLoading
                              ? t('settings.security.saving', 'Saving...')
                              : t('settings.security.save_pw', 'Update Password')}
                          </button>
                        </div>
                      </form>
                    )}
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
