import React from 'react';
import './styles/Contact.css';

const Contact: React.FC = () => {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1>Liên Hệ Với Chúng Tôi</h1>
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
      </section>

      <div className="contact-container">
        {/* Thông tin liên hệ */}
        <div className="contact-info-cards">
          <div className="info-card">
            <div className="info-icon">📍</div>
            <div className="info-content">
              <h4>Địa chỉ</h4>
              <p>123 Đường ABC, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">📞</div>
            <div className="info-content">
              <h4>Điện thoại</h4>
              <p>1900-xxxx</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">✉️</div>
            <div className="info-content">
              <h4>Email</h4>
              <p>contact@eyewearhut.vn</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">⏰</div>
            <div className="info-content">
              <h4>Giờ làm việc</h4>
              <p>T2 - T7: 8:00 - 21:00<br/>CN: 9:00 - 20:00</p>
            </div>
          </div>
        </div>

        {/* Form gửi tin nhắn */}
        <div className="contact-form-box">
          <h3>Gửi tin nhắn cho chúng tôi</h3>
          <form>
            <div className="form-grid">
              <div className="form-field">
                <label>Họ và tên <span>*</span></label>
                <input type="text" placeholder="Nguyễn Văn A" required />
              </div>
              <div className="form-field">
                <label>Email <span>*</span></label>
                <input type="email" placeholder="email@example.com" required />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Số điện thoại <span>*</span></label>
                <input type="tel" placeholder="0123456789" required />
              </div>
              <div className="form-field">
                <label>Chủ đề <span>*</span></label>
                <input type="text" placeholder="Tư vấn sản phẩm" required />
              </div>
            </div>
            <div className="form-field">
              <label>Nội dung <span>*</span></label>
              <textarea rows={5} placeholder="Nhập nội dung tin nhắn của bạn..." required></textarea>
            </div>
            <button type="submit" className="btn-send">Gửi tin nhắn</button>
          </form>
        </div>
      </div>

      {/* Bản đồ */}
      <section className="map-section">
        <h3>Vị trí cửa hàng</h3>
        <div className="map-placeholder">
          Bản đồ hiển thị vị trí cửa hàng
        </div>
      </section>

      {/* Câu hỏi thường gặp */}
      <section className="faq-section">
        <h3>Câu hỏi thường gặp</h3>
        <div className="faq-item">
          <h4>Làm thế nào để đặt hàng online?</h4>
          <p>Bạn có thể duyệt sản phẩm trên website, chọn sản phẩm yêu thích và thêm vào giỏ hàng, sau đó tiến hành thanh toán.</p>
        </div>
        <div className="faq-item">
          <h4>Chính sách bảo hành như thế nào?</h4>
          <p>Tất cả sản phẩm đều được bảo hành chính hãng trong vòng 12 tháng. Bảo hành bao gồm các lỗi kỹ thuật do nhà sản xuất.</p>
        </div>
        <div className="faq-item">
          <h4>Có thể đổi trả sản phẩm không?</h4>
          <p>Chúng tôi chấp nhận đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên vẹn, chưa qua sử dụng.</p>
        </div>
      </section>
    </div>
  );
};

export default Contact;