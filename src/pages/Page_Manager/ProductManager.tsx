import React, { useState, useEffect } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./ProductManager.css";
import { 
  categoryList, brandList, productTypeList, getDefaultFormData, 
  ProductFormData, mapProductToFormData, prepareProductPayload 
} from "./ProductManagerUtils";
import ProductSpecs from "./ProductSpecs";
import VariantManager from "./VariantManager";
import ConfirmModal from "../../components/ConfirmModal";

interface ProductManagerProps {
  triggerToast: (msg: string) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ triggerToast }) => {
  const [productList, setProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("SUNGLASSES");

  // Custom Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void; type?: "danger" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, type: "danger" | "warning" | "info" = "warning") => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, type });
  };

  // Modal Product
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"info" | "variants">("info");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<ProductFormData>(getDefaultFormData());

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/manager/products?page=1&pageSize=30");
      let data = res.data?.items || res.data || [];
      setProductList(data.sort((a: any, b: any) => a.productId - b.productId));
    } catch (err) {
      triggerToast("Không thể tải danh sách sản phẩm");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openProductModal = async (productId: number | null, readOnly: boolean) => {
    setModalTab("info");
    if (productId) {
      try {
        const res = await axiosClient.get(`/manager/products/${productId}`);
        setEditingProduct(res.data);
        setFormData(mapProductToFormData(res.data));
        setIsReadOnly(readOnly);
        setShowModal(true);
      } catch (err) { triggerToast("Lỗi khi tải chi tiết sản phẩm"); }
    } else {
      setEditingProduct(null);
      setFormData(getDefaultFormData());
      setIsReadOnly(false);
      setShowModal(true);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      const payload = prepareProductPayload(formData);
      if (editingProduct) {
        let url = `/manager/products/${editingProduct.productId}`;
        if (formData.productType === "FRAME") url = `/manager/products/frame/${editingProduct.productId}`;
        else if (["COMBO", "SUNGLASSES"].includes(formData.productType)) url = `/manager/products/combo/${editingProduct.productId}`;
        else if (formData.productType === "RX_LENS") url = `/manager/products/lens/${editingProduct.productId}`;
        else if (formData.productType === "CONTACT_LENS") url = `/manager/products/contact-lens/${editingProduct.productId}`;
        
        await axiosClient.put(url, payload);
        triggerToast("Cập nhật thông tin chung thành công!");
      } else {
        let url = "/manager/products";
        if (formData.productType === "FRAME") url = "/manager/products/frame";
        else if (formData.productType === "SUNGLASSES") url = "/manager/products/combo"; // Giữ combo nếu là sunglasses cố định
        else if (formData.productType === "COMBO") url = "/manager/products/combo";
        else if (formData.productType === "RX_LENS") url = "/manager/products/rxlens";
        else if (formData.productType === "CONTACT_LENS") url = "/manager/products/contactlens";

        await axiosClient.post(url, payload);
        triggerToast("Thêm sản phẩm thành công!");
        setShowModal(false);
      }
      // Đợi load lại danh sách trước khi kết thúc
      await fetchProducts();
    } catch (err: any) {
      console.error("Lỗi khi gửi form sản phẩm:", err);
      const serverMsg = err.response?.data?.message || err.message;
      triggerToast(serverMsg || "Thao tác thất bại");
    }
  };

  const handleDeleteProduct = async (productId: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const actionText = newStatus === 1 ? "mở bán lại" : "ngừng bán";
    triggerConfirm(`${newStatus === 1 ? "Mở bán" : "Ngừng bán"} sản phẩm`, `Bạn có chắc chắn muốn ${actionText} sản phẩm này không?`, async () => {
      try {
        await axiosClient.put(`/manager/products/${newStatus}/products/${productId}`);
        triggerToast(`Đã ${actionText} sản phẩm thành công!`);
        fetchProducts();
      } catch (err: any) { triggerToast(err.response?.data?.message || "Lỗi cập nhật trạng thái"); }
    }, newStatus === 1 ? "info" : "danger");
  };

  const currentTabProducts = productList.filter(p => p.productType === activeType);

  return (
    <div className="product-manager-wrapper">
      <div className="manager-content-header">
        <h2></h2>
        <button className="pm-btn-submit" onClick={() => openProductModal(null, false)}><i className="fas fa-plus" /> Thêm sản phẩm</button>
      </div>

      <div className="pm-main-tabs">
        {productTypeList.filter(pt => pt.id !== "OTHER").map(type => (
          <button key={type.id} className={`pm-main-tab-btn ${activeType === type.id ? 'active' : ''}`} onClick={() => setActiveType(type.id)}>
            <span className="tab-icon">{type.id === "SUNGLASSES" ? "" : type.id === "FRAME" ? "" : type.id === "RX_LENS" ? "" : type.id === "CONTACT_LENS" ? "" : ""}</span>
            <span className="tab-name">{type.name.split(' (')[0]}</span>
            <span className="count-badge">{productList.filter(p => p.productType === type.id).length}</span>
          </button>
        ))}
      </div>

      <div className="pm-variant-card">
        <table className="pm-variant-table">
          <thead>
            <tr><th>ID</th><th>Tên sản phẩm</th><th>Mã SKU</th><th>Loại</th><th>Giá sàn</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {!loading && currentTabProducts.length > 0 ? currentTabProducts.map((prod) => (
              <tr key={prod.productId}>
                <td>{prod.productId}</td><td className="td-bold">{prod.productName}</td><td>{prod.sku}</td><td><span className="type-badge">{prod.productType}</span></td>
                <td className="td-price">{prod.basePrice?.toLocaleString()} đ</td>
                <td><span className={`status-badge ${prod.status === 1 ? 'active' : 'inactive'}`}>{prod.status === 1 ? 'Đang bán' : 'Ngừng bán'}</span></td>
                <td className="pm-variant-actions">
                  <button title="Xem chi tiết" className="btn-icon view-btn" onClick={() => openProductModal(prod.productId, true)}>👁️</button>
                  <button title="Chỉnh sửa chung" className="btn-icon edit-btn" onClick={() => openProductModal(prod.productId, false)}>📝</button>
                  <button title={prod.status === 1 ? "Ngừng bán" : "Mở bán lại"} className={`btn-icon delete-btn ${prod.status === 1 ? 'btn-lock-active' : 'btn-lock-inactive'}`} onClick={() => handleDeleteProduct(prod.productId, prod.status)}>{prod.status === 1 ? '🔒' : '🔓'}</button>
                </td>
              </tr>
            )) : !loading ? <tr><td colSpan={7} className="pm-table-center">Không có sản phẩm nào thuộc loại này.</td></tr> : <tr><td colSpan={7} className="pm-table-center">Đang tải dữ liệu...</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="product-modal-overlay">
          <div className="product-modal-content">
            <div className="pm-modal-header">
              <h3 className="pm-modal-title">{isReadOnly ? "Chi tiết Sản phẩm" : (editingProduct ? "Cập nhật Sản phẩm" : "Tạo Sản phẩm mới")}</h3>
              <button className="pm-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="pm-tabs">
              <button className={`pm-tab-btn ${modalTab === "info" ? 'active' : ''}`} onClick={() => setModalTab("info")}>Thông tin chung</button>
              {editingProduct && <button className={`pm-tab-btn ${modalTab === "variants" ? 'active' : ''}`} onClick={() => setModalTab("variants")}>Danh sách Biến thể</button>}
            </div>
            <div className="pm-modal-body">
              {modalTab === "info" && (
                <form id="productForm" onSubmit={handleProductSubmit}>
                  {editingProduct?.images?.length > 0 && (
                    <div className="pm-form-section pm-images-preview-section">
                      <h4 className="pm-section-title-modern">🖼️ Hình ảnh sản phẩm</h4>
                      <div className="pm-images-horizontal-list">
                        {[...editingProduct.images].sort((a,b)=> (b.isPrimary?1:0)-(a.isPrimary?1:0)).map((img: any) => (
                          <div key={img.imageId} className={`pm-img-card ${img.isPrimary ? 'primary' : ''}`}>
                            <img src={img.imageUrl || img.url} alt="product" />{img.isPrimary && <span className="primary-badge">Ảnh chính</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pm-form-section">
                    <h4 className="pm-section-title-modern">📦 Thông Tin Cơ Bản</h4>
                    {!editingProduct && !isReadOnly && (
                      <div className="pm-form-group-highlight"><label>Chọn Loại Sản Phẩm</label>
                        <select className="premium-select" value={formData.productType} onChange={e => setFormData({ ...formData, productType: e.target.value })}>{productTypeList.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}</select>
                      </div>
                    )}
                    <div className="pm-form-grid-3">
                      <div className="pm-form-group pm-col-span-2"><label>Tên sản phẩm *</label><input required disabled={isReadOnly} value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })} /></div>
                      <div className="pm-form-group"><label>Mã SKU gốc *</label><input required disabled={isReadOnly} value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} /></div>
                      <div className="pm-form-group"><label>Giá sàn (VNĐ) *</label><input type="number" required disabled={isReadOnly} value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })} /></div>
                      <div className="pm-form-group"><label>Thương hiệu *</label><select disabled={isReadOnly} value={formData.brandId} onChange={e => setFormData({ ...formData, brandId: Number(e.target.value) })}>{brandList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                      <div className="pm-form-group"><label>Danh mục *</label><select disabled={isReadOnly} value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })}>{categoryList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                      {editingProduct && <div className="pm-form-group"><label>Loại</label><select disabled value={formData.productType}>{productTypeList.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}</select></div>}
                      <div className="pm-form-group"><label>Trạng thái</label><select disabled={isReadOnly} value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}><option value={1}>Đang bán</option><option value={0}>Ngừng kinh doanh</option></select></div>
                      <div className="pm-form-group pm-col-span-3"><label>Đặc tả ngắn</label><input disabled={isReadOnly} value={formData.specifications} onChange={e => setFormData({ ...formData, specifications: e.target.value })} /></div>
                      <div className="pm-form-group pm-col-span-3"><label>Mô tả chi tiết</label><textarea rows={3} disabled={isReadOnly} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                    </div>
                  </div>
                  <ProductSpecs formData={formData} setFormData={setFormData} isReadOnly={isReadOnly} />
                </form>
              )}
              {modalTab === "variants" && editingProduct && (
                <VariantManager editingProduct={editingProduct} isReadOnly={isReadOnly} triggerToast={triggerToast} triggerConfirm={triggerConfirm} onUpdateProduct={(prod: any) => setEditingProduct(prod)} />
              )}
            </div>
            <div className="pm-modal-footer">
              <button className="pm-btn-cancel" onClick={() => setShowModal(false)}>{isReadOnly ? "Đóng" : "Hủy bỏ"}</button>
              {!isReadOnly && modalTab === "info" && <button className="pm-btn-submit" type="submit" form="productForm">Lưu Thông Tin</button>}
            </div>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} type={confirmConfig.type} onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))} onConfirm={() => { confirmConfig.onConfirm(); setConfirmConfig(prev => ({ ...prev, isOpen: false })); }} />
    </div>
  );
};

export default ProductManager;