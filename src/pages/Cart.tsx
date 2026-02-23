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
  const [usingLocal, setUsingLocal] = useState<boolean>(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<boolean>(false);
  const [removeConfirmVariantId, setRemoveConfirmVariantId] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const getLocalCart = () => {
    try {
      const raw = localStorage.getItem('localCart');
      return raw ? JSON.parse(raw) : { items: [], summary: { subTotal: 0, itemCount: 0 } };
    } catch (e) { 
      return { items: [], summary: { subTotal: 0, itemCount: 0 } }; 
    }
  };

  const saveLocalCart = (data: any) => {
    localStorage.setItem('localCart', JSON.stringify(data));
  };

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    
    // Nếu không có token, lấy dữ liệu từ local và dừng tại đây
    if (!token) {
      setCartData(getLocalCart());
      setUsingLocal(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosClient.get('/cart');

      if (response?.data && response.data.items && response.data.items.length > 0) {
        setCartData(response.data);
        saveLocalCart(response.data);
        setUsingLocal(false);
      } else {
        // Nếu server trả về giỏ hàng rỗng, kiểm tra xem local có gì không
        const local = getLocalCart();
        setCartData(local);
        setUsingLocal(local.items.length > 0);
      }
    } catch (error) {
      // Lỗi kết nối hoặc 401: fallback về local
      setCartData(getLocalCart());
      setUsingLocal(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    const handler = () => fetchCart();
    window.addEventListener('cartUpdated', handler);
    return () => window.removeEventListener('cartUpdated', handler);
  }, [fetchCart]);

  const handleUpdateQty = async (variantId: number, newQty: number) => {
    if (newQty < 1) return;
    if (usingLocal) {
      const local = getLocalCart();
      const it = local.items.find((i: any) => i.variantId === variantId);
      if (it) it.quantity = newQty;
      local.summary.itemCount = local.items.reduce((s: number, it: any) => s + (it.quantity || 0), 0);
      local.summary.subTotal = local.items.reduce((s: number, it: any) => s + ((it.variant?.price || 0) * (it.quantity || 0)), 0);
      saveLocalCart(local);
      setCartData(local);
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    try {
      await axiosClient.put(`/cart/items/${variantId}`, { quantity: newQty });
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      toast.error("Lỗi cập nhật số lượng.");
    }
  };

  const confirmRemoveItem = async () => {
    if (removeConfirmVariantId === null) return;
    const variantId = removeConfirmVariantId;
    setShowRemoveConfirm(false);

    if (usingLocal) {
      const local = getLocalCart();
      local.items = local.items.filter((i: any) => i.variantId !== variantId);
      local.summary.itemCount = local.items.reduce((s: number, it: any) => s + (it.quantity || 0), 0);
      local.summary.subTotal = local.items.reduce((s: number, it: any) => s + ((it.variant?.price || 0) * (it.quantity || 0)), 0);
      saveLocalCart(local);
      setCartData(local);
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    try {
      await axiosClient.delete(`/cart/items/${variantId}`);
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Đã xóa sản phẩm thành công!');
    } catch (err) {
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
    
    if (usingLocal) {
        const empty = { items: [], summary: { subTotal: 0, itemCount: 0 } };
        saveLocalCart(empty);
        setCartData(empty);
        window.dispatchEvent(new Event('cartUpdated'));
        return;
    }

    try {
      await axiosClient.delete('/cart');
      const empty = { items: [], summary: { subTotal: 0, itemCount: 0 } };
      saveLocalCart(empty);
      setCartData(empty);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Giỏ hàng đã được làm sạch!');
    } catch (err) {
      toast.error('Không thể xóa giỏ hàng.');
    }
  };

  const syncLocalCartToServer = async () => {
    const local = getLocalCart();
    if (!local.items || local.items.length === 0) {
      toast('Không có sản phẩm để đồng bộ', { icon: 'ℹ️' });
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập để đồng bộ giỏ hàng.');
      return;
    }

    const loadToast = toast.loading('Đang đồng bộ giỏ hàng...');
    try {
      const promises = local.items.map((it: any) => 
        axiosClient.post('/cart/items', { variantId: it.variantId, quantity: it.quantity })
      );
      await Promise.all(promises);
      await fetchCart();
      saveLocalCart({ items: [], summary: { subTotal: 0, itemCount: 0 } });
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Đồng bộ thành công!', { id: loadToast });
    } catch (err) {
      toast.error('Đồng bộ thất bại.', { id: loadToast });
    }
  };

  if (loading) return <div className="cart-loading-state">Đang tải dữ liệu giỏ hàng...</div>;

  // 🔥 GIAO DIỆN KHI GIỎ HÀNG TRỐNG (Tránh trang trắng)
  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="cart-empty-state" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>Hãy chọn cho mình những mẫu kính yêu thích nhé!</p>
        <Link to="/products" className="btn-shop-now" style={{ 
          background: '#cc0000', color: 'white', padding: '12px 30px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' 
        }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2 className="cart-header-title">Giỏ hàng của bạn</h2>
        <p className="cart-item-count">{cartData.summary?.itemCount || 0} sản phẩm</p>

        <div className="cart-actions-toolbar">
          <button className="btn-secondary" onClick={handleClearCart}>Xóa toàn bộ giỏ hàng</button>
          <button className="btn-secondary" onClick={syncLocalCartToServer}>Đồng bộ giỏ hàng</button>
        </div>

        <div className="cart-layout">
          <div className="cart-items-list">
            {cartData.items.map((item: any) => (
              <div className="cart-item" key={item.variantId}>
                <img src={item.variant?.product?.primaryImageUrl || 'https://placehold.co/400x400?text=Kính'}
                     className="cart-item-img" alt={item.variant?.product?.productName}
                     onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x400?text=EyewearHut')} />

                <div className="cart-item-info">
                  <h4>{item.variant?.product?.productName || 'Sản phẩm'}</h4>
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
                <button onClick={() => handleRemoveItem(item.variantId)} className="delete-item-btn">
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3 className="summary-title">Tóm tắt đơn hàng</h3>
            <div className="summary-row">
              <span>Tạm tính</span>
              <span className="summary-value">{(cartData.summary?.subTotal || 0).toLocaleString()}đ</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span className="shipping-free">Miễn phí</span>
            </div>
            <div className="summary-total-row">
              <span className="total-label">Tổng cộng</span>
              <span className="total-price">{(cartData.summary?.subTotal || 0).toLocaleString()}đ</span>
            </div>
            <button className="btn-checkout" onClick={() => navigate('/checkout')}>
              Tiến hành thanh toán
            </button>
            <Link to="/products" className="btn-continue-shopping" style={{ display: 'block', textAlign: 'center', marginTop: '15px' }}>
              Tiếp tục mua sắm
            </Link>
          </aside>
        </div>
      </div>

      <ConfirmModal
        isOpen={showRemoveConfirm}
        title="Xóa sản phẩm"
        message="Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?"
        onConfirm={confirmRemoveItem}
        onCancel={() => setShowRemoveConfirm(false)}
        confirmText="Xóa"
        cancelText="Hủy"
        isDangerous={true}
      />

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Xóa toàn bộ giỏ hàng"
        message="Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?"
        onConfirm={confirmClearCart}
        onCancel={() => setShowClearConfirm(false)}
        confirmText="Xóa toàn bộ"
        cancelText="Hủy"
        isDangerous={true}
      />
    </div>
  );
};

export default Cart;