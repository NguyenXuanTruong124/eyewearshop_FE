import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import './styles/Cart.css';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState<any>({ items: [], summary: { subTotal: 0, itemCount: 0 } });
  const [loading, setLoading] = useState(true);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<boolean>(false);
  const [removeConfirmVariantId, setRemoveConfirmVariantId] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/cart');
      console.log('✅ [Cart] Phản hồi từ Server:', response.data);

      if (response?.data && response.data.items) {
        setCartData(response.data);
      } else {
        setCartData({ items: [], summary: { subTotal: 0, itemCount: 0 } });
      }
    } catch (error: any) {
      console.error('❌ [Cart] Lỗi API /cart:', error.message);
      setCartData({ items: [], summary: { subTotal: 0, itemCount: 0 } });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    const handler = () => {
      console.log('🔔 [Cart] Nhận tín hiệu cập nhật giỏ hàng...');
      fetchCart();
    };
    window.addEventListener('cartUpdated', handler);
    return () => window.removeEventListener('cartUpdated', handler);
  }, [fetchCart]);

  const handleUpdateQty = async (variantId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await axiosClient.put(`/cart/items/${variantId}`, { quantity: newQty });
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err: any) {
      console.error('❌ [Cart] Lỗi cập nhật số lượng:', err.message);
      toast.error("Lỗi cập nhật số lượng.");
    }
  };

  const confirmRemoveItem = async () => {
    if (removeConfirmVariantId === null) return;
    const variantId = removeConfirmVariantId;
    setShowRemoveConfirm(false);

    try {
      await axiosClient.delete(`/cart/items/${variantId}`);
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Đã xóa sản phẩm thành công!');
    } catch (err: any) {
      console.error('❌ [Cart] Lỗi xóa sản phẩm:', err.message);
      toast.error('Lỗi khi xóa sản phẩm.');
    }
  };

  const handleRemoveItem = (variantId: number) => {
    setRemoveConfirmVariantId(variantId);
    setShowRemoveConfirm(true);
  };

  const handleClearCart = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = async () => {
    setShowClearConfirm(false);
    try {
      await axiosClient.delete('/cart');
      setCartData({ items: [], summary: { subTotal: 0, itemCount: 0 } });
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Giỏ hàng đã được làm sạch!');
    } catch (err: any) {
      console.error('❌ [Cart] Lỗi dọn dẹp giỏ hàng:', err.message);
      toast.error('Không thể xóa giỏ hàng.');
    }
  };

  if (loading) return <div className="cart-loading-state">Đang tải dữ liệu giỏ hàng...</div>;

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="cart-empty-state" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
        <h2>Giỏ hàng của bạn đang trống</h2>
        <Link to="/products" className="btn-shop-now" style={{ background: '#cc0000', color: 'white', padding: '12px 30px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2 className="cart-header-title">Giỏ hàng của bạn</h2>
        <p className="cart-item-count">{cartData.summary?.itemCount || 0} sản phẩm</p>

        <div className="cart-actions-toolbar">
          <button className="btn-secondary" onClick={handleClearCart}>Xóa toàn bộ</button>
        </div>

        <div className="cart-layout">
          <div className="cart-items-list">
            {cartData.items.map((item: any) => (
              <div className="cart-item" key={item.variantId}>
                <img src={item.variant?.product?.primaryImageUrl || 'https://placehold.co/400x400?text=EyewearHut'}
                  className="cart-item-img" alt="product" />

                <div className="cart-item-info">
                  <h4>{item.variant?.product?.productName}</h4>
                  <p className="cart-item-details">
                    Màu: {item.variant?.color} | Đơn giá: {(item.variant?.price || 0).toLocaleString()}đ
                  </p>
                  <div className="quantity-btns">
                    <button onClick={() => handleUpdateQty(item.variantId, item.quantity - 1)}>-</button>
                    <input type="text" value={item.quantity} readOnly />
                    <button onClick={() => handleUpdateQty(item.variantId, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div className="cart-item-price">{((item.variant?.price || 0) * item.quantity).toLocaleString()}đ</div>
                <button onClick={() => handleRemoveItem(item.variantId)} className="delete-item-btn">🗑️</button>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3 className="summary-title">Tóm tắt đơn hàng</h3>
            <div className="summary-row"><span>Tạm tính</span><span>{(cartData.summary?.subTotal || 0).toLocaleString()}đ</span></div>
            <div className="summary-row"><span>Vận chuyển</span><span className="shipping-free">Miễn phí</span></div>
            <div className="summary-total-row"><span>Tổng cộng</span><span>{(cartData.summary?.subTotal || 0).toLocaleString()}đ</span></div>
            <button className="btn-checkout" onClick={() => {
              navigate('/checkout');
            }}>Tiến hành thanh toán</button>
            <Link to="/products" className="btn-continue-shopping" style={{ display: 'block', textAlign: 'center', marginTop: '15px' }}>Tiếp tục mua sắm</Link>
          </aside>
        </div>
      </div>

      <ConfirmModal isOpen={showRemoveConfirm} title="Xóa" message="Xóa sản phẩm này?" onConfirm={confirmRemoveItem} onCancel={() => setShowRemoveConfirm(false)} isDangerous={true} />
      <ConfirmModal isOpen={showClearConfirm} title="Xóa hết" message="Xóa toàn bộ sản phẩm?" onConfirm={confirmClearCart} onCancel={() => setShowClearConfirm(false)} isDangerous={true} />
    </div>
  );
};

export default Cart;