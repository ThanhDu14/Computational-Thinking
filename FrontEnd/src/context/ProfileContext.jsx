import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { updateInfo, getInfo } from '../services/profileService';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
    const { user, setUser, getToken } = useAuth();

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
            // Lấy token linh hoạt từ AuthContext (hỗ trợ Firebase refresh token cho Google)
            const token = await getToken();

            const payload = {
                avatar: formData.avatar,
                display_name: formData.displayName,
                phone_number: formData.phone,
                bio: formData.bio,
                travel_preferences: formData.preferences,
                email: formData.email
            };

            await updateInfo(token, payload);

            // Fetch the updated profile to ensure data consistency
            const updatedProfileData = await getInfo(token);

            // Cập nhật lại user trong context để giao diện (Navbar/Settings) tự Update ngay lập tức
            if (setUser) {
                const updatedUser = {
                    ...user,
                    name: updatedProfileData.display_name || user.name,
                    phone: updatedProfileData.phone_number || user.phone,
                    bio: updatedProfileData.bio || user.bio,
                    avatar: updatedProfileData.avatar || user.avatar,
                    preferences: updatedProfileData.travel_preferences || user.preferences
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
    }, [user, setUser, getToken]);

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
