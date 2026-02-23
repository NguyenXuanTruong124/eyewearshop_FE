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
    } catch (e) { return { items: [], summary: { subTotal: 0, itemCount: 0 } }; }
  };

  const saveLocalCart = (data: any) => {
    localStorage.setItem('localCart', JSON.stringify(data));
  };
  const token = localStorage.getItem('accessToken');

if (!token) {
  setCartData(getLocalCart());
  setUsingLocal(true);
  setLoading(false);
  return;
}
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/cart');

      if (response?.data && response.data.items && response.data.items.length > 0) {
        setCartData(response.data);
        saveLocalCart(response.data);
        setUsingLocal(false);
      } else {
        setCartData(getLocalCart());
        setUsingLocal(true);
      }
    } catch (error) {
      setCartData(getLocalCart());
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
      const local = getLocalCart();
      const it = local.items.find((i: any) => i.variantId === variantId);
      if (it) it.quantity = newQty;
      local.summary.itemCount = local.items.reduce((s: number, it: any) => s + (it.quantity || 0), 0);
      local.summary.subTotal = local.items.reduce((s: number, it: any) => s + ((it.variant?.price || 0) * (it.quantity || 0)), 0);
      saveLocalCart(local);
      setCartData(local);
      setUsingLocal(true);
      toast.error("Lỗi cập nhật số lượng.");
    }
  };

  const handleRemoveItem = async (variantId: number) => {
    setRemoveConfirmVariantId(variantId);
    setShowRemoveConfirm(true);
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

    const deletePromise = axiosClient.delete(`/cart/items/${variantId}`);
    toast.promise(deletePromise, {
      loading: 'Đang xóa...',
      success: 'Đã xóa sản phẩm thành công!',
      error: 'Lỗi khi xóa sản phẩm.',
    });

    try {
      await deletePromise;
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      const local = getLocalCart();
      local.items = local.items.filter((i: any) => i.variantId !== variantId);
      local.summary.itemCount = local.items.reduce((s: number, it: any) => s + (it.quantity || 0), 0);
      local.summary.subTotal = local.items.reduce((s: number, it: any) => s + ((it.variant?.price || 0) * (it.quantity || 0)), 0);
      saveLocalCart(local);
      setCartData(local);
      setUsingLocal(true);
    }
  };

  const handleClearCart = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = async () => {
    setShowClearConfirm(false);
    const clearPromise = axiosClient.delete('/cart');
    toast.promise(clearPromise, {
      loading: 'Đang xóa toàn bộ giỏ hàng...',
      success: 'Giỏ hàng đã được làm sạch!',
      error: 'Không thể xóa giỏ hàng trên server, đã xóa local thay thế.'
    });

    try {
      await clearPromise;
      const empty = { items: [], summary: { subTotal: 0, itemCount: 0 } };
      saveLocalCart(empty);
      setCartData(empty);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      const empty = { items: [], summary: { subTotal: 0, itemCount: 0 } };
      saveLocalCart(empty);
      setCartData(empty);
      window.dispatchEvent(new Event('cartUpdated'));
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

    const promises = local.items.map((it: any) => axiosClient.post('/cart/items', { variantId: it.variantId, quantity: it.quantity }));
    const all = Promise.all(promises);

    toast.promise(all, {
      loading: 'Đang đồng bộ giỏ hàng...',
      success: 'Đồng bộ giỏ hàng thành công!',
      error: 'Đồng bộ thất bại. Vui lòng thử lại.'
    });

    try {
      await all;
      await fetchCart();
      saveLocalCart({ items: [], summary: { subTotal: 0, itemCount: 0 } });
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Sync local cart failed', err);
    }
  };

  if (loading) return <div className="cart-loading-state">Đang tải dữ liệu giỏ hàng...</div>;

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="cart-empty-state">
        <h2>Giỏ hàng của bạn đang trống</h2>
        <Link to="/products" className="btn-shop-now">Mua sắm ngay</Link>
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
            <Link to="/products" className="btn-continue-shopping">
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