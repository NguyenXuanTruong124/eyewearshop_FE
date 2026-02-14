import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/ProductDetail.css';

const ProductDetail: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Đen');

  return (
    <div className="product-detail-page">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">Trang chủ</Link> <span>/</span> 
        <Link to="/products">Kính mát</Link> <span>/</span> 
        <strong>Kính Mát Ray-Ban Classic Aviator</strong>
      </div>

      <div className="product-main">
        {/* Gallery */}
        <div className="product-gallery">
          <img 
            src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800" 
            alt="Ray-Ban Classic" 
            className="main-img"
          />
          <div className="thumb-list">
            <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100" className="thumb-img active" alt="thumb" />
            <img src="https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=100" className="thumb-img" alt="thumb" />
            <img src="https://images.unsplash.com/photo-1511499767390-91f197606024?w=100" className="thumb-img" alt="thumb" />
          </div>
        </div>

        {/* Order Info */}
        <div className="product-order-info">
          <p className="brand-label">Ray-Ban</p>
          <h1>Kính Mát Ray-Ban Classic Aviator</h1>

          <div className="price-row">
            <span className="current-price">2.500.000đ</span>
            <span className="old-price">3.200.000đ</span>
            <span className="sale-tag">-22%</span>
          </div>

          <div className="option-group">
            <label>Màu sắc</label>
            <div className="color-btns">
              {['Đen', 'Vàng', 'Bạc'].map(color => (
                <button 
                  key={color}
                  className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label>Số lượng</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="text" value={quantity} readOnly />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="action-btns">
            <button className="add-cart-btn">🛒 Thêm vào giỏ hàng</button>
          </div>

          <div className="highlights">
            <p><strong>Đặc điểm nổi bật:</strong></p>
            <ul>
              <li>Bảo vệ UV400 tuyệt đối</li>
              <li>Tròng Polarized chống chói</li>
              <li>Gọng kim loại cao cấp, bền bỉ</li>
              <li>Thiết kế nhẹ, thoải mái khi đeo</li>
              <li>Bảo hành chính hãng 12 tháng</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Description & Specs */}
      <div className="info-tabs">
        <div className="tab-content">
          <h3>Mô tả sản phẩm</h3>
          <p>Kính mát Ray-Ban Classic Aviator là biểu tượng của phong cách thời trang vượt thời gian. Thiết kế cổ điển với chất liệu cao cấp, mang đến sự bảo vệ tối ưu cho đôi mắt của bạn.</p>
          <p>Được chế tác từ những vật liệu nhẹ nhất, kính mát Ray-Ban Classic không chỉ là phụ kiện thời trang mà còn là sự đầu tư cho sức khỏe đôi mắt của bạn. Với công nghệ tròng polarized tiên tiến, sản phẩm giúp giảm thiểu ánh sáng chói và bảo vệ mắt khỏi tia UV có hại.</p>
        </div>
        
        <div className="tab-content">
          <h3>Thông số kỹ thuật</h3>
          <table className="specs-table">
            <tbody>
              <tr><td>Chất liệu gọng</td><td>Kim loại cao cấp</td></tr>
              <tr><td>Chất liệu tròng</td><td>Polycarbonate</td></tr>
              <tr><td>Kích thước</td><td>58-14-140 mm</td></tr>
              <tr><td>Trọng lượng</td><td>31g</td></tr>
              <tr><td>Xuất xứ</td><td>Italy</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;