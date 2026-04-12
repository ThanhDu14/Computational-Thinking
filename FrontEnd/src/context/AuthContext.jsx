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

  // Đăng nhập bằng Email/Password (Trực tiếp với Backend)
  const login = useCallback(async (email, password) => {
    try {
      const userData = await authService.loginLocalBackend(email, password);
      const userWithMeta = { ...userData, authType: 'local' };
      localStorage.setItem('smart_travel_user', JSON.stringify(userWithMeta));
      setUser(userWithMeta);
      return userWithMeta;
    } catch (error) {
      throw error;
    }
  }, []);

  // Đăng ký bằng Email/Password (Trực tiếp với Backend)
  const register = useCallback(async (name, email, password) => {
    try {
      const userData = await authService.registerLocalBackend({ name, email, password });
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
      // 1. Gọi backend logout
      const idToken = user?.authType === 'google' ? await auth.currentUser?.getIdToken() : null;
      await authService.logoutBackend(idToken);

      // 2. Logout Firebase (nếu là Google user)
      if (user?.authType === 'google') {
        await signOut(auth);
      }

      // 3. Clear local state
      localStorage.removeItem('smart_travel_user');
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn clear local cho chắc chắn
      localStorage.removeItem('smart_travel_user');
      setUser(null);
    }
  }, [user]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, loginWithGoogle, logout }}>
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

