// src/components/Header.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Lấy thông tin email người dùng đã lưu từ máy khách
    const email = localStorage.getItem('userEmail');
    if (email) {
      // Hiển thị phần tên trước ký tự '@'
      setUserName(email.split('@')[0]);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserName(null);
    window.location.href = '/login';
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo EyewearHut */}
        <div className="logo" onClick={() => navigate('/')}>
          <span className="logo-icon">👓</span>
          <span className="logo-text">EyewearHut</span>
        </div>

        {/* Danh mục Menu chính */}
        <nav className="nav-menu">
          <button onClick={() => navigate('/')} className="nav-link">Trang chủ</button>
          <button onClick={() => navigate('/products')} className="nav-link">Sản phẩm</button>
          <button onClick={() => navigate('/brands')} className="nav-link">Nhãn hiệu</button>
          <button onClick={() => navigate('/about')} className="nav-link">Về chúng tôi</button>
          <button onClick={() => navigate('/contact')} className="nav-link">Liên hệ</button>
        </nav>

        {/* Các Icon chức năng bên phải */}
        <div className="header-icons">
          <button className="icon-btn">🔍</button>
          
          {userName ? (
            /* Khối hiển thị thông tin khi đã đăng nhập */
            <div className="user-profile-section">
              <div className="user-badge-red" onClick={() => navigate('/profile')}>
                <span className="avatar-icon">👤</span>
                <span className="user-name-text">{userName}</span>
              </div>
              
              {/* Nút đăng xuất này sẽ bị ẩn mặc định, chỉ hiện khi hover */}
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