import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — Chuyển hướng về /login nếu chưa đăng nhập.
 * Lưu lại `from` trong location.state để sau khi login có thể quay lại đúng trang.
 */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: 'Bạn cần đăng nhập để sử dụng tính năng này.' }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
