import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_travel_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Đồng bộ trạng thái từ Firebase (chỉ cho Google users hoặc auto-logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser && user?.authType === 'google') {
        // Nếu user Google bị logout từ Firebase, ta clear local state
        setUser(null);
        localStorage.removeItem('smart_travel_user');
      }
    });
    return () => unsubscribe();
  }, [user]);

  // --- CÁC HÀM XỬ LÝ AUTHENTICATION TỪ UI ---

  // Đăng nhập bằng Local (Trực tiếp với Backend)
  const login = useCallback(async (username, password) => {
    try {
      const userData = await authService.loginLocalBackend(username, password);
      const userWithMeta = { ...userData, authType: 'local' };
      localStorage.setItem('smart_travel_user', JSON.stringify(userWithMeta));
      setUser(userWithMeta);
      return userWithMeta;
    } catch (error) {
      throw error;
    }
  }, []);

  // Đăng ký (Trực tiếp với Backend)
  const register = useCallback(async (username, password, confirm_password) => {
    try {
      const userData = await authService.registerLocalBackend({ username, password, confirm_password });
      const userWithMeta = { ...userData, authType: 'local' };
      localStorage.setItem('smart_travel_user', JSON.stringify(userWithMeta));
      setUser(userWithMeta);
      return userWithMeta;
    } catch (error) {
      throw error;
    }
  }, []);

  // Đăng nhập bằng Google (Firebase + Backend verify)
  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const userData = await authService.loginWithGoogleBackend(idToken);

      const userWithMeta = { ...userData, authType: 'google', firebaseUid: result.user.uid };
      localStorage.setItem('smart_travel_user', JSON.stringify(userWithMeta));
      setUser(userWithMeta);
      return userWithMeta;
    } catch (error) {
      await signOut(auth);
      throw error;
    }
  }, []);

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      const isFirebase = auth.currentUser;
      const isLocal = localStorage.getItem('smart_travel_user');

      // Nếu xài Google (Cửa 1):
      if (isFirebase) {
        // Lấy token làm mới nhất (bắt buộc tham số true)
        const freshToken = await auth.currentUser.getIdToken(true);
        await authService.logoutBackend(freshToken);
        await signOut(auth); // Quét sạch Web Session Firebase
      }

      // Nếu xài Local Tự Trồng (Cửa 2):
      if (isLocal) {
        // Stateless JWT: Tự ném thẻ vào thùng rác là mất quyền
        localStorage.removeItem('smart_travel_user');
      }

      setUser(null);

      // Redirect về trang /login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  // Đổi mật khẩu
  const changePasswordUser = useCallback(async (payload) => {
    try {
      const token = user?.access_token || user?.token || '';
      console.log("Token: ", token);
      const response = await authService.changePassword(token, payload);
      return response;
    } catch (error) {
      throw error;
    }
  }, [user]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, login, register, loginWithGoogle, logout, changePasswordUser }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

