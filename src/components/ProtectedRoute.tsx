import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface Props {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole'); // Lấy role đã lưu từ Login
  const location = useLocation();

  // ❗ 1. Chưa login → chuyển về login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ❗ 2. Kiểm tra quyền truy cập theo Route (Ví dụ bảo vệ các trang staff)
  const path = location.pathname;
  
  if (path.includes('/sales-support') && userRole !== 'SalesSupport') {
    return <Navigate to="/" replace />; // Không đúng role thì đẩy ra trang chủ
  }

  if (path.includes('/operations') && userRole !== 'Operations') {
    return <Navigate to="/" replace />;
  }

  // ✅ Đã thỏa mãn tất cả điều kiện → cho vào
  return children;
};

export default ProtectedRoute;