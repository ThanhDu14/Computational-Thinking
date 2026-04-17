import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { updateInfo } from '../services/profileService';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
    const { user, setUser } = useAuth();

    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateStatus, setUpdateStatus] = useState(null); // { type: 'success'|'error', message: string }

    /**
     * Cập nhật thông tin profile.
     * @param {Object} formData - Dữ liệu từ SettingsPage { displayName, phone, bio }
     */
    const updateProfile = useCallback(async (formData) => {
        setUpdateLoading(true);
        setUpdateStatus(null);

        try {
            // Lấy token từ user object (hỗ trợ cả local và google)
            const token = user?.access_token || user?.token || '';

            const payload = {
                avatar: formData.avatar,
                display_name: formData.displayName,
                phone_number: formData.phone,
                bio: formData.bio,
                travel_preferences: formData.travel_preferences,
                email: formData.email
            };

            const updatedData = await updateInfo(token, payload);

            // Cập nhật lại user trong context để giao diện (Navbar/Settings) tự Update ngay lập tức
            if (setUser) {
                const updatedUser = {
                    ...user,
                    name: formData.displayName || user.name,
                    phone: formData.phone || user.phone,
                    bio: formData.bio || user.bio,
                    avatar: formData.avatar || user.avatar
                };
                localStorage.setItem('smart_travel_user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }

            setUpdateStatus({ type: 'success', message: 'Profile updated successfully!' });
        } catch (err) {
            setUpdateStatus({ type: 'error', message: err.message || 'Failed to update profile.' });
        } finally {
            setUpdateLoading(false);
        }
    }, [user, setUser]);

    const clearUpdateStatus = useCallback(() => setUpdateStatus(null), []);

    return (
        <ProfileContext.Provider value={{ updateProfile, updateLoading, updateStatus, clearUpdateStatus }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};
