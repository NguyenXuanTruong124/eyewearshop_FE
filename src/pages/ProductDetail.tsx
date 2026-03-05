import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
import toast from 'react-hot-toast';
import './styles/ProductDetail.css';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/catalog/products/${id}`);
        const data = response.data;
        setProduct(data);

        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }

        if (data.images && data.images.length > 0) {
          const primary = data.images.find((img: any) => img.isPrimary) || data.images[0];
          setMainImg(primary.url);
        }
      } catch (error) {
        toast.error("Không thể tải chi tiết sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetail();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) {
      toast.error("Vui lòng chọn màu sắc sản phẩm!");
      return;
    }

    const loadToast = toast.loading("Đang thêm vào giỏ hàng...");

    try {
      const payload = {
        variantId: selectedVariant.variantId,
        quantity: quantity
      };

      // 1. Gửi lên Server API, nhờ axios bật withCredentials: true,
      // server sẽ tự tạo và duy trì Session (JSESSIONID) cho giỏ hàng.
      const response = await axiosClient.post('/cart/items', payload);

      if (response.status >= 200 && response.status < 300) {
        toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, { id: loadToast });

        // Thông báo cho Badge/Header cập nhật
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error: any) {
      console.error("❌ Lỗi thêm giỏ hàng:", error);
      toast.error(error.response?.data?.message || "Hệ thống bận, vui lòng thử lại sau.", { id: loadToast });
    }
  };

  if (loading) return <div className="loading-state">Đang tải chi tiết sản phẩm...</div>;
  if (!product) return <div className="error-state">Sản phẩm không tồn tại hoặc đã bị xóa.</div>;

  const stockQty = selectedVariant?.stockQuantity || 0;
  const preOrderQty = selectedVariant?.preOrderQuantity || 0;

  let statusText = "Hết hàng";
  let statusClass = "out-of-stock";
  let canBuy = false;

  if (stockQty > 0) {
    statusText = `Còn hàng (Sẵn có: ${stockQty})`;
    statusClass = "in-stock";
    canBuy = true;
  } else if (preOrderQty > 0) {
    statusText = `Có thể đặt hàng (Pre-order: ${preOrderQty})`;
    statusClass = "pre-order";
    canBuy = true;
  } else {
    statusText = "Hết hàng";
    statusClass = "out-of-stock";
    canBuy = false;
  }

  const maxAvailable = stockQty > 0 ? stockQty : preOrderQty;

  return (
    <div className="product-detail-page">
      <div className="breadcrumbs">
        <Link to="/">Trang chủ</Link> / <Link to="/products">{product.categoryName}</Link> / <strong>{product.productName}</strong>
      </div>

      <div className="product-main">
        <div className="product-gallery">
          <img
            src={mainImg}
            alt={product.productName}
            className="main-img"
            onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400?text=EyewearHut'}
          />
          <div className="thumb-list">
            {product.images?.map((img: any) => (
              <img
                key={img.imageId}
                src={img.url}
                className={`thumb-img ${mainImg === img.url ? 'active' : ''}`}
                onClick={() => setMainImg(img.url)}
                alt="thumbnail"
              />
            ))}
          </div>
        </div>

        <div className="product-order-info">
          <p className="brand-label">{product.brandName}</p>
          <h1 className="product-title">{product.productName}</h1>

          <div className="price-row">
            <span className="current-price">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedVariant?.price || product.basePrice)}
            </span>
          </div>

          <div className="option-group">
            <label className="option-label">Màu sắc:</label>
            <div className="variant-selector">
              {product.variants?.map((v: any) => (
                <button
                  key={v.variantId}
                  className={`variant-chip ${selectedVariant?.variantId === v.variantId ? 'active' : ''}`}
                  onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                >
                  {v.color}
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label className="option-label">Số lượng:</label>
            <div className="qty-row">
              <div className="quantity-control">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!canBuy}
                >-</button>
                <input className="qty-input" value={canBuy ? quantity : 0} readOnly />
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!canBuy || quantity >= maxAvailable}
                >+</button>
              </div>
              <span className={`stock-badge ${statusClass}`}>
                {statusText}
              </span>
            </div>
          </div>

          <div className="action-btns">
            <button
              className="add-cart-btn"
              onClick={handleAddToCart}
              disabled={!canBuy}
            >
              🛒 Thêm vào giỏ hàng
            </button>
          </div>

          <div className="product-description">
            <h3 className="description-title">Mô tả sản phẩm</h3>
            <p className="description-text">{product.description || "Chưa có mô tả cho sản phẩm này."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;