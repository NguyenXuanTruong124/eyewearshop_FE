import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const featuredProducts = [
    { id: 1, name: 'Kính Mát Classic', img: 'https://images.unsplash.com/photo-1511499767390-91f197606024?w=500', price: '799.000đ', oldPrice: '' },
    { id: 2, name: 'Gọng Kính Titanium', img: 'https://images.unsplash.com/photo-1508243529287-e21914733111?w=500', price: '1.800.000đ', oldPrice: '2.200.000đ' },
    { id: 3, name: 'Kính Thời Trang', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', price: '1.250.000đ', oldPrice: '' },
    { id: 4, name: 'Phụ Kiện Kính', img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500', price: '150.000đ', oldPrice: '' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <h1>Khám phá thế giới kính mắt</h1>
        <p>Chất lượng cao, giá cả phải chăng</p>
        <button onClick={() => navigate('/products')} className="btn-cta">Mua ngay</button>
      </section>

      {/* Service Bar */}
      <section className="service-bar">
        <div className="service-item">
          <span className="service-icon">🛡️</span>
          <div><strong>Bảo hành 12 tháng</strong><p style={{fontSize:'12px', color:'#666'}}>Cam kết chất lượng</p></div>
        </div>
        <div className="service-item">
          <span className="service-icon">🚚</span>
          <div><strong>Miễn phí vận chuyển</strong><p style={{fontSize:'12px', color:'#666'}}>Đơn hàng trên 5 triệu</p></div>
        </div>
        <div className="service-item">
          <span className="service-icon">🎧</span>
          <div><strong>Hỗ trợ 24/7</strong><p style={{fontSize:'12px', color:'#666'}}>Tư vấn nhiệt tình</p></div>
        </div>
      </section>

      {/* Categories */}
      <h2 className="section-title">Danh mục sản phẩm</h2>
      <div className="category-grid">
        <div className="category-card"><span>🕶️</span><p>Kính Mát</p></div>
        <div className="category-card"><span>👓</span><p>Gọng Kính</p></div>
        <div className="category-card"><span>😎</span><p>Kính Thời Trang</p></div>
        <div className="category-card"><span>💼</span><p>Phụ Kiện</p></div>
      </div>

      {/* Featured Products */}
      <div style={{display:'flex', justifyContent:'space-between', padding:'0 5%', alignItems:'center'}}>
        <h2 className="section-title">Sản phẩm nổi bật</h2>
        <button type="button" className="link-button" style={{color:'#cc0000', fontSize:'14px', background:'none', border:'none', cursor:'pointer'}} onClick={() => navigate('/products')}>Xem tất cả &gt;</button>
      </div>
      <div className="products-grid">
        {featuredProducts.map(p => (
          <div key={p.id} className="product-card">
            <img src={p.img} alt={p.name} className="product-img" />
            <div className="product-info">
              <h4>{p.name}</h4>
              <div className="price-row">
                <span className="current-price">{p.price}</span>
                {p.oldPrice && <span className="old-price">{p.oldPrice}</span>}
              </div>
              <button className="add-btn">Thêm vào giỏ</button>
            </div>
          </div>
        ))}
      </div>

      {/* Offer Banner */}
      <section className="offer-banner">
        <h2>Ưu đãi đặc biệt</h2>
        <p>Giảm giá 20% cho khách hàng mới</p>
        <button style={{background:'white', color:'#cc0000', padding:'10px 25px', marginTop:'20px', borderRadius:'4px', fontWeight:'bold', border:'none'}}>Mua sắm ngay</button>
      </section>
    </div>
  );
};

export default Home;