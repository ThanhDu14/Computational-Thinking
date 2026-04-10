import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { verifyTokenWithBackend } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Khởi tạo state từ localStorage (nếu có, để tránh chớp màn hình khi reload)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_travel_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Tùy chọn: Đồng bộ trạng thái từ Firebase Auth khi F5 Chrome (nếu backend dùng Firebase Token)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Nếu user Firebase bị logout từ chỗ khác, ta clear local state
      if (!firebaseUser) {
        setUser(null);
        localStorage.removeItem('smart_travel_user');
      }
      // Lưu ý: Ta không tự động gọi verify Backend ở đây nữa, 
      // để flow đăng nhập hoàn toàn là CHỦ ĐỘNG từ action của user trên UI.
    });
    return () => unsubscribe();
  }, []);

  /**
   * Hàm xử lý chung sau khi xác thực thành công qua Firebase
   * @param {Object} firebaseUser - Object user từ Firebase Auth
   */
  const handleBackendAuthentication = async (firebaseUser) => {
    try {
      // 1. Lấy JWT idToken
      const idToken = await firebaseUser.getIdToken();

      // 2. Gửi token lên Backend xác minh
      const userData = await verifyTokenWithBackend(idToken);

      // 3. (Tuỳ chọn) Bạn có thể lưu JWT riêng do backend trả về vào localStorage tại đây
      // userData có thể bao gồm: { uid, name, email, avatar, token: 'backend-jwt-...' }
      localStorage.setItem('smart_travel_user', JSON.stringify(userData));

      // 4. Lưu vào state
      setUser(userData);
      
      return userData; // Trả về để AuthPage xử lý redirect
    } catch (error) {
      // Backend từ chối -> Phải đăng xuất Firebase để đồng bộ trạng thái
      await signOut(auth);
      localStorage.removeItem('smart_travel_user');
      setUser(null);
      throw error; // Ném lỗi cho UI hiển thị
    }
  };

  // --- CÁC HÀM XỬ LÝ AUTHENTICATION TỪ UI ---

  // Đăng nhập bằng Email/Password
  const login = useCallback(async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return await handleBackendAuthentication(result.user);
  }, []);

  // Đăng ký bằng Email/Password
  const register = useCallback(async (name, email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }
    return await handleBackendAuthentication(result.user);
  }, []);

  // Đăng nhập bằng Google
  const loginWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return await handleBackendAuthentication(result.user);
  }, []);

  // Đăng xuất
  const logout = useCallback(async () => {
    await signOut(auth);
    localStorage.removeItem('smart_travel_user');
    setUser(null);
  }, []);

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

