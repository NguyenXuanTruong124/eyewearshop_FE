import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
import './styles/Cart.css';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hàm lấy dữ liệu giỏ hàng từ API
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      // Đợi 500ms để đảm bảo Server Azure đã cập nhật xong Session
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await axiosClient.get('/cart');
      setCartData(response.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    // Lắng nghe sự kiện để cập nhật giỏ hàng tức thì
    window.addEventListener('cartUpdated', fetchCart);
    return () => window.removeEventListener('cartUpdated', fetchCart);
  }, [fetchCart]);

  const handleUpdateQty = async (variantId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await axiosClient.put(`/cart/items/${variantId}`, { quantity: newQty });
      fetchCart();
    } catch (error) { console.error("Lỗi cập nhật số lượng:", error); }
  };

  const handleRemoveItem = async (variantId: number) => {
    if (window.confirm("Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      try {
        await axiosClient.delete(`/cart/items/${variantId}`);
        fetchCart();
      } catch (error) { console.error("Lỗi xóa sản phẩm:", error); }
    }
  };

  if (loading) return <div className="cart-page" style={{textAlign:'center', padding: '100px'}}>Đang tải dữ liệu giỏ hàng...</div>;
  
  // Kiểm tra mảng items theo đúng cấu trúc Swagger
  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="cart-page" style={{textAlign:'center', padding: '100px'}}>
        <h2>Giỏ hàng của bạn đang trống</h2>
        <Link to="/products" className="btn-continue" style={{display:'inline-block', marginTop: '20px'}}>Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Hiển thị số lượng từ summary.itemCount */}
        <h2 style={{fontSize: '28px', fontWeight: 700}}>Giỏ hàng của bạn</h2>
        <p style={{color: '#888', marginTop: '5px'}}>{cartData.summary?.itemCount || 0} sản phẩm</p>

        <div className="cart-layout">
          <div className="cart-items-list">
            {cartData.items.map((item: any) => (
              <div className="cart-item" key={item.variantId}>
                {/* Lấy ảnh từ variant -> product */}
                <img 
                  src={item.variant?.product?.primaryImageUrl || "https://placehold.co/400x400?text=Kính"} 
                  className="cart-item-img" 
                  alt={item.variant?.product?.productName}
                  onError={(e) => e.currentTarget.src = 'https://placehold.co/400x400?text=EyewearHut'} 
                />
                
                <div className="cart-item-info">
                  {/* SỬA LỖI: Truy cập đúng cấp dữ liệu lồng nhau */}
                  <h4 style={{fontWeight: 700}}>{item.variant?.product?.productName}</h4>
                  <p style={{color: '#999', fontSize: '13px', margin: '5px 0'}}>
                    Màu: {item.variant?.color} | Đơn giá: {item.variant?.price?.toLocaleString()}đ
                  </p>
                  
                  <div className="quantity-btns">
                    <button onClick={() => handleUpdateQty(item.variantId, item.quantity - 1)}>-</button>
                    <input type="text" value={item.quantity} readOnly />
                    <button onClick={() => handleUpdateQty(item.variantId, item.quantity + 1)}>+</button>
                  </div>
                </div>

                {/* Tính tổng tiền dựa trên số lượng và giá của variant */}
                <div className="cart-item-price">
                  {(item.variant?.price * item.quantity).toLocaleString()}đ
                </div>

                <button 
                  onClick={() => handleRemoveItem(item.variantId)}
                  style={{position: 'absolute', top: '25px', right: '25px', border: 'none', background: 'none', color: '#ccc', cursor: 'pointer', fontSize: '20px'}}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3 style={{marginBottom: '25px', fontSize: '20px'}}>Tóm tắt đơn hàng</h3>
            <div className="summary-row" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
              <span>Tạm tính</span>
              <span style={{fontWeight: 600}}>{cartData.summary?.subTotal?.toLocaleString()}đ</span>
            </div>
            <div className="summary-row" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
              <span>Phí vận chuyển</span>
              <span style={{color: '#2ecc71', fontWeight: 700}}>Miễn phí</span>
            </div>
            <div className="summary-row" style={{borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px', display: 'flex', justifyContent: 'space-between'}}>
              <span style={{fontWeight: 700, fontSize: '18px'}}>Tổng cộng</span>
              <span className="total-price" style={{color: '#cc0000', fontSize: '24px', fontWeight: 800}}>
                {cartData.summary?.subTotal?.toLocaleString()}đ
              </span>
            </div>
            
            <button 
              className="btn-checkout" 
              onClick={() => navigate('/checkout')}
              style={{width: '100%', background: '#cc0000', color: '#fff', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 700, marginTop: '20px', cursor: 'pointer'}}
            >
              Tiến hành thanh toán
            </button>
            <Link to="/products" className="btn-continue" style={{display: 'block', textAlign: 'center', marginTop: '15px', color: '#666', textDecoration: 'none', fontSize: '14px'}}>
              Tiếp tục mua sắm
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;