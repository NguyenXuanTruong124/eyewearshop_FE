import React from 'react';
import './styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Column 1: Company Info */}
        <div className="footer-column">
          <div className="footer-header">
            <span className="glasses-icon">👓</span>
            <h3>EyewearHut</h3>
          </div>
          <p className="company-description">
            Cửa hàng kính mắt uy tín hàng đầu Việt Nam. Chúng tôi cung cấp các sản phẩm kính chất lượng cao với giá tốt nhất.
          </p>
          <div className="social-links">
            <a href="#facebook" title="Facebook">f</a>
            <a href="#instagram" title="Instagram">📷</a>
            <a href="#twitter" title="Twitter">𝕏</a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="/about">Về chúng tôi</a></li>
            <li><a href="/products">Sản phẩm</a></li>
            <li><a href="/warranty">Bảo hành</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/policies">Chính sách độc lập</a></li>
          </ul>
        </div>

        {/* Column 3: Customer Support */}
        <div className="footer-column">
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li><a href="/guide">Hướng dẫn chọn kính</a></li>
            <li><a href="/care">Cách chăm sóc kính</a></li>
            <li><a href="/size">Hướng dẫn tìm size</a></li>
            <li><a href="/shipping">Thanh toán</a></li>
            <li><a href="/returns">Giao hàng</a></li>
          </ul>
        </div>

        {/* Column 4: Contact Info */}
        <div className="footer-column">
          <h4>Thông tin liên hệ</h4>
          <div className="contact-item">
            <span>📍</span>
            <span>123 Đường ABC, Quận 1, TP Hồ Chí Minh</span>
          </div>
          <div className="contact-item">
            <span>📞</span>
            <span>1900-xxxx</span>
          </div>
          <div className="contact-item">
            <span>📧</span>
            <span>contact@eyewearhut.vn</span>
          </div>
          <div className="contact-item">
            <span>⏰</span>
            <div>
              <p>T2 - T7: 8:00 - 21:00</p>
              <p>CN: 9:00 - 20:00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 EyewearHut. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;
