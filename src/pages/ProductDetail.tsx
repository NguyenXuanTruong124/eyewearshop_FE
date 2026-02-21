import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
import toast from 'react-hot-toast'; // Import Toast
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
    if (!selectedVariant) {
      toast.error("Vui lòng chọn màu sắc sản phẩm!");
      return;
    }

    const loadToast = toast.loading("Đang thêm vào giỏ hàng...");

    try {
      const payload = {
        variantId: selectedVariant.variantId,
        quantity: quantity
      };

      const response = await axiosClient.post('/cart/items', payload); 

      if (response.status >= 200 && response.status < 300) {
        toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, { id: loadToast }); 

        // Kiểm tra ngay giỏ hàng từ server để đồng bộ
        let cartResp: any = null;
        try {
          cartResp = await axiosClient.get('/cart');
        } catch (err) {
          // Lỗi ngầm không cần báo toast ở đây
        }

        // Nếu server trả về rỗng thì dùng fallback localStorage
        if (!cartResp || !cartResp.data || !cartResp.data.items || cartResp.data.items.length === 0) {
          const localRaw = localStorage.getItem('localCart');
          const localCart = localRaw ? JSON.parse(localRaw) : { items: [], summary: { subTotal: 0, itemCount: 0 } };

          const newItem = {
            variantId: selectedVariant.variantId,
            quantity: quantity,
            variant: {
              price: selectedVariant.price,
              color: selectedVariant.color,
              product: {
                primaryImageUrl: product.images?.[0]?.url || '',
                productName: product.productName
              }
            }
          };

          const existing = localCart.items.find((i: any) => i.variantId === newItem.variantId);
          if (existing) {
            existing.quantity = (existing.quantity || 0) + quantity;
          } else {
            localCart.items.push(newItem);
          }

          localCart.summary.itemCount = localCart.items.reduce((s: number, it: any) => s + (it.quantity || 0), 0);
          localCart.summary.subTotal = localCart.items.reduce((s: number, it: any) => s + ((it.variant?.price || 0) * (it.quantity || 0)), 0);

          localStorage.setItem('localCart', JSON.stringify(localCart));
        }

        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error: any) {
      toast.error("Vui lòng đăng nhập để mua hàng!", { id: loadToast });
    }
  };

  if (loading) return <div className="loading-state" style={{textAlign: 'center', padding: '100px'}}>Đang tải chi tiết sản phẩm...</div>;
  if (!product) return <div className="error-state" style={{textAlign: 'center', padding: '100px'}}>Sản phẩm không tồn tại hoặc đã bị xóa.</div>;

  const availableStock = (selectedVariant?.stockQuantity || 0) - (selectedVariant?.preOrderQuantity || 0);
  const isAvailable = availableStock > 0;

  return (
    <div className="product-detail-page">
      <div className="breadcrumbs">
        <Link to="/">Trang chủ</Link> / <Link to="/products">{product.categoryName}</Link> / <strong>{product.productName}</strong>
      </div>

      <div className="product-main">
        <div className="product-gallery">
          <img src={mainImg} alt={product.productName} className="main-img" onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400?text=EyewearHut'} />
          <div className="thumb-list">
            {product.images?.map((img: any) => (
              <img key={img.imageId} src={img.url} className={`thumb-img ${mainImg === img.url ? 'active' : ''}`} 
                   onClick={() => setMainImg(img.url)} alt="thumbnail" />
            ))}
          </div>
        </div>

        <div className="product-order-info">
          <p className="brand-label" style={{textTransform: 'uppercase', color: '#888', letterSpacing: '1px'}}>{product.brandName}</p>
          <h1 className="product-title" style={{fontSize: '32px', margin: '10px 0', fontWeight: 700}}>{product.productName}</h1>
          
          <div className="price-row" style={{margin: '20px 0'}}>
            <span className="current-price" style={{fontSize: '28px', color: '#cc0000', fontWeight: 800}}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedVariant?.price || product.basePrice)}
            </span>
          </div>

          <div className="option-group" style={{marginBottom: '25px'}}>
            <label className="option-label" style={{fontWeight: 600, display: 'block', marginBottom: '10px'}}>Màu sắc:</label>
            <div className="variant-selector" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              {product.variants?.map((v: any) => (
                <button key={v.variantId} className={`variant-chip ${selectedVariant?.variantId === v.variantId ? 'active' : ''}`}
                        onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                        style={{
                          padding: '8px 20px',
                          border: selectedVariant?.variantId === v.variantId ? '2px solid #cc0000' : '1px solid #ddd',
                          borderRadius: '25px',
                          background: selectedVariant?.variantId === v.variantId ? '#fff5f5' : 'white',
                          cursor: 'pointer'
                        }}>{v.color}</button>
              ))}
            </div>
          </div>

          <div className="option-group" style={{marginBottom: '35px'}}>
            <label className="option-label" style={{fontWeight: 600, display: 'block', marginBottom: '10px'}}>Số lượng:</label>
            <div className="qty-row" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
              <div className="quantity-control" style={{display: 'flex', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden'}}>
                <button type="button" className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={!isAvailable} style={{padding: '10px 15px', background: '#f9f9f9', border: 'none'}}>-</button>
                <input className="qty-input" value={isAvailable ? quantity : 0} readOnly style={{width: '50px', textAlign: 'center', border: 'none', fontWeight: 700}} />
                <button type="button" className="qty-btn" onClick={() => setQuantity(quantity + 1)} disabled={!isAvailable || quantity >= availableStock} style={{padding: '10px 15px', background: '#f9f9f9', border: 'none'}}>+</button>
              </div>
              <span className={`stock-badge ${isAvailable ? 'in-stock' : 'out-of-stock'}`} style={{fontSize: '14px', color: isAvailable ? '#28a745' : '#d32f2f', fontWeight: 600}}>
                {isAvailable ? `Còn hàng (Sẵn có: ${availableStock})` : 'Hết hàng'}
              </span>
            </div>
          </div>

          <div className="action-btns">
            <button className="add-cart-btn" onClick={handleAddToCart} disabled={!isAvailable}
                    style={{ width: '100%', maxWidth: '400px', background: isAvailable ? '#cc0000' : '#ccc', color: 'white', padding: '18px', borderRadius: '12px', fontSize: '18px', fontWeight: 700, border: 'none', cursor: isAvailable ? 'pointer' : 'not-allowed' }}>
              🛒 Thêm vào giỏ hàng
            </button>
          </div>
          
          <div className="product-description" style={{marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
            <h3 style={{fontSize: '18px', marginBottom: '15px'}}>Mô tả sản phẩm</h3>
            <p style={{lineHeight: '1.6', color: '#666'}}>{product.description || "Chưa có mô tả cho sản phẩm này."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;