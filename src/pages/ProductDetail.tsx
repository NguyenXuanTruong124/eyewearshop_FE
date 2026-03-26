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
            <label className="option-label">
              {['RX_LENS', 'CONTACT_LENS'].includes(product.productType) ? 'Phân loại:' : 'Màu sắc:'}
            </label>
            <div className="variant-selector">
              {product.variants?.map((v: any) => (
                <button
                  key={v.variantId}
                  className={`variant-chip ${selectedVariant?.variantId === v.variantId ? 'active' : ''}`}
                  onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                >
                  {v.color} {v.refractiveIndex && !['FRAME', 'SUNGLASSES'].includes(product.productType) ? `- Chiết suất ${v.refractiveIndex}` : ''}
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

          {(product.frameSpec || product.sunglassesSpec || product.rxLensSpec || product.contactLensSpec) && (
            <div className="product-specifications">
              <h3 className="description-title">Thông số kỹ thuật</h3>
              <table className="spec-table">
                <tbody>
                  {(product.productType === 'FRAME' || product.productType === 'SUNGLASSES') && product.frameSpec && (
                    <>
                      {product.frameSpec.material ? <tr><td>Chất liệu</td><td>{product.frameSpec.material}</td></tr> : null}
                      {product.frameSpec.shape ? <tr><td>Hình dáng</td><td>{product.frameSpec.shape}</td></tr> : null}
                      {product.frameSpec.rimType ? <tr><td>Kiểu gọng</td><td>{product.frameSpec.rimType}</td></tr> : null}
                      {product.frameSpec.weight > 0 ? <tr><td>Trọng lượng</td><td>{product.frameSpec.weight}g</td></tr> : null}
                      {product.frameSpec.hingeType ? <tr><td>Bản lề</td><td>{product.frameSpec.hingeType}</td></tr> : null}
                      {product.frameSpec.hasNosePads !== null ? <tr><td>Đệm mũi</td><td>{product.frameSpec.hasNosePads ? "Có" : "Không"}</td></tr> : null}
                      {!!(product.frameSpec.lensWidth || product.frameSpec.dbl || product.frameSpec.templeLength) && (
                        <tr>
                          <td>Kích thước</td>
                          <td>
                            {product.frameSpec.lensWidth ? `Tròng: ${product.frameSpec.lensWidth}mm ` : ''}
                            {product.frameSpec.dbl ? `Cầu: ${product.frameSpec.dbl}mm ` : ''}
                            {product.frameSpec.templeLength ? `Càng: ${product.frameSpec.templeLength}mm` : ''}
                          </td>
                        </tr>
                      )}
                    </>
                  )}

                  {product.productType === 'SUNGLASSES' && product.sunglassesSpec && (
                    <>
                      {product.sunglassesSpec.lensMaterial ? <tr><td>Chất liệu tròng</td><td>{product.sunglassesSpec.lensMaterial}</td></tr> : null}
                      {product.sunglassesSpec.lensColor ? <tr><td>Màu tròng</td><td>{product.sunglassesSpec.lensColor}</td></tr> : null}
                      {product.sunglassesSpec.uvProtection !== null ? <tr><td>Chống tia UV</td><td>{product.sunglassesSpec.uvProtection ? "Có" : "Không"}</td></tr> : null}
                      {product.sunglassesSpec.polarized !== null ? <tr><td>Phân cực</td><td>{product.sunglassesSpec.polarized ? "Có" : "Không"}</td></tr> : null}
                      {product.sunglassesSpec.shape ? <tr><td>Hình dáng</td><td>{product.sunglassesSpec.shape}</td></tr> : null}
                    </>
                  )}

                  {product.productType === 'RX_LENS' && product.rxLensSpec && (
                    <>
                      {product.rxLensSpec.designType ? <tr><td>Loại thiết kế</td><td>{product.rxLensSpec.designType}</td></tr> : null}
                      {product.rxLensSpec.material ? <tr><td>Chất liệu</td><td>{product.rxLensSpec.material}</td></tr> : null}
                      {product.rxLensSpec.lensWidth !== null ? <tr><td>Kích thước tròng</td><td>{product.rxLensSpec.lensWidth}mm</td></tr> : null}
                      {product.rxLensSpec.minSphere !== null || product.rxLensSpec.maxSphere !== null ? <tr><td>Độ cầu (SPH)</td><td>{product.rxLensSpec.minSphere} đến {product.rxLensSpec.maxSphere}</td></tr> : null}
                      {product.rxLensSpec.minCylinder !== null || product.rxLensSpec.maxCylinder !== null ? <tr><td>Độ trụ (CYL)</td><td>{product.rxLensSpec.minCylinder} đến {product.rxLensSpec.maxCylinder}</td></tr> : null}
                      {product.rxLensSpec.minAxis !== null || product.rxLensSpec.maxAxis !== null ? <tr><td>Trục (AXIS)</td><td>{product.rxLensSpec.minAxis} đến {product.rxLensSpec.maxAxis}</td></tr> : null}
                      {product.rxLensSpec.minAdd !== null || product.rxLensSpec.maxAdd !== null ? <tr><td>Độ thêm (ADD)</td><td>{product.rxLensSpec.minAdd} đến {product.rxLensSpec.maxAdd}</td></tr> : null}
                      {product.rxLensSpec.features && product.rxLensSpec.features.length > 0 && (
                        <tr>
                          <td>Tính năng</td>
                          <td>{product.rxLensSpec.features.map((f: any) => f.name).join(', ')}</td>
                        </tr>
                      )}
                    </>
                  )}

                  {product.productType === 'CONTACT_LENS' && product.contactLensSpec && (
                    <>
                      {product.contactLensSpec.material ? <tr><td>Chất liệu</td><td>{product.contactLensSpec.material}</td></tr> : null}
                      {product.contactLensSpec.lensType ? <tr><td>Loại Lens</td><td>{product.contactLensSpec.lensType}</td></tr> : null}
                      {product.contactLensSpec.baseCurve !== null ? <tr><td>Bán kính cong (BC)</td><td>{product.contactLensSpec.baseCurve}mm</td></tr> : null}
                      {product.contactLensSpec.diameter !== null ? <tr><td>Đường kính (DIA)</td><td>{product.contactLensSpec.diameter}mm</td></tr> : null}
                      {product.contactLensSpec.waterContent !== null ? <tr><td>Độ ngậm nước</td><td>{product.contactLensSpec.waterContent}%</td></tr> : null}
                      {product.contactLensSpec.oxygenPermeability !== null ? <tr><td>Độ thẩm thấu oxy</td><td>{product.contactLensSpec.oxygenPermeability}</td></tr> : null}
                      {product.contactLensSpec.replacementSchedule ? <tr><td>Lịch thay thế</td><td>{product.contactLensSpec.replacementSchedule}</td></tr> : null}
                      {product.contactLensSpec.minSphere !== null || product.contactLensSpec.maxSphere !== null ? <tr><td>Độ cầu (SPH)</td><td>{product.contactLensSpec.minSphere} đến {product.contactLensSpec.maxSphere}</td></tr> : null}
                      {product.contactLensSpec.minCylinder !== null || product.contactLensSpec.maxCylinder !== null ? <tr><td>Độ trụ (CYL)</td><td>{product.contactLensSpec.minCylinder} đến {product.contactLensSpec.maxCylinder}</td></tr> : null}
                      {product.contactLensSpec.isToric !== null ? <tr><td>Lens loạn thị</td><td>{product.contactLensSpec.isToric ? "Có" : "Không"}</td></tr> : null}
                      {product.contactLensSpec.isMultifocal !== null ? <tr><td>Lens đa tròng</td><td>{product.contactLensSpec.isMultifocal ? "Có" : "Không"}</td></tr> : null}
                    </>
                  )}

                  {product.productType === 'COMBO' && (
                    <>
                      {product.frameSpec && (
                        <>
                          <tr><th colSpan={2} className="spec-table-header">Thông số Gọng kính</th></tr>
                          {product.frameSpec.material ? <tr><td>Chất liệu</td><td>{product.frameSpec.material}</td></tr> : null}
                          {product.frameSpec.shape ? <tr><td>Hình dáng</td><td>{product.frameSpec.shape}</td></tr> : null}
                          {product.frameSpec.rimType ? <tr><td>Kiểu gọng</td><td>{product.frameSpec.rimType}</td></tr> : null}
                          {product.frameSpec.weight > 0 ? <tr><td>Trọng lượng</td><td>{product.frameSpec.weight}g</td></tr> : null}
                          {product.frameSpec.hingeType ? <tr><td>Bản lề</td><td>{product.frameSpec.hingeType}</td></tr> : null}
                          {product.frameSpec.hasNosePads !== null ? <tr><td>Đệm mũi</td><td>{product.frameSpec.hasNosePads ? "Có" : "Không"}</td></tr> : null}
                          {!!(product.frameSpec.lensWidth || product.frameSpec.dbl || product.frameSpec.templeLength) && (
                            <tr>
                              <td>Kích thước</td>
                              <td>
                                {product.frameSpec.lensWidth ? `Tròng: ${product.frameSpec.lensWidth}mm ` : ''}
                                {product.frameSpec.dbl ? `Cầu: ${product.frameSpec.dbl}mm ` : ''}
                                {product.frameSpec.templeLength ? `Càng: ${product.frameSpec.templeLength}mm` : ''}
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                      {product.rxLensSpec && (
                        <>
                          <tr><th colSpan={2} className="spec-table-header">Thông số Tròng kính</th></tr>
                          {product.rxLensSpec.designType ? <tr><td>Loại thiết kế</td><td>{product.rxLensSpec.designType}</td></tr> : null}
                          {product.rxLensSpec.material ? <tr><td>Chất liệu</td><td>{product.rxLensSpec.material}</td></tr> : null}
                          {product.rxLensSpec.minSphere !== null || product.rxLensSpec.maxSphere !== null ? <tr><td>Độ cầu (SPH)</td><td>{product.rxLensSpec.minSphere} đến {product.rxLensSpec.maxSphere}</td></tr> : null}
                          {product.rxLensSpec.minCylinder !== null || product.rxLensSpec.maxCylinder !== null ? <tr><td>Độ trụ (CYL)</td><td>{product.rxLensSpec.minCylinder} đến {product.rxLensSpec.maxCylinder}</td></tr> : null}
                          {product.rxLensSpec.features && product.rxLensSpec.features.length > 0 && (
                            <tr>
                              <td>Tính năng</td>
                              <td>{product.rxLensSpec.features.map((f: any) => f.name).join(', ')}</td>
                            </tr>
                          )}
                        </>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;