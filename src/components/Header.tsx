// src/components/Header.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient.ts'; 
import './styles/Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserName(email.split('@')[0]);
    }
  }, []);

  // Hàm xử lý đăng xuất gọi API
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Gọi API logout gửi kèm refreshToken
        await axiosClient.post('/auth/logout', {
          refreshToken: refreshToken
        });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất:", error);
    } finally {
      // Dù API thành công hay lỗi, vẫn xóa dữ liệu cục bộ và về trang login
      localStorage.clear();
      setUserName(null);
      window.location.href = '/login';
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo và Nav Menu giữ nguyên */}
        <div className="logo" onClick={() => navigate('/')}>
          <span className="logo-icon">👓</span>
          <span className="logo-text">EyewearHut</span>
        </div>

        <nav className="nav-menu">
          <button onClick={() => navigate('/')} className="nav-link">Trang chủ</button>
          <button onClick={() => navigate('/products')} className="nav-link">Sản phẩm</button>
          <button onClick={() => navigate('/brands')} className="nav-link">Nhãn hiệu</button>
          <button onClick={() => navigate('/about')} className="nav-link">Về chúng tôi</button>
          <button onClick={() => navigate('/contact')} className="nav-link">Liên hệ</button>
        </nav>

        <div className="header-icons">
          <button className="icon-btn">🔍</button>
          
          {userName ? (
            <div className="user-profile-section">
              <div className="user-badge-red" onClick={() => navigate('/profile')}>
                <span className="avatar-icon">👤</span>
                <span className="user-name-text">{userName}</span>
              </div>
              
              {/* Nút đăng xuất gọi hàm handleLogout mới */}
              <button className="logout-dropdown-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="icon-btn">👤</button>
          )}

          <button className="icon-btn" onClick={() => navigate('/cart')}>🛒</button>
        </div>
      </div>
    </header>
  );
};

export default Header;