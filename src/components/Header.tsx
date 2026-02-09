import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">

      <div className="header-main">
        <div className="logo">
          <span className="glasses-icon">👓</span>
          <span>EyewearHut</span>
        </div>

        <nav className="nav-menu">
          <a href="/" className="nav-link">Trang chủ</a>
          <a href="/products" className="nav-link">Sản phẩm</a>
          <a href="/staff" className="nav-link">Nhân viên</a>
          <a href="/about" className="nav-link">Về chúng tôi</a>
          <a href="/contact" className="nav-link">Liên hệ</a>
        </nav>

        <div className="header-actions">
          <button className="icon-btn search-btn" title="Search">🔍</button>
          <a href="/login" className="icon-btn login-btn" title="Login">👤</a>
          <button className="icon-btn cart-btn" title="Cart">🛒</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
