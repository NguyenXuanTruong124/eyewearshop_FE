import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Cart.css';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const price = 1500000;
  const [requiresPrescription, setRequiresPrescription] = useState(true);

  const subtotal = price * qty;

  const handleCheckout = () => {
    navigate('/checkout', { state: { requiresPrescription } });
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2 style={{fontSize: '28px', fontWeight: 700}}>Giỏ hàng của bạn</h2>
        <p style={{color: '#888', marginTop: '5px'}}>1 sản phẩm</p>

        <div className="cart-layout">
          <div className="cart-items-list">
            <div className="cart-item">
              <img src="https://images.unsplash.com/photo-1508243529287-e21914733111?w=400" className="cart-item-img" alt="product" />
              <div className="cart-item-info">
                <h4>Kính Thời Trang Modern</h4>
                <p style={{color: '#999', fontSize: '13px'}}>Kính thời trang</p>
                <div className="quantity-btns">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                  <input type="text" value={qty} readOnly />
                  <button onClick={() => setQty(qty + 1)}>+</button>
                </div>
                <label style={{display:'block', marginTop:8}}>
                  <input type="checkbox" checked={requiresPrescription} onChange={e => setRequiresPrescription(e.target.checked)} /> Sản phẩm cần nhập độ kính
                </label>
              </div>
              <div className="cart-item-price">{(price * qty).toLocaleString()}đ</div>
              <button style={{position: 'absolute', top: '25px', right: '25px', border: 'none', background: 'none', color: '#ccc', cursor: 'pointer', fontSize: '20px'}}>🗑️</button>
            </div>
          </div>

          <aside className="cart-summary">
            <h3 style={{marginBottom: '25px', fontSize: '20px'}}>Tóm tắt đơn hàng</h3>
            <div className="summary-row">
              <span>Tạm tính</span>
              <span style={{fontWeight: 600}}>{subtotal.toLocaleString()}đ</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span style={{color: '#2ecc71', fontWeight: 700}}>Miễn phí</span>
            </div>
            <div className="summary-row" style={{borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px'}}>
              <span style={{fontWeight: 700, fontSize: '18px'}}>Tổng cộng</span>
              <span className="total-price">{subtotal.toLocaleString()}đ</span>
            </div>
            
            <button className="btn-checkout" onClick={handleCheckout}>Tiến hành thanh toán</button>
            <Link to="/products" className="btn-continue">Tiếp tục mua sắm</Link>

            <div style={{marginTop: '25px', fontSize: '13px', color: '#666', lineHeight: '2'}}>
               <p>✓ Bảo hành chính hãng 12 tháng</p>
               <p>✓ Đổi trả trong 7 ngày</p>
               <p>✓ Thanh toán an toàn</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;