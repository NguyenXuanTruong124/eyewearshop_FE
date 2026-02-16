import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
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
        setProduct(response.data);
        if (response.data.variants?.length > 0) setSelectedVariant(response.data.variants[0]);
        if (response.data.images?.length > 0) {
          const primary = response.data.images.find((img: any) => img.isPrimary) || response.data.images[0];
          setMainImg(primary.url);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    if (id) fetchProductDetail();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    try {
      const payload = {
        variantId: selectedVariant.variantId,
        quantity: quantity
      };

      // Đợi server trả về mã thành công (thường là 204 hoặc 200)
      const response = await axiosClient.post('/cart/items', payload); 

      if (response.status === 200 || response.status === 204) {
        // HIỆN THÔNG BÁO LOG TRÌNH DUYỆT
        alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`); 
        
        // Phát sự kiện để Header cập nhật số lượng badge ngay lập tức
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error: any) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
    }
  };

  if (loading) return <div className="loading-state">Đang tải...</div>;
  if (!product) return <div className="error-state">Sản phẩm không tồn tại.</div>;

  const availableStock = (selectedVariant?.stockQuantity || 0) - (selectedVariant?.preOrderQuantity || 0);
  const isAvailable = availableStock > 0;

  return (
    <div className="product-detail-page">
      <div className="breadcrumbs">
        <Link to="/">Trang chủ</Link> / <Link to="/products">{product.categoryName}</Link> / <strong>{product.productName}</strong>
      </div>

      <div className="product-main">
        <div className="product-gallery">
          <img src={mainImg} alt={product.productName} className="main-img" />
          <div className="thumb-list">
            {product.images?.map((img: any) => (
              <img key={img.imageId} src={img.url} className={`thumb-img ${mainImg === img.url ? 'active' : ''}`} 
                   onClick={() => setMainImg(img.url)} alt="thumb" />
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
                <button key={v.variantId} className={`variant-chip ${selectedVariant?.variantId === v.variantId ? 'active' : ''}`}
                        onClick={() => { setSelectedVariant(v); setQuantity(1); }}>{v.color}</button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label className="option-label">Số lượng:</label>
            <div className="qty-row">
              <div className="quantity-control">
                <button type="button" className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={!isAvailable}>-</button>
                <input className="qty-input" value={isAvailable ? quantity : 0} readOnly />
                <button type="button" className="qty-btn" onClick={() => setQuantity(quantity + 1)} disabled={!isAvailable || quantity >= availableStock}>+</button>
              </div>
              <span className={`stock-badge ${isAvailable ? 'in-stock' : 'out-of-stock'}`}>
                {isAvailable ? `Còn hàng (Sẵn có: ${availableStock})` : 'Hết hàng'}
              </span>
            </div>
          </div>

          <div className="action-btns">
            <button className="add-cart-btn" onClick={handleAddToCart} disabled={!isAvailable}>
              🛒 Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;