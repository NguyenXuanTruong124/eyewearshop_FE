import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Products.css';
import { products } from '../data/products';

const Products: React.FC = () => {
  const navigate = useNavigate();
  const productData = products;

  return (
    <div className="products-page">
      {/* Sidebar Filters */}
      <aside className="sidebar-filter">
        <div className="filter-section">
          <h3>Loại sản phẩm</h3>
          <ul className="filter-list">
            <li className="filter-item"><input type="checkbox" /> Gọng kính</li>
            <li className="filter-item"><input type="checkbox" /> Tròng kính</li>
            <li className="filter-item"><input type="checkbox" /> Kính mát</li>
          </ul>
        </div>
        <div className="filter-section">
          <h3>Khoảng giá</h3>
          <ul className="filter-list">
            <li className="filter-item">Dưới 500k</li>
            <li className="filter-item">500k - 1 triệu</li>
            <li className="filter-item">Trên 2 triệu</li>
          </ul>
        </div>
        <div className="filter-section">
          <h3>Thương hiệu</h3>
          <ul className="filter-list">
            <li className="filter-item">Ray-Ban</li>
            <li className="filter-item">Oakley</li>
            <li className="filter-item">Gucci</li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="products-content">
        <div className="products-header">
          <h2>Sản Phẩm</h2>
          <p style={{color: '#888', fontSize: '14px'}}>Tìm thấy {productData.length} sản phẩm</p>
          
        </div>

        <div className="product-grid-main">
          {productData.map(item => (
            <div key={item.id} className="product-card-item">
              <div className="img-wrapper" onClick={() => navigate(`/product/${item.id}`)} style={{cursor: 'pointer'}}>
                {item.sale && <span className="sale-label">{item.sale}</span>}
                <img src={item.img} alt={item.name} />
              </div>
              <div className="info-wrapper">
                <p className="brand-name">{item.brand}</p>
                <h4 className="product-name">{item.name}</h4>
                <div className="rating">⭐ {item.rating}</div>
                <div className="price-container">
                  <span className="current-p">{item.price}</span>
                  {item.oldPrice && <span className="old-p">{item.oldPrice}</span>}
                </div>
                <div style={{display: 'flex', gap: 8}}>
                  <button className="btn-add">Thêm vào giỏ</button>
                  <button className="btn-view" onClick={() => navigate(`/product/${item.id}`)}>Xem</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Products;