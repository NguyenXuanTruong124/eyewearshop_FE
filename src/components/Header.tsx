// src/components/Header.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
import './styles/Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  const fetchCartCount = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const response = await axiosClient.get('/cart');

      // ✅ items.length là số lượng SẢN PHẨM KHÁC NHAU trong giỏ hàng
      if (response?.data && response.data.items) {
        setCartCount(response.data.items.length);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Lỗi lấy số lượng giỏ hàng:', error);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    const updateUserName = () => {
      const email = localStorage.getItem('userEmail');
      if (email) setUserName(email.split('@')[0]);
      else setUserName(null);
    };

    updateUserName();
    fetchCartCount();

    const handleCartUpdate = () => fetchCartCount();
    const handleAuthChange = () => updateUserName();

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('authChanged', handleAuthChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, [fetchCartCount]);

  // ⭐ LOGOUT CHUẨN GIỐNG PROFILE
  const handleLogout = async () => {
    try {
      // Xóa Session Giỏ hàng hiện tại ở Backend để không lưu vết cho người sau
      await axiosClient.delete('/cart').catch(() => { });

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axiosClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    } finally {
      // 🔥 Xoá toàn bộ LocalStorage
      localStorage.clear();

      // 🔥 Xoá Cookie Session hiện tại ở Frontend (nếu Backend trả về Cookie non-HttpOnly)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 🔥 Redirect + reload để reset app state
      window.location.replace('/');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
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
              <div
                className="user-badge-red"
                onClick={() => navigate('/profile')}
              >
                <span className="avatar-icon">👤</span>
                <span className="user-name-text">{userName}</span>
              </div>

              <button
                className="logout-dropdown-btn"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="icon-btn"
            >
              👤
            </button>
          )}

          <button
            className="icon-btn"
            onClick={() => navigate('/cart')}
            style={{ position: 'relative' }}
          >
            🛒
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-8px',
                  backgroundColor: '#cc0000',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  minWidth: '18px',
                  textAlign: 'center',
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;