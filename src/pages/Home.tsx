import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './styles/Home.css';
import axiosClient from '../API_BE/axiosClient';

// Import generated images
import heroImg from '../assets/hero_banner_eyewear_1773767512965.png';
import catSunglasses from '../assets/category_sunglasses_1773767628010.png';
import catOptical from '../assets/category_optical_frames_1773767676165.png';
import catAccessories from '../assets/category_accessories_1773767719225.png';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await axiosClient.get('/products?page=1&limit=4');
        if (res.data && res.data.items) {
          setFeaturedProducts(res.data.items);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm nổi bật:", error);
      }
    };
    fetchTopProducts();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background" style={{ backgroundImage: `url(${heroImg})` }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-tagline">Kiến tạo phong cách riêng</span>
          <h1>Đẳng cấp <br />Trong từng góc nhìn</h1>
          <p>Khám phá bộ sưu tập kính mắt cao cấp từ những thương hiệu hàng đầu thế giới. Chúng tôi mang đến sự kết hợp hoàn hảo giữa công nghệ và thời trang.</p>
          <div className="hero-btns">
            <button onClick={() => navigate('/products')} className="btn-primary">Khám phá ngay</button>
            <button onClick={() => navigate('/products')} className="btn-outline">Bộ sưu tập mới</button>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="service-bar">
        <div className="service-item">
          <div className="service-icon-wrap">🛡️</div>
          <div className="service-text">
            <h4>Bảo hành trọn đời</h4>
            <p>Hỗ trợ kỹ thuật 24/7</p>
          </div>
        </div>
        <div className="service-item">
          <div className="service-icon-wrap">🚚</div>
          <div className="service-text">
            <h4>Giao hàng hỏa tốc</h4>
            <p>Miễn phí cho đơn từ 2tr</p>
          </div>
        </div>
        <div className="service-item">
          <div className="service-icon-wrap">💎</div>
          <div className="service-text">
            <h4>Cam kết chính hãng</h4>
            <p>Hoàn tiền 200% nếu giả</p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories-section">
        <div className="section-header">
          <span className="section-label">Danh mục</span>
          <h2 className="section-title-huge">Tìm phong cách của bạn</h2>
        </div>
        
        <div className="category-grid">
          <div className="category-card" onClick={() => navigate('/products?type=SUNGLASSES')}>
            <img src={catSunglasses} alt="Sunglasses" className="category-img" />
            <div className="category-content">
              <h3>Kính Mát Thời Thượng</h3>
              <span>Xem 150+ sản phẩm &rarr;</span>
            </div>
          </div>
          <div className="category-card" onClick={() => navigate('/products?type=FRAME')}>
            <img src={catOptical} alt="Optical" className="category-img" />
            <div className="category-content">
              <h3>Gọng Kính Cao Cấp</h3>
              <span>Xem 300+ sản phẩm &rarr;</span>
            </div>
          </div>
          <div className="category-card" onClick={() => navigate('/products?type=ACCESSORY')}>
            <img src={catAccessories} alt="Accessories" className="category-img" />
            <div className="category-content">
              <h3>Phụ Kiện Sang Trọng</h3>
              <span>Xem 50+ sản phẩm &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <span className="section-label">Sản phẩm nổi bật</span>
          <h2 className="section-title-huge">Lựa chọn hàng đầu</h2>
        </div>

        <div className="products-grid">
          {featuredProducts.map(p => (
            <div key={p.productId} className="product-card">
              {p.discountPrice && <div className="sale-badge">SALE</div>}
              <div className="product-img-wrap">
                <img src={p.primaryImageUrl || 'https://placehold.co/400'} alt={p.productName} className="product-img" />
              </div>
              <div className="product-info">
                <h4>{p.productName}</h4>
                <div className="price-box">
                  <span className="price-main">{p.price.toLocaleString()}đ</span>
                  {p.discountPrice && <span className="price-old">{(p.price * 1.2).toLocaleString()}đ</span>}
                </div>
                <button className="btn-add-cart" onClick={() => navigate(`/product/${p.productId}`)}>Xem chi tiết</button>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Link to="/products" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', borderBottom: '2px solid' }}>XEM TẤT CẢ SẢN PHẨM</Link>
        </div>
      </section>

      {/* Premium Offer Banner */}
      <section className="offer-section">
        <div className="promo-banner">
          <div className="promo-content">
            <h2>Đăng ký thành viên</h2>
            <p>Nhận ngay voucher giảm giá 15% cho đơn hàng đầu tiên và cập nhật những bộ sưu tập giới hạn sớm nhất.</p>
            <Link to="/login" className="btn-promo">Đăng ký ngay</Link>
          </div>
          <div className="promo-visual">
            {/* Visual element or image could go here */}
          </div>
        </div>
      </section>

      {/* Trust Badges / Brands */}
      <section style={{ padding: '80px 0', borderTop: '1px solid #eee' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '60px', opacity: '0.4', filter: 'grayscale(1)', flexWrap: 'wrap' }}>
          <h3 style={{ fontFamily: 'Playfair Display' }}>RAY·BAN</h3>
          <h3 style={{ fontFamily: 'Playfair Display' }}>GUCCI</h3>
          <h3 style={{ fontFamily: 'Playfair Display' }}>OAKLEY</h3>
          <h3 style={{ fontFamily: 'Playfair Display' }}>PRADA</h3>
          <h3 style={{ fontFamily: 'Playfair Display' }}>DIOR</h3>
        </div>
      </section>
    </div>
  );
};

export default Home;