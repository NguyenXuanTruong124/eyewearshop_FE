import React, { useState } from 'react';
import axiosClient from '../../API_BE/axiosClient';
import './VariantManager.css';

interface VariantManagerProps {
  editingProduct: any;
  isReadOnly: boolean;
  triggerToast: (msg: string) => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void, type?: "danger" | "warning" | "info") => void;
  onUpdateProduct: (product: any) => void;
}

const VariantManager: React.FC<VariantManagerProps> = ({
  editingProduct, isReadOnly, triggerToast, triggerConfirm, onUpdateProduct
}) => {
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [variantForm, setVariantForm] = useState({
    color: "", price: 0, stockQuantity: 0, preOrderQuantity: 0, variantSku: "",
    baseCurve: "", diameter: "", refractiveIndex: "", expectedDateRestock: "", status: 1
  });
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [imageManageVariant, setImageManageVariant] = useState<any>(null);
  const [stagedImages, setStagedImages] = useState<Array<{ file: File, isPrimary: boolean, previewUrl: string }>>([]);

  const handleOpenVariant = (variant: any = null) => {
    setImagesToDelete([]);
    if (variant) {
      setEditingVariant(variant);
      setVariantForm({
        color: variant.color || "", price: variant.price || 0, stockQuantity: variant.stockQuantity || 0, preOrderQuantity: variant.preOrderQuantity || 0,
        variantSku: variant.variantSku || "", baseCurve: variant.baseCurve || "", diameter: variant.diameter || "", refractiveIndex: variant.refractiveIndex || "",
        expectedDateRestock: variant.expectedDateRestock ? variant.expectedDateRestock.split('T')[0] : "",
        status: variant.status !== undefined ? variant.status : 1
      });
    } else {
      setEditingVariant(null);
      setVariantForm({
        color: "", price: 0, stockQuantity: 0, preOrderQuantity: 0, variantSku: "", baseCurve: "", diameter: "", refractiveIndex: "", expectedDateRestock: "", status: 1
      });
    }
    setShowVariantForm(true);
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const payload: any = {
      color: variantForm.color, price: Number(variantForm.price), stockQuantity: Number(variantForm.stockQuantity),
      preOrderQuantity: Number(variantForm.preOrderQuantity), variantSku: variantForm.variantSku, status: Number(variantForm.status)
    };
    if (variantForm.baseCurve) payload.baseCurve = Number(variantForm.baseCurve);
    if (variantForm.diameter) payload.diameter = Number(variantForm.diameter);
    if (variantForm.refractiveIndex) payload.refractiveIndex = Number(variantForm.refractiveIndex);
    if (variantForm.expectedDateRestock) payload.expectedDateRestock = new Date(variantForm.expectedDateRestock).toISOString();

    try {
      if (imagesToDelete.length > 0) {
        for (const imgId of imagesToDelete) {
           try {
             await axiosClient.delete(`/manager/products/${editingProduct.productId}/images/${imgId}`);
           } catch(e) { console.error("Xóa ảnh thất bại:", imgId); }
        }
        triggerToast(`Đã xóa ${imagesToDelete.length} ảnh.`);
        setImagesToDelete([]);
      }

      if (editingVariant) {
        await axiosClient.put(`/manager/products/${editingProduct.productId}/variants/${editingVariant.variantId}`, payload);
        triggerToast("Cập nhật biến thể thành công!");
      } else {
        await axiosClient.post(`/manager/products/${editingProduct.productId}/variants`, payload);
        triggerToast("Thêm biến thể thành công!");
      }
      setShowVariantForm(false);
      const res = await axiosClient.get(`/manager/products/${editingProduct.productId}`);
      onUpdateProduct(res.data);
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Lưu biến thể thất bại!");
    }
  };

  const handleOpenImageManage = (v: any) => {
    setImageManageVariant(v);
    setStagedImages([]);
  };

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newStaged = files.map(file => ({
      file,
      isPrimary: false,
      previewUrl: URL.createObjectURL(file)
    }));
    setStagedImages(prev => [...prev, ...newStaged]);
    e.target.value = ""; 
  };

  const handleConfirmUpload = async () => {
    if (stagedImages.length === 0) return;
    let successCount = 0;
    
    for (const staged of stagedImages) {
      const formDataFile = new FormData();
      formDataFile.append("file", staged.file);
      try {
        await axiosClient.post(
          `/manager/products/${editingProduct.productId}/variants/${imageManageVariant.variantId}/images/upload?sortOrder=0&isPrimary=${staged.isPrimary}`,
          formDataFile,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        successCount++;
      } catch (err: any) {
        console.error("Upload error for file", staged.file.name, err);
      }
    }
    
    triggerToast(`Đã tải lên thành công ${successCount}/${stagedImages.length} ảnh!`);
    
    if (successCount > 0) {
      setStagedImages([]);
      try {
        const res = await axiosClient.get(`/manager/products/${editingProduct.productId}`);
        onUpdateProduct(res.data);
        const updatedVariant = res.data.variants?.find((v:any) => v.variantId === imageManageVariant.variantId);
        setImageManageVariant(updatedVariant);
      } catch (e) {}
    }
  };

  const handleImageDelete = async (imageId: number) => {
    triggerConfirm(
      "Xác nhận xóa ảnh",
      "Bạn có chắc chắn muốn xóa ảnh này không? Hành động này không thể hoàn tác.",
      async () => {
        try {
          await axiosClient.delete(`/manager/products/${editingProduct.productId}/images/${imageId}`);
          triggerToast("Xóa ảnh thành công!");
          const res = await axiosClient.get(`/manager/products/${editingProduct.productId}`);
          onUpdateProduct(res.data);
          const updatedVariant = res.data.variants?.find((v:any) => v.variantId === imageManageVariant?.variantId);
          setImageManageVariant(updatedVariant);
        } catch (err) {
          triggerToast("Lỗi xóa ảnh!");
        }
      },
      "danger"
    );
  };

  return (
    <div className="pm-variants-container">
      {showVariantForm && !isReadOnly && (
        <div className="pm-subform">
          <h4>{editingVariant ? "Chỉnh sửa Biến thể" : "Thêm mới Biến thể"}</h4>
          <form onSubmit={handleVariantSubmit} className="pm-form-grid-3">
            <div className="pm-form-group">
              <label>Màu sắc *</label>
              <input required value={variantForm.color} onChange={e => setVariantForm({ ...variantForm, color: e.target.value })} />
            </div>
            <div className="pm-form-group">
              <label>Giá bán Variant (VNĐ) *</label>
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
              <label>Trạng thái</label>
              <select value={variantForm.status} onChange={e => setVariantForm({ ...variantForm, status: Number(e.target.value) })}>
                <option value={1}>Khả dụng</option>
                <option value={0}>Khóa</option>
              </select>
            </div>
            {['RX_LENS', 'CONTACT_LENS'].includes(editingProduct?.productType) && (
              <>
                <div className="pm-form-group">
                  <label>Refractive Index</label>
                  <input value={variantForm.refractiveIndex} onChange={e => setVariantForm({ ...variantForm, refractiveIndex: e.target.value })} />
                </div>
                <div className="pm-form-group">
                  <label>Base Curve</label>
                  <input value={variantForm.baseCurve} onChange={e => setVariantForm({ ...variantForm, baseCurve: e.target.value })} />
                </div>
                <div className="pm-form-group">
                  <label>Diameter</label>
                  <input value={variantForm.diameter} onChange={e => setVariantForm({ ...variantForm, diameter: e.target.value })} />
                </div>
              </>
            )}
            {/* Image deletion selection during edit */}
            {editingVariant && editingProduct?.images && editingProduct.images.length > 0 && (
              <div className="pm-img-delete-panel">
                <label className="pm-img-delete-label">
                  Ảnh sản phẩm — Click chọn ảnh muốn xóa ({imagesToDelete.length} đã chọn)
                </label>
                <div className="pm-img-delete-grid">
                  {editingProduct.images.map((img: any) => {
                    const isMarked = imagesToDelete.includes(img.imageId);
                    return (
                      <div
                        key={img.imageId}
                        onClick={() => setImagesToDelete(prev =>
                          isMarked ? prev.filter(id => id !== img.imageId) : [...prev, img.imageId]
                        )}
                        className={`pm-img-delete-card ${isMarked ? 'pm-img-delete-card--marked' : img.isPrimary ? 'pm-img-delete-card--primary' : ''}`}
                        title={`Image ID: ${img.imageId}${img.isPrimary ? ' (Ảnh Chính)' : ''}`}
                      >
                        {img.imageUrl
                          ? <img src={img.imageUrl} alt={`img-${img.imageId}`} />
                          : <div className="pm-img-delete-placeholder">
                              <span className="icon">🖼️</span>
                              <span className="id">#{img.imageId}</span>
                            </div>
                        }
                        {img.isPrimary && !isMarked && (
                          <span className="pm-img-star-badge">⭐</span>
                        )}
                        {isMarked && (
                          <div className="pm-img-delete-overlay">
                            <span>🗑️</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {imagesToDelete.length > 0 && (
                  <p className="pm-img-delete-warning">
                    ⚠️ {imagesToDelete.length} ảnh sẽ bị xóa khi bấn "Lưu biến thể"
                  </p>
                )}
              </div>
            )}
            <div className="pm-form-group pm-variant-form-actions">
              <button type="button" className="pm-btn-cancel" onClick={() => setShowVariantForm(false)}>Hủy</button>
              <button type="submit" className="pm-btn-submit">Lưu biến thể</button>
            </div>
          </form>
        </div>
      )}

      {!showVariantForm && (
        <div className="pm-variant-card">
          <div className="pm-variant-header">
            <span>Danh sách Variants ({editingProduct?.variants?.length || 0})</span>
            {!isReadOnly && <button className="pm-variant-add-btn" onClick={() => handleOpenVariant()}>+ Thêm Biến thể</button>}
          </div>
          <table className="pm-variant-table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Màu sắc</th>
                <th>Giá bán</th>
                <th>Tồn Kho</th>
                <th>Pre-Order</th>
                <th>Trạng thái</th>
                {!isReadOnly && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {editingProduct?.variants?.length > 0 ? editingProduct.variants.map((v: any) => (
                <tr key={v.variantId}>
                  <td>
                    {editingProduct.images && editingProduct.images.length > 0 ? (() => {
                      const sorted = [...editingProduct.images].sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
                      const visible = sorted.slice(0, 3);
                      const extra = sorted.length - 3;
                      return (
                        <div className="pm-img-grid">
                          {visible.map((img: any) => (
                            <div key={img.imageId} className="pm-img-thumb-wrap">
                              <img src={img.imageUrl || img.url} alt="variant" className="pm-img-thumb" />
                            </div>
                          ))}
                          {extra > 0 && (
                            <div className="pm-img-extra">
                              +{extra}
                            </div>
                          )}
                        </div>
                      );
                    })() : (
                      <div className="pm-img-placeholder">N/A</div>
                    )}
                  </td>
                  <td className="td-bold">{v.color}</td>
                  <td className="td-price">{v.price.toLocaleString()} đ</td>
                  <td>{v.stockQuantity}</td>
                  <td>{v.preOrderQuantity}</td>
                  <td>
                    <span className={`status-badge ${v.status === 1 ? 'active' : 'inactive'}`}>
                      {v.status === 1 ? 'Khả dụng' : 'Khóa'}
                    </span>
                  </td>
                  {!isReadOnly && (
                    <td className="pm-variant-actions">
                      <button className="btn-icon edit-btn" title="Chỉnh sửa biến thể" onClick={() => handleOpenVariant(v)}>📝</button>
                      <button className="btn-icon view-btn" title="Quản lý Ảnh" onClick={() => handleOpenImageManage(v)}>🖼️</button>
                    </td>
                  )}
                </tr>
              )) : <tr><td colSpan={7} className="pm-table-center">Chưa có biến thể</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Phần hiển thị quản lý ảnh của biến thể */}
      {imageManageVariant && !isReadOnly && (
        <div className="pm-subform pm-image-panel">
          <div className="pm-image-panel-header">
            <h4>Ảnh của Biến thể: {imageManageVariant.color}</h4>
            <button className="pm-btn-cancel" style={{ padding: '6px 12px' }} onClick={() => setImageManageVariant(null)}>Đóng</button>
          </div>
          
          <div className={`pm-image-existing ${stagedImages.length > 0 ? 'pm-image-existing--with-staged' : ''}`}>
            {imageManageVariant.images && imageManageVariant.images.length > 0 ? (
              imageManageVariant.images.map((img: any) => (
                <div key={img.imageId} className={`pm-image-card ${img.isPrimary ? 'pm-image-card--primary' : ''}`}>
                  <img src={img.imageUrl || img.url} alt="variant" />
                  {img.isPrimary && <span className="pm-image-primary-badge">Ảnh Chính</span>}
                  <button onClick={() => handleImageDelete(img.imageId)} className="pm-image-delete-btn">X</button>
                </div>
              ))
            ) : (
              <span className="pm-image-empty">Chưa có ảnh nào trên hệ thống.</span>
            )}
          </div>

          {stagedImages.length > 0 && (
            <div>
              <h5 className="pm-staged-title">Ảnh chờ tải lên ({stagedImages.length})</h5>
              <div className="pm-staged-grid">
                {stagedImages.map((staged, idx) => (
                  <div key={idx} className="pm-staged-item">
                    <div className="pm-staged-preview">
                      <img src={staged.previewUrl} alt="preview" />
                    </div>
                    <label className="pm-staged-label">
                      <input type="checkbox" checked={staged.isPrimary} onChange={(e) => {
                        const newStaged = [...stagedImages];
                        newStaged[idx].isPrimary = e.target.checked;
                        setStagedImages(newStaged);
                      }} /> Chọn làm ảnh chính
                    </label>
                    <button type="button" onClick={() => setStagedImages(stagedImages.filter((_, i) => i !== idx))} className="pm-staged-remove-btn">&times;</button>
                  </div>
                ))}
              </div>
              <div className="pm-staged-actions">
                <button className="pm-btn-submit" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={handleConfirmUpload}>
                  Lưu Ảnh Đã Chọn ({stagedImages.filter(i=>i.isPrimary).length} Primary, {stagedImages.filter(i=>!i.isPrimary).length} Normal)
                </button>
              </div>
            </div>
          )}

          <div className="pm-form-group pm-image-upload-input">
            <label>Thêm ảnh vào Hàng chờ (Chọn nhiều)</label>
            <input type="file" multiple accept="image/*" onChange={handleSelectImages} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantManager;
