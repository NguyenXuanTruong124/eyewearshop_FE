// src/components/Header.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient.ts'; 
import './styles/Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  // Hàm lấy số lượng sản phẩm từ API giỏ hàng
  const fetchCartCount = useCallback(async () => {
    try {
      // Thử lấy từ server trước
      let used = 0;
      try {
        const response = await axiosClient.get('/cart');
        if (response?.data && response.data.summary) {
          used = response.data.summary.itemCount || 0;
        }
      } catch (err) {
        console.warn('Header: Không lấy được cart từ server, sẽ kiểm tra localCart', err);
      }

      // Nếu server không có item, kiểm tra localStorage fallback (khách hoặc lúc server trả rỗng)
      if (!used) {
        try {
          const raw = localStorage.getItem('localCart');
          if (raw) {
            const local = JSON.parse(raw);
            used = (local.summary && local.summary.itemCount) ? local.summary.itemCount : (local.items ? local.items.reduce((s: number, it: any) => s + (it.quantity || 0), 0) : 0);
          }
        } catch (e) {
          console.warn('Header: lỗi đọc localCart', e);
        }
      }

      setCartCount(used);
    } catch (error) {
      console.error("Lỗi lấy số lượng giỏ hàng:", error);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    // 1. Kiểm tra thông tin người dùng
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserName(email.split('@')[0]);
    }

    // 2. Lấy số lượng giỏ hàng lần đầu khi load trang
    fetchCartCount();

    // 3. Lắng nghe sự kiện cập nhật giỏ hàng từ các component khác
    const handleCartUpdate = () => {
      console.log("Header: Nhận tín hiệu cập nhật số lượng giỏ hàng");
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [fetchCartCount]);

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axiosClient.post('/auth/logout', {
          refreshToken: refreshToken
        });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất:", error);
    } finally {
      localStorage.clear();
      setUserName(null);
      setCartCount(0);
      window.location.href = '/login';
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
              <div className="user-badge-red" onClick={() => navigate('/profile')}>
                <span className="avatar-icon">👤</span>
                <span className="user-name-text">{userName}</span>
              </div>
              
              <button className="logout-dropdown-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="icon-btn">👤</button>
          )}

          <button className="icon-btn" onClick={() => navigate('/cart')} style={{ position: 'relative' }}>
            🛒
            {cartCount > 0 && (
              <span style={{
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
                textAlign: 'center'
              }}>
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