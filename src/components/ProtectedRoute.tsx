import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem('accessToken');

  // ❗ Chưa login → chuyển về login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Đã login → cho vào
  return children;
};

export default ProtectedRoute;