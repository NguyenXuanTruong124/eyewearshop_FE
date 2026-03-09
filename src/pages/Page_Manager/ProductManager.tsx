import React, { useState, useEffect } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./ProductManager.css";

interface ProductManagerProps {
  triggerToast: (msg: string) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ triggerToast }) => {
  const [productList, setProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Product
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"info" | "variants">("info");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null); // Trọn vẹn dữ liệu /products/{id}

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    basePrice: 0,
    status: 1,
    sku: "",
    productType: "FRAME",
    categoryId: 1,
    brandId: 1,
    specifications: ""
  });

  // Variant Add/Edit Subform State
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [variantForm, setVariantForm] = useState({
    color: "",
    price: 0,
    stockQuantity: 0,
    preOrderQuantity: 0,
    variantSku: "",
    baseCurve: "",
    diameter: "",
    refractiveIndex: "",
    expectedDateRestock: "",
    status: 1
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/manager/products?page=1&pageSize=20");
      setProductList(res.data?.items || res.data || []);
    } catch (err) {
      triggerToast("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // KHỞI TẠO XEM HOẶC SỬA SẢN PHẨM PHẢI GỌI DETAIL (LẤY VARIANT)
  const openProductModal = async (productId: number | null, readOnly: boolean) => {
    setModalTab("info");
    setShowVariantForm(false);
    if (productId) {
      try {
        const res = await axiosClient.get(`/manager/products/${productId}`);
        const prod = res.data;
        setEditingProduct(prod);
        setFormData({
          productName: prod.productName,
          description: prod.description || "",
          basePrice: prod.basePrice || 0,
          status: prod.status !== undefined ? prod.status : 1,
          sku: prod.sku || "",
          productType: prod.productType || "FRAME",
          categoryId: prod.category?.categoryId || 1,
          brandId: prod.brand?.brandId || 1,
          specifications: prod.specifications || ""
        });
        setIsReadOnly(readOnly);
        setShowModal(true);
      } catch (err) {
        triggerToast("Lỗi khi xem chi tiết (chưa thể tải variant)");
      }
    } else {
      // THÊM MỚI SẢN PHẨM (POST)
      setEditingProduct(null);
      setFormData({
        productName: "", description: "", basePrice: 0, status: 1,
        sku: "", productType: "FRAME", categoryId: 1, brandId: 1, specifications: ""
      });
      setIsReadOnly(false);
      setShowModal(true);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      if (editingProduct) {
        // Cập nhật thông tin (Chỉ hỗ trợ productName, sku, description, productType, basePrice, categoryId, brandId, specifications, status)
        const updatePayload = {
          productName: formData.productName,
          sku: formData.sku,
          description: formData.description,
          productType: formData.productType,
          basePrice: Number(formData.basePrice),
          categoryId: Number(formData.categoryId),
          brandId: Number(formData.brandId),
          specifications: formData.specifications
        };
        await axiosClient.put(`/manager/products/${editingProduct.productId}`, updatePayload);
        triggerToast("Cập nhật thông tin chung thành công!");
      } else {
        await axiosClient.post("/manager/products", {
          ...formData,
          basePrice: Number(formData.basePrice),
          categoryId: Number(formData.categoryId),
          brandId: Number(formData.brandId)
        });
        triggerToast("Thêm sản phẩm thành công!");
        setShowModal(false);
      }
      fetchProducts();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleOpenVariant = (variant: any = null) => {
    if (variant) {
      setEditingVariant(variant);
      setVariantForm({
        color: variant.color || "",
        price: variant.price || 0,
        stockQuantity: variant.stockQuantity || 0,
        preOrderQuantity: variant.preOrderQuantity || 0,
        variantSku: variant.variantSku || "",
        baseCurve: variant.baseCurve || "",
        diameter: variant.diameter || "",
        refractiveIndex: variant.refractiveIndex || "",
        expectedDateRestock: variant.expectedDateRestock ? variant.expectedDateRestock.split('T')[0] : "",
        status: variant.status !== undefined ? variant.status : 1
      });
    } else {
      setEditingVariant(null);
      setVariantForm({
        color: "", price: 0, stockQuantity: 0, preOrderQuantity: 0,
        variantSku: "", baseCurve: "", diameter: "", refractiveIndex: "", expectedDateRestock: "", status: 1
      });
    }
    setShowVariantForm(true);
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Parse values
    const payload: any = {
      color: variantForm.color,
      price: Number(variantForm.price),
      stockQuantity: Number(variantForm.stockQuantity),
      preOrderQuantity: Number(variantForm.preOrderQuantity),
      variantSku: variantForm.variantSku,
      status: Number(variantForm.status)
    };
    if (variantForm.baseCurve) payload.baseCurve = Number(variantForm.baseCurve);
    if (variantForm.diameter) payload.diameter = Number(variantForm.diameter);
    if (variantForm.refractiveIndex) payload.refractiveIndex = Number(variantForm.refractiveIndex);
    if (variantForm.expectedDateRestock) payload.expectedDateRestock = new Date(variantForm.expectedDateRestock).toISOString();

    try {
      if (editingVariant) {
        // Cập nhật biến thể
        await axiosClient.put(`/manager/products/${editingProduct.productId}/variants/${editingVariant.variantId}`, payload);
        triggerToast("Cập nhật biến thể thành công!");
      } else {
        // Thêm mới biến thể
        await axiosClient.post(`/manager/products/${editingProduct.productId}/variants`, payload);
        triggerToast("Thêm biến thể thành công!");
      }

      setShowVariantForm(false);
      // Tải lại chi tiết sản phẩm để lấy danh sách Variant mới
      const res = await axiosClient.get(`/manager/products/${editingProduct.productId}`);
      setEditingProduct(res.data);
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Lưu biến thể thất bại!");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      await axiosClient.patch(`/manager/products/${productId}/delete`);
      triggerToast("Đã xóa sản phẩm thành công!");
      fetchProducts();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  };

  return (
    <div className="product-manager-wrapper">
      <div className="manager-content-header">
        <h2 style={{ margin: 0 }}></h2>
        <button className="pm-btn-submit" onClick={() => openProductModal(null, false)}>
          + Thêm sản phẩm
        </button>
      </div>

      <div className="pm-variant-card">
        <table className="pm-variant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Mã SKU</th>
              <th>Loại</th>
              <th>Giá sàn</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading ? productList.map((prod) => (
              <tr key={prod.productId}>
                <td>{prod.productId}</td>
                <td style={{ fontWeight: 600 }}>{prod.productName}</td>
                <td>{prod.sku}</td>
                <td>{prod.productType}</td>
                <td>{prod.basePrice?.toLocaleString()} đ</td>
                <td>
                  <span className={`status-badge ${prod.status === 1 ? 'active' : 'inactive'}`}>
                    {prod.status === 1 ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </td>
                <td className="pm-variant-actions">
                  <button title="Xem" className="btn-icon view-btn" onClick={() => openProductModal(prod.productId, true)}>👁️</button>
                  <button title="Sửa" className="btn-icon edit-btn" onClick={() => openProductModal(prod.productId, false)}>📝</button>
                  <button title="Xóa sản phẩm" className="btn-icon delete-btn" onClick={() => handleDeleteProduct(prod.productId)} style={{ background: '#fee2e2', color: '#dc2626' }}>🗑️</button>
                </td>
              </tr>
            )) : <tr><td colSpan={7}>Đang tải...</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="product-modal-overlay">
          <div className="product-modal-content">
            <div className="pm-modal-header">
              <h3 className="pm-modal-title">
                {isReadOnly ? "Chi tiết Sản phẩm" : (editingProduct ? "Cập nhật Sản phẩm" : "Tạo Sản phẩm mới")}
              </h3>
              <button className="pm-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            {/* TAB NAVIGATION: Disable variants tab if creating new product */}
            <div className="pm-tabs">
              <button className={`pm-tab-btn ${modalTab === "info" ? 'active' : ''}`} onClick={() => setModalTab("info")}>Thông tin chung</button>
              {editingProduct && (
                <button className={`pm-tab-btn ${modalTab === "variants" ? 'active' : ''}`} onClick={() => setModalTab("variants")}>Danh sách Biến thể</button>
              )}
            </div>

            <div className="pm-modal-body">
              {modalTab === "info" && (
                <form id="productForm" onSubmit={handleProductSubmit} className="pm-form-grid">
                  <div className="pm-form-group full-width">
                    <label>Tên sản phẩm</label>
                    <input required disabled={isReadOnly} value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })} placeholder="Vd: Ray-Ban Aviator" />
                  </div>
                  <div className="pm-form-group">
                    <label>Mã SKU gốc</label>
                    <input required disabled={isReadOnly} value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="RB-AV-001" />
                  </div>
                  <div className="pm-form-group">
                    <label>Loại sản phẩm (FRAME/SUNGLASSES...)</label>
                    <input required disabled={isReadOnly} value={formData.productType} onChange={e => setFormData({ ...formData, productType: e.target.value })} />
                  </div>
                  <div className="pm-form-group">
                    <label>Category ID (Danh mục)</label>
                    <input type="number" disabled={isReadOnly} value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })} />
                  </div>
                  <div className="pm-form-group">
                    <label>Brand ID (Thương hiệu)</label>
                    <input type="number" disabled={isReadOnly} value={formData.brandId} onChange={e => setFormData({ ...formData, brandId: Number(e.target.value) })} />
                  </div>
                  <div className="pm-form-group">
                    <label>Giá sàn cơ sở (VNĐ)</label>
                    <input type="number" required disabled={isReadOnly} value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })} />
                  </div>
                  {!editingProduct && (
                    <div className="pm-form-group">
                      <label>Trạng thái kinh doanh</label>
                      <select disabled={isReadOnly} value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                        <option value={1}>Đang bán</option>
                        <option value={0}>Ngừng bán</option>
                      </select>
                    </div>
                  )}
                  <div className="pm-form-group full-width">
                    <label>Đặc tả (Specifications)</label>
                    <input disabled={isReadOnly} value={formData.specifications} onChange={e => setFormData({ ...formData, specifications: e.target.value })} placeholder="Chất liệu Gọng/Thông số..." />
                  </div>
                  <div className="pm-form-group full-width">
                    <label>Mô tả chung (Description)</label>
                    <textarea rows={3} disabled={isReadOnly} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </form>
              )}

              {modalTab === "variants" && editingProduct && (
                <div className="pm-variants-container">
                  {/* FORM THÊM/SỬA BIẾN THỂ */}
                  {showVariantForm && !isReadOnly && (
                    <div className="pm-subform">
                      <h4>{editingVariant ? "Chỉnh sửa Biến thể" : "Thêm mới Biến thể"}</h4>
                      <form onSubmit={handleVariantSubmit} className="pm-form-grid" style={{ padding: 0, border: 'none', gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="pm-form-group">
                          <label>Màu sắc *</label>
                          <input required value={variantForm.color} onChange={e => setVariantForm({ ...variantForm, color: e.target.value })} />
                        </div>
                        <div className="pm-form-group">
                          <label>Giá bán Variant *</label>
                          <input type="number" required value={variantForm.price} onChange={e => setVariantForm({ ...variantForm, price: Number(e.target.value) })} />
                        </div>
                        <div className="pm-form-group">
                          <label>SKU Variant</label>
                          <input value={variantForm.variantSku} onChange={e => setVariantForm({ ...variantForm, variantSku: e.target.value })} />
                        </div>
                        <div className="pm-form-group">
                          <label>Số lượng Tồn Kho *</label>
                          <input type="number" required value={variantForm.stockQuantity} onChange={e => setVariantForm({ ...variantForm, stockQuantity: Number(e.target.value) })} />
                        </div>
                        <div className="pm-form-group">
                          <label>Số lượng Pre-Order</label>
                          <input type="number" value={variantForm.preOrderQuantity} onChange={e => setVariantForm({ ...variantForm, preOrderQuantity: Number(e.target.value) })} />
                        </div>
                        <div className="pm-form-group">
                          <label>Ngày Restock dự kiến</label>
                          <input type="date" value={variantForm.expectedDateRestock} onChange={e => setVariantForm({ ...variantForm, expectedDateRestock: e.target.value })} />
                        </div>
                        <div className="pm-form-group">
                          <label>Trạng thái kinh doanh</label>
                          <select value={variantForm.status} onChange={e => setVariantForm({ ...variantForm, status: Number(e.target.value) })}>
                            <option value={1}>Khả dụng</option>
                            <option value={0}>Khóa</option>
                          </select>
                        </div>
                        {editingProduct.productType === 'LENS' || editingProduct.productType === 'CONTACT_LENS' ? (
                          <>
                            <div className="pm-form-group">
                              <label>Refractive Index (Chiết suất)</label>
                              <input value={variantForm.refractiveIndex} onChange={e => setVariantForm({ ...variantForm, refractiveIndex: e.target.value })} />
                            </div>
                            <div className="pm-form-group">
                              <label>Base Curve</label>
                              <input value={variantForm.baseCurve} onChange={e => setVariantForm({ ...variantForm, baseCurve: e.target.value })} />
                            </div>
                            <div className="pm-form-group">
                              <label>Diameter (Đường kính)</label>
                              <input value={variantForm.diameter} onChange={e => setVariantForm({ ...variantForm, diameter: e.target.value })} />
                            </div>
                          </>
                        ) : null}

                        <div className="pm-form-group full-width" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', gridColumn: 'span 3' }}>
                          <button type="button" className="pm-btn-cancel" onClick={() => setShowVariantForm(false)}>Hủy</button>
                          <button type="submit" className="pm-btn-submit">Lưu biến thể</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {!showVariantForm && (
                    <div className="pm-variant-card">
                      <div className="pm-variant-header">
                        <span>Danh sách màu sắc & tồn kho ({editingProduct.variants?.length || 0})</span>
                        {!isReadOnly && <button className="pm-variant-add-btn" onClick={() => handleOpenVariant()}>+ Thêm Biến thể</button>}
                      </div>
                      <table className="pm-variant-table">
                        <thead>
                          <tr>
                            <th>Màu</th>
                            <th>Giá bán</th>
                            <th>Tồn Kho</th>
                            <th>Pre-Order</th>
                            <th>Trạng thái</th>
                            {!isReadOnly && <th>Thao tác</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {editingProduct.variants && editingProduct.variants.length > 0 ? editingProduct.variants.map((v: any) => (
                            <tr key={v.variantId}>
                              <td style={{ fontWeight: 600 }}>{v.color}</td>
                              <td>{v.price.toLocaleString()} đ</td>
                              <td>{v.stockQuantity}</td>
                              <td>{v.preOrderQuantity}</td>
                              <td>{v.status === 1 ? 'Khả dụng' : 'Khóa'}</td>
                              {!isReadOnly && (
                                <td className="pm-variant-actions">
                                  <button className="btn-icon edit-btn" title="Chỉnh sửa biến thể" onClick={() => handleOpenVariant(v)}>📝</button>
                                </td>
                              )}
                            </tr>
                          )) : (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Chưa có biến thể nào</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pm-modal-footer">
              <button className="pm-btn-cancel" onClick={() => setShowModal(false)}>{isReadOnly ? "Đóng" : "Hủy thao tác"}</button>
              {!isReadOnly && modalTab === "info" && (
                <button className="pm-btn-submit" type="submit" form="productForm">Lưu Thay Đổi Sản Phẩm</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;