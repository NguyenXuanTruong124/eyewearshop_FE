import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Brands.css';

const Brands: React.FC = () => {
  const navigate = useNavigate();
  const brands = [
    { id: 1, name: 'Ray-Ban', count: '45 sản phẩm', desc: 'Thương hiệu kính mát hàng đầu thế giới với lịch sử hơn 80 năm.', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500' },
    { id: 2, name: 'Oakley', count: '38 sản phẩm', desc: 'Thương hiệu kính thể thao cao cấp với công nghệ tròng kính tiên tiến.', img: 'https://images.unsplash.com/photo-1511499767390-91f197606024?w=500' },
    { id: 3, name: 'Prada', count: '32 sản phẩm', desc: 'Thương hiệu thời trang cao cấp từ Ý với thiết kế sang trọng.', img: 'https://images.unsplash.com/photo-1508243529287-e21914733111?w=500' },
    { id: 4, name: 'Gucci', count: '28 sản phẩm', desc: 'Biểu tượng của sự xa hoa và phong cách thời trang đẳng cấp.', img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500' },
    { id: 5, name: 'Essilor', count: '52 sản phẩm', desc: 'Thương hiệu tròng kính hàng đầu thế giới với công nghệ vượt trội.', img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500' },
    { id: 6, name: 'Hoya', count: '41 sản phẩm', desc: 'Công nghệ tròng kính chính xác từ Nhật Bản.', img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500' },
    { id: 7, name: 'Acuvue', count: '24 sản phẩm', desc: 'Thương hiệu lens kính áp tròng uy tín hàng đầu.', img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500' },
    { id: 8, name: 'Freshlook', count: '19 sản phẩm', desc: 'Lens kính áp tròng màu đa dạng và an toàn.', img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500' },
  ];

  return (
    <div className="brands-page">
      <section className="brands-hero">
        <h1>Nhãn Hiệu</h1>
        <p>Khám phá các thương hiệu kính mắt hàng đầu thế giới</p>
      </section>

      <section className="brands-container">
        <div className="brands-grid">
          {brands.map(brand => (
            <div key={brand.id} className="brand-item-card">
              <div className="brand-img-box">
                <img src={brand.img} alt={brand.name} />
                <div className="brand-overlay">
                  <h3>{brand.name}</h3>
                  <p>{brand.count}</p>
                </div>
              </div>
              <div className="brand-body">
                <p>{brand.desc}</p>
                <button className="btn-view-brand" onClick={() => navigate('/products')}>Xem sản phẩm</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="why-choose-us">
        <h2>Tại sao chọn chúng tôi?</h2>
        <div className="why-grid">
          <div className="why-item">
            <span className="why-icon">✔️</span>
            <h4>100% Chính hãng</h4>
            <p style={{fontSize: '13px', color: '#666'}}>Cam kết cung cấp sản phẩm chính hãng từ các thương hiệu uy tín</p>
          </div>
          <div className="why-item">
            <span className="why-icon">🏆</span>
            <h4>Bảo hành chính hãng</h4>
            <p style={{fontSize: '13px', color: '#666'}}>Bảo hành 12 tháng từ nhà sản xuất với dịch vụ hậu mãi tốt nhất</p>
          </div>
          <div className="why-item">
            <span className="why-icon">💰</span>
            <h4>Giá tốt nhất</h4>
            <p style={{fontSize: '13px', color: '#666'}}>Cam kết giá cạnh tranh với nhiều chương trình ưu đãi hấp dẫn</p>
          </div>
        </div>
      </section>

      <section className="brands-footer-banner">
        <h2>Tìm thấy thương hiệu yêu thích?</h2>
        <p>Khám phá ngay bộ sưu tập đa dạng của chúng tôi</p>
        <button className="btn-white" onClick={() => navigate('/products')}>Xem tất cả sản phẩm</button>
      </section>
    </div>
  );
};

export default Brands;