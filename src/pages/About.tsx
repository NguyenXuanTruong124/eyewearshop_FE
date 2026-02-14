import React from 'react';
import './styles/About.css';

const About: React.FC = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <h1>Về Chúng Tôi</h1>
        <p>Hành trình mang đến những sản phẩm kính mắt chất lượng cao cho người Việt Nam</p>
      </section>

      {/* Our Story */}
      <section className="about-story">
        <div className="story-text">
          <h2>Câu chuyện của chúng tôi</h2>
          <p>EyewearHut được thành lập vào năm 2018 với sứ mệnh mang đến những sản phẩm kính mắt chất lượng cao, phong cách và giá cả hợp lý cho người tiêu dùng Việt Nam.</p>
          <p>Chúng tôi tin rằng mỗi người đều xứng đáng có được một đôi kính hoàn hảo, không chỉ bảo vệ đôi mắt mà còn thể hiện phong cách cá nhân. Đó là lý do chúng tôi không ngừng nỗ lực để tuyển chọn và cung cấp những sản phẩm tốt nhất từ các thương hiệu uy tín trên thế giới.</p>
        </div>
        <div className="story-image">
          <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800" alt="EyewearHut Story" />
        </div>
      </section>

      {/* Statistics */}
      <section className="about-stats">
        <div className="stat-item"><h3>10+</h3><p>Năm kinh nghiệm</p></div>
        <div className="stat-item"><h3>50K+</h3><p>Khách hàng hài lòng</p></div>
        <div className="stat-item"><h3>100+</h3><p>Sản phẩm đa dạng</p></div>
        <div className="stat-item"><h3>20+</h3><p>Thương hiệu cao cấp</p></div>
      </section>

      {/* Core Values */}
      <section className="core-values">
        <h2>Giá trị cốt lõi</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🏅</div>
            <h4>Chất lượng hàng đầu</h4>
            <p style={{fontSize:'13px', color:'#666'}}>Cam kết cung cấp sản phẩm chính hãng, chất lượng cao từ các thương hiệu uy tín.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">👥</div>
            <h4>Khách hàng là trọng tâm</h4>
            <p style={{fontSize:'13px', color:'#666'}}>Luôn đặt sự hài lòng của khách hàng lên hàng đầu với dịch vụ tận tâm.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">💡</div>
            <h4>Đổi mới không ngừng</h4>
            <p style={{fontSize:'13px', color:'#666'}}>Cập nhật những xu hướng mới nhất để mang đến trải nghiệm tốt nhất.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">📈</div>
            <h4>Phát triển bền vững</h4>
            <p style={{fontSize:'13px', color:'#666'}}>Xây dựng mối quan hệ lâu dài với khách hàng và đối tác.</p>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="about-team">
        <h2>Đội ngũ lãnh đạo</h2>
        <div className="team-grid">
          <div className="team-member">
            <img src="https://i.pravatar.cc/300?u=1" alt="Nguyen Van A" />
            <h4>Nguyễn Văn A</h4>
            <p>CEO & Founder</p>
          </div>
          <div className="team-member">
            <img src="https://i.pravatar.cc/300?u=2" alt="Tran Thi B" />
            <h4>Trần Thị B</h4>
            <p>Giám đốc Marketing</p>
          </div>
          <div className="team-member">
            <img src="https://i.pravatar.cc/300?u=3" alt="Le Van C" />
            <h4>Lê Văn C</h4>
            <p>Trưởng phòng Kinh doanh</p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="about-cta">
        <h2>Sẵn sàng tìm kiếm đôi kính hoàn hảo?</h2>
        <p>Ghé thăm cửa hàng hoặc liên hệ với chúng tôi ngay hôm nay</p>
        <div className="cta-btns">
          <button className="cta-white">Xem sản phẩm</button>
          <button className="cta-outline">Liên hệ ngay</button>
        </div>
      </section>
    </div>
  );
};

export default About;