import React, { useState, useEffect } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./ProductManager.css";

interface ProductManagerProps {
  triggerToast: (msg: string) => void;
}

const categoryList = [
  { id: 1, name: "Sunglasses" },
  { id: 2, name: "Eyeglasses" },
  { id: 3, name: "Reading Glasses" },
  { id: 4, name: "Contact Lenses" }
];

const brandList = [
  { id: 1, name: "Ray-Ban" },
  { id: 2, name: "Oakley" },
  { id: 3, name: "Gucci" },
  { id: 4, name: "Tom Ford" },
  { id: 5, name: "Essilor" },
  { id: 6, name: "Zeiss" }
];

const productTypeList = [
  { id: "SUNGLASSES", name: "Kính mát (Sunglasses)" },
  { id: "FRAME", name: "Gọng kính (Frame)" },
  { id: "RX_LENS", name: "Tròng kính (RxLens)" },
  { id: "CONTACT_LENS", name: "Kính áp tròng (Contact Lens)" },
  { id: "COMBO", name: "Kính mát & Tròng (Combo)" },
  { id: "OTHER", name: "Khác (Other)" }
];

const ProductManager: React.FC<ProductManagerProps> = ({ triggerToast }) => {
  const [productList, setProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Product
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"info" | "variants">("info");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const getDefaultFormData = () => ({
    productName: "", description: "", basePrice: 0, status: 1, sku: "", productType: "FRAME", categoryId: 1, brandId: 1, specifications: "",
    designType: "", rxLensMaterial: "", lensWidth: 0,
    minSphere: 0, maxSphere: 0, minCylinder: 0, maxCylinder: 0, minAxis: 0, maxAxis: 0, minAdd: 0, maxAdd: 0,
    hasAntiReflective: false, hasBlueLightFilter: false, hasUVProtection: false, hasScratchResistant: false,
    rimType: "", frameMaterial: "", shape: "", weight: 0, a: 0, b: 0, dbl: 0, templeLength: 0, frameLensWidth: 0, hingeType: "", hasNosePads: false,
    baseCurve: 0, diameter: 0, lensType: "", waterContent: 0, oxygenPermeability: 0, replacementSchedule: 0, isToric: false, isMultifocal: false
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  // Variant Add/Edit Subform State
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [variantForm, setVariantForm] = useState({
    color: "", price: 0, stockQuantity: 0, preOrderQuantity: 0, variantSku: "",
    baseCurve: "", diameter: "", refractiveIndex: "", expectedDateRestock: "", status: 1
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/manager/products?page=1&pageSize=30");
      let data = res.data?.items || res.data || [];
      // Sort by Product ID ascending
      data = data.sort((a: any, b: any) => a.productId - b.productId);
      setProductList(data);
    } catch (err) {
      triggerToast("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openProductModal = async (productId: number | null, readOnly: boolean) => {
    setModalTab("info");
    setShowVariantForm(false);
    if (productId) {
      try {
        const res = await axiosClient.get(`/manager/products/${productId}`);
        const prod = res.data;
        setEditingProduct(prod);
        setFormData({
          ...getDefaultFormData(),
          productName: prod.productName || "",
          description: prod.description || "",
          basePrice: prod.basePrice || 0,
          status: prod.status !== undefined ? prod.status : 1,
          sku: prod.sku || "",
          productType: prod.productType || "FRAME",
          categoryId: prod.category?.categoryId || prod.categoryId || 1,
          brandId: prod.brand?.brandId || prod.brandId || 1,
          specifications: prod.specifications || "",
          
          rimType: prod.spec?.rimType || prod.spec?.frameSpec?.rimType || "",
          shape: prod.spec?.shape || prod.spec?.frameSpec?.shape || "",
          frameMaterial: prod.spec?.material || prod.spec?.frameSpec?.material || "",
          weight: prod.spec?.weight || prod.spec?.frameSpec?.weight || 0,
          a: prod.spec?.a || prod.spec?.frameSpec?.a || 0,
          b: prod.spec?.b || prod.spec?.frameSpec?.b || 0,
          dbl: prod.spec?.dbl || prod.spec?.frameSpec?.dbl || 0,
          templeLength: prod.spec?.templeLength || prod.spec?.frameSpec?.templeLength || 0,
          frameLensWidth: prod.spec?.lensWidth || prod.spec?.frameSpec?.lensWidth || 0,
          hingeType: prod.spec?.hingeType || prod.spec?.frameSpec?.hingeType || "",
          hasNosePads: prod.spec?.hasNosePads ?? prod.spec?.frameSpec?.hasNosePads ?? false,

          designType: prod.spec?.designType || prod.spec?.rxLensSpec?.designType || "",
          rxLensMaterial: prod.spec?.material || prod.spec?.rxLensSpec?.material || "",
          lensWidth: prod.spec?.lensWidth || prod.spec?.rxLensSpec?.lensWidth || 0,
          
          minSphere: prod.spec?.minSphere ?? prod.spec?.rxLensSpec?.minSphere ?? 0,
          maxSphere: prod.spec?.maxSphere ?? prod.spec?.rxLensSpec?.maxSphere ?? 0,
          minCylinder: prod.spec?.minCylinder ?? prod.spec?.rxLensSpec?.minCylinder ?? 0,
          maxCylinder: prod.spec?.maxCylinder ?? prod.spec?.rxLensSpec?.maxCylinder ?? 0,
          minAxis: prod.spec?.minAxis ?? prod.spec?.rxLensSpec?.minAxis ?? 0,
          maxAxis: prod.spec?.maxAxis ?? prod.spec?.rxLensSpec?.maxAxis ?? 0,
          minAdd: prod.spec?.minAdd ?? prod.spec?.rxLensSpec?.minAdd ?? 0,
          maxAdd: prod.spec?.maxAdd ?? prod.spec?.rxLensSpec?.maxAdd ?? 0,
          
          hasAntiReflective: prod.spec?.hasAntiReflective ?? prod.spec?.rxLensSpec?.hasAntiReflective ?? false,
          hasBlueLightFilter: prod.spec?.hasBlueLightFilter ?? prod.spec?.rxLensSpec?.hasBlueLightFilter ?? false,
          hasUVProtection: prod.spec?.hasUVProtection ?? prod.spec?.rxLensSpec?.hasUVProtection ?? false,
          hasScratchResistant: prod.spec?.hasScratchResistant ?? prod.spec?.rxLensSpec?.hasScratchResistant ?? false,
          
          baseCurve: prod.spec?.baseCurve ?? 0,
          diameter: prod.spec?.diameter ?? 0,
          lensType: prod.spec?.lensType || "",
          waterContent: prod.spec?.waterContent ?? 0,
          oxygenPermeability: prod.spec?.oxygenPermeability ?? 0,
          replacementSchedule: prod.spec?.replacementSchedule ?? 0,
          isToric: prod.spec?.isToric ?? false,
          isMultifocal: prod.spec?.isMultifocal ?? false
        });
        setIsReadOnly(readOnly);
        setShowModal(true);
      } catch (err) {
        triggerToast("Lỗi khi xem chi tiết (chưa thể tải variant)");
      }
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
      if (editingProduct) {
        const p = formData;
        const basePayload = {
          productName: p.productName, sku: p.sku, description: p.description, basePrice: Number(p.basePrice),
          categoryId: Number(p.categoryId), brandId: Number(p.brandId), specifications: p.specifications
        };
        
        let url = `/manager/products/${editingProduct.productId}`; // fallback
        let finalPayload: any = basePayload;

        if (p.productType === "FRAME") {
          url = `/manager/products/frame/${editingProduct.productId}`;
          finalPayload = { ...basePayload, rimType: p.rimType, material: p.frameMaterial, shape: p.shape, weight: Number(p.weight),
            a: Number(p.a), b: Number(p.b), dbl: Number(p.dbl), templeLength: Number(p.templeLength),
            lensWidth: Number(p.frameLensWidth), hingeType: p.hingeType, hasNosePads: p.hasNosePads };
        } else if (p.productType === "COMBO" || p.productType === "SUNGLASSES") {
          url = `/manager/products/combo/${editingProduct.productId}`;
          finalPayload = { ...basePayload, designType: p.designType, rxLensMaterial: p.rxLensMaterial, lensWidth: Number(p.lensWidth),
            minSphere: Number(p.minSphere), maxSphere: Number(p.maxSphere), minCylinder: Number(p.minCylinder), maxCylinder: Number(p.maxCylinder),
            minAxis: Number(p.minAxis), maxAxis: Number(p.maxAxis), minAdd: Number(p.minAdd), maxAdd: Number(p.maxAdd),
            hasAntiReflective: p.hasAntiReflective, hasBlueLightFilter: p.hasBlueLightFilter, hasUVProtection: p.hasUVProtection, hasScratchResistant: p.hasScratchResistant,
            rimType: p.rimType, frameMaterial: p.frameMaterial, shape: p.shape, weight: Number(p.weight),
            a: Number(p.a), b: Number(p.b), dbl: Number(p.dbl), templeLength: Number(p.templeLength),
            frameLensWidth: Number(p.frameLensWidth), hingeType: p.hingeType, hasNosePads: p.hasNosePads };
        } else if (p.productType === "RX_LENS") {
          url = `/manager/products/lens/${editingProduct.productId}`;
          finalPayload = { ...basePayload, designType: p.designType, material: p.rxLensMaterial, lensWidth: Number(p.lensWidth),
            minSphere: Number(p.minSphere), maxSphere: Number(p.maxSphere), minCylinder: Number(p.minCylinder), maxCylinder: Number(p.maxCylinder),
            minAxis: Number(p.minAxis), maxAxis: Number(p.maxAxis), minAdd: Number(p.minAdd), maxAdd: Number(p.maxAdd),
            hasAntiReflective: p.hasAntiReflective, hasBlueLightFilter: p.hasBlueLightFilter, hasUVProtection: p.hasUVProtection, hasScratchResistant: p.hasScratchResistant };
        } else if (p.productType === "CONTACT_LENS") {
          url = `/manager/products/contact-lens/${editingProduct.productId}`;
          finalPayload = { ...basePayload, baseCurve: Number(p.baseCurve), diameter: Number(p.diameter), lensType: p.lensType, material: p.rxLensMaterial,
            minSphere: Number(p.minSphere), maxSphere: Number(p.maxSphere), minCylinder: Number(p.minCylinder), maxCylinder: Number(p.maxCylinder),
            minAxis: Number(p.minAxis), maxAxis: Number(p.maxAxis), waterContent: Number(p.waterContent),
            oxygenPermeability: Number(p.oxygenPermeability), replacementSchedule: Number(p.replacementSchedule),
            isToric: p.isToric, isMultifocal: p.isMultifocal };
        }

        await axiosClient.put(url, finalPayload);
        triggerToast("Cập nhật thông tin chung thành công!");
      } else {
        const p = formData;
        const payloadBase = {
          productName: p.productName, sku: p.sku, description: p.description, basePrice: Number(p.basePrice),
          categoryId: Number(p.categoryId), brandId: Number(p.brandId), specifications: p.specifications, productType: p.productType
        };

        if (p.productType === "FRAME") {
          await axiosClient.post("/manager/products/frame", {
            ...payloadBase,
            rimType: p.rimType, frameMaterial: p.frameMaterial, shape: p.shape, weight: Number(p.weight),
            a: Number(p.a), b: Number(p.b), dbl: Number(p.dbl), templeLength: Number(p.templeLength),
            frameLensWidth: Number(p.frameLensWidth), hingeType: p.hingeType, hasNosePads: p.hasNosePads,
            material: p.frameMaterial, lensWidth: Number(p.frameLensWidth) // Fallback for backend mapping
          });
        } else if (p.productType === "COMBO" || p.productType === "SUNGLASSES") {
          await axiosClient.post("/manager/products/combo", {
            ...payloadBase,
            designType: p.designType, rxLensMaterial: p.rxLensMaterial, lensWidth: Number(p.lensWidth),
            minSphere: Number(p.minSphere), maxSphere: Number(p.maxSphere), minCylinder: Number(p.minCylinder), maxCylinder: Number(p.maxCylinder),
            minAxis: Number(p.minAxis), maxAxis: Number(p.maxAxis), minAdd: Number(p.minAdd), maxAdd: Number(p.maxAdd),
            hasAntiReflective: p.hasAntiReflective, hasBlueLightFilter: p.hasBlueLightFilter, hasUVProtection: p.hasUVProtection, hasScratchResistant: p.hasScratchResistant,
            rimType: p.rimType, frameMaterial: p.frameMaterial, shape: p.shape, weight: Number(p.weight),
            a: Number(p.a), b: Number(p.b), dbl: Number(p.dbl), templeLength: Number(p.templeLength),
            frameLensWidth: Number(p.frameLensWidth), hingeType: p.hingeType, hasNosePads: p.hasNosePads
          });
        } else if (p.productType === "RX_LENS") {
          await axiosClient.post("/manager/products/rxlens", {
            ...payloadBase,
            designType: p.designType, rxLensMaterial: p.rxLensMaterial, lensWidth: Number(p.lensWidth), material: p.rxLensMaterial,
            minSphere: Number(p.minSphere), maxSphere: Number(p.maxSphere), minCylinder: Number(p.minCylinder), maxCylinder: Number(p.maxCylinder),
            minAxis: Number(p.minAxis), maxAxis: Number(p.maxAxis), minAdd: Number(p.minAdd), maxAdd: Number(p.maxAdd),
            hasAntiReflective: p.hasAntiReflective, hasBlueLightFilter: p.hasBlueLightFilter, hasUVProtection: p.hasUVProtection, hasScratchResistant: p.hasScratchResistant
          });
        } else if (p.productType === "CONTACT_LENS") {
          await axiosClient.post("/manager/products/contactlens", {
            ...payloadBase,
            baseCurve: Number(p.baseCurve), diameter: Number(p.diameter), lensType: p.lensType, material: p.rxLensMaterial, rxLensMaterial: p.rxLensMaterial,
            minSphere: Number(p.minSphere), maxSphere: Number(p.maxSphere), minCylinder: Number(p.minCylinder), maxCylinder: Number(p.maxCylinder),
            minAxis: Number(p.minAxis), maxAxis: Number(p.maxAxis), waterContent: Number(p.waterContent),
            oxygenPermeability: Number(p.oxygenPermeability), replacementSchedule: Number(p.replacementSchedule),
            isToric: p.isToric, isMultifocal: p.isMultifocal
          });
        }
        triggerToast("Thêm sản phẩm thành công!");
        setShowModal(false);
      }
      fetchProducts();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

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
      // 1. Xóa các ảnh đã chọn
      if (imagesToDelete.length > 0) {
        for (const imgId of imagesToDelete) {
          try {
            await axiosClient.delete(`/manager/products/${editingProduct.productId}/images/${imgId}`);
          } catch (e) {
            console.error("Xóa ảnh thất bại:", imgId);
          }
        }
        triggerToast(`Đã xóa ${imagesToDelete.length} ảnh.`);
        setImagesToDelete([]);
      }

      // 2. Lưu biến thể
      if (editingVariant) {
        await axiosClient.put(`/manager/products/${editingProduct.productId}/variants/${editingVariant.variantId}`, payload);
        triggerToast("Cập nhật biến thể thành công!");
      } else {
        await axiosClient.post(`/manager/products/${editingProduct.productId}/variants`, payload);
        triggerToast("Thêm biến thể thành công!");
      }
      setShowVariantForm(false);
      const res = await axiosClient.get(`/manager/products/${editingProduct.productId}`);
      setEditingProduct(res.data);
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Lưu biến thể thất bại!");
    }
  };

  const [imageManageVariant, setImageManageVariant] = useState<any>(null);
  const [stagedImages, setStagedImages] = useState<Array<{ file: File, isPrimary: boolean, previewUrl: string }>>([]);

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
    e.target.value = ""; // clear input
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
        setEditingProduct(res.data);
        const updatedVariant = res.data.variants.find((v:any) => v.variantId === imageManageVariant.variantId);
        setImageManageVariant(updatedVariant);
      } catch (e) {}
    }
  };

  const handleImageDelete = async (imageId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
    try {
      await axiosClient.delete(`/manager/products/${editingProduct.productId}/images/${imageId}`);
      triggerToast("Xóa ảnh thành công!");
      const res = await axiosClient.get(`/manager/products/${editingProduct.productId}`);
      setEditingProduct(res.data);
      const updatedVariant = res.data.variants.find((v:any) => v.variantId === imageManageVariant.variantId);
      setImageManageVariant(updatedVariant);
    } catch (err) {
      triggerToast("Lỗi xóa ảnh!");
    }
  };

  const handleDeleteProduct = async (productId: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const actionText = newStatus === 1 ? "mở bán lại" : "ngừng bán";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} sản phẩm này không?`)) return;
    try {
      await axiosClient.put(`/manager/products/${newStatus}/products/${productId}`);
      triggerToast(`Đã ${actionText} sản phẩm thành công!`);
      fetchProducts();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const isFrameGroup = ["FRAME", "COMBO", "SUNGLASSES"].includes(formData.productType);
  const isLensGroup = ["RX_LENS", "COMBO", "SUNGLASSES"].includes(formData.productType);
  const isContactGroup = ["CONTACT_LENS"].includes(formData.productType);

  return (
    <div className="product-manager-wrapper">
      <div className="manager-content-header">
        <h2>Quản lý Sản phẩm</h2>
        <button className="pm-btn-submit" onClick={() => openProductModal(null, false)}>
          <i className="fas fa-plus" /> Thêm sản phẩm
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
                <td className="td-bold">{prod.productName}</td>
                <td>{prod.sku}</td>
                <td><span className="type-badge">{prod.productType}</span></td>
                <td className="td-price">{prod.basePrice?.toLocaleString()} đ</td>
                <td>
                  <span className={`status-badge ${prod.status === 1 ? 'active' : 'inactive'}`}>
                    {prod.status === 1 ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </td>
                <td className="pm-variant-actions">
                  <button title="Xem chi tiết" className="btn-icon view-btn" onClick={() => openProductModal(prod.productId, true)}>👁️</button>
                  <button title="Chỉnh sửa chung" className="btn-icon edit-btn" onClick={() => openProductModal(prod.productId, false)}>📝</button>
                  <button title={prod.status === 1 ? "Ngừng bán" : "Mở bán lại"} className={`btn-icon delete-btn ${prod.status === 1 ? 'btn-lock-active' : 'btn-lock-inactive'}`} onClick={() => handleDeleteProduct(prod.productId, prod.status)}> {prod.status === 1 ? '🔒' : '🔓'} </button>
                </td>
              </tr>
            )) : <tr><td colSpan={7} className="pm-table-center">Đang tải dữ liệu...</td></tr>}
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

            <div className="pm-tabs">
              <button className={`pm-tab-btn ${modalTab === "info" ? 'active' : ''}`} onClick={() => setModalTab("info")}>Thông tin chung</button>
              {editingProduct && (
                <button className={`pm-tab-btn ${modalTab === "variants" ? 'active' : ''}`} onClick={() => setModalTab("variants")}>Danh sách Biến thể</button>
              )}
            </div>

            <div className="pm-modal-body">
              {modalTab === "info" && (
                <form id="productForm" onSubmit={handleProductSubmit}>
                  
                  {/* 🖼️ Phân vùng Ảnh sản phẩm */}
                  {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                    <div className="pm-form-section pm-images-preview-section">
                      <h4 className="pm-section-title-modern">🖼️ Hình ảnh sản phẩm</h4>
                      <div className="pm-images-horizontal-list">
                        {editingProduct.images.map((img: any) => (
                          <div key={img.imageId} className={`pm-img-card ${img.isPrimary ? 'primary' : ''}`}>
                            <img src={img.imageUrl || img.url} alt="product" />
                            {img.isPrimary && <span className="primary-badge">Ảnh chính</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BẢNG THÔNG TIN TỔNG QUAN */}
                  <div className="pm-form-section">
                    <h4 className="pm-section-title-modern">📦 Thông Tin Cơ Bản</h4>
                    
                    {!editingProduct && !isReadOnly && (
                      <div className="pm-form-group-highlight">
                        <label>Chọn Loại Sản Phẩm (API Create Target)</label>
                        <select 
                          className="premium-select"
                          value={formData.productType} 
                          onChange={e => setFormData({ ...formData, productType: e.target.value })}
                        >
                          {productTypeList.map(pt => (
                            <option key={pt.id} value={pt.id}>{pt.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="pm-form-grid-3">
                      <div className="pm-form-group pm-col-span-2">
                        <label>Tên sản phẩm *</label>
                        <input required disabled={isReadOnly} value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })} placeholder="Vd: Kính râm Ray-Ban Classic" />
                      </div>
                      <div className="pm-form-group">
                        <label>Mã SKU gốc *</label>
                        <input required disabled={isReadOnly} value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="RB-CLA-001" />
                      </div>

                      <div className="pm-form-group">
                        <label>Giá sàn cơ sở (VNĐ) *</label>
                        <input type="number" required disabled={isReadOnly} value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })} />
                      </div>
                      <div className="pm-form-group">
                        <label>Thương hiệu (Brand) *</label>
                        <select disabled={isReadOnly} value={formData.brandId} onChange={e => setFormData({ ...formData, brandId: Number(e.target.value) })}>
                          {brandList.map(b => <option key={b.id} value={b.id}>{b.id} - {b.name}</option>)}
                        </select>
                      </div>
                      <div className="pm-form-group">
                        <label>Danh mục (Category) *</label>
                        <select disabled={isReadOnly} value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })}>
                          {categoryList.map(c => <option key={c.id} value={c.id}>{c.id} - {c.name}</option>)}
                        </select>
                      </div>

                      {editingProduct && (
                        <div className="pm-form-group">
                          <label>Loại (ProductType)</label>
                          <select disabled value={formData.productType}>
                            {productTypeList.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                          </select>
                        </div>
                      )}

                      <div className="pm-form-group">
                        <label>Hiển thị (Trạng thái)</label>
                        <select disabled={isReadOnly} value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                          <option value={1}>Đang bán</option>
                          <option value={0}>Ngừng kinh doanh</option>
                        </select>
                      </div>

                      <div className="pm-form-group pm-col-span-3">
                        <label>Đặc tả ngắn (Specifications)</label>
                        <input disabled={isReadOnly} value={formData.specifications} onChange={e => setFormData({ ...formData, specifications: e.target.value })} placeholder="Dành cho NAM, form chữ nhật..." />
                      </div>
                      <div className="pm-form-group pm-col-span-3">
                        <label>Mô tả chi tiết (Description)</label>
                        <textarea rows={3} disabled={isReadOnly} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Thông tin quảng bá bài viết..." />
                      </div>
                    </div>
                  </div>

                  {/* THÔNG SỐ ĐẶC TẢ - HIỂN THỊ CẢ KHI XEM VÀ SỬA */}
                  <div className="pm-specs-wrapper">
                      {/* ==== THÔNG SỐ GỌNG KÍNH ==== */}
                      {isFrameGroup && (
                        <div className="pm-form-section pm-form-section--frame">
                          <h4 className="pm-section-title-modern pm-section-title-modern--frame">👓 Thông Số Gọng Kính (Frame Specs)</h4>
                          <div className="pm-form-grid-4">
                            <div className="pm-form-group"><label>Rim Type</label><input disabled={isReadOnly} placeholder="Full Rim / Half Rim" value={formData.rimType} onChange={e => setFormData({...formData, rimType: e.target.value})} /></div>
                            <div className="pm-form-group"><label>Shape</label><input disabled={isReadOnly} placeholder="Round / Square / Aviator" value={formData.shape} onChange={e => setFormData({...formData, shape: e.target.value})} /></div>
                            <div className="pm-form-group"><label>Hinge Type</label><input disabled={isReadOnly} placeholder="Spring / Standard" value={formData.hingeType} onChange={e => setFormData({...formData, hingeType: e.target.value})} /></div>
                            <div className="pm-form-group"><label>Frame Material</label><input disabled={isReadOnly} placeholder="Acetate / Titanium" value={formData.frameMaterial} onChange={e => setFormData({...formData, frameMaterial: e.target.value})} /></div>
                            
                            <div className="pm-form-group"><label>Frame Lens Width (mm)</label><input disabled={isReadOnly} type="number" value={formData.frameLensWidth} onChange={e => setFormData({...formData, frameLensWidth: Number(e.target.value)})} /></div>
                            <div className="pm-form-group"><label>Weight (g)</label><input disabled={isReadOnly} type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} /></div>
                            <div className="pm-form-group"><label>Temple Length (mm)</label><input disabled={isReadOnly} type="number" value={formData.templeLength} onChange={e => setFormData({...formData, templeLength: Number(e.target.value)})} /></div>
                            <div className="pm-form-group"><label>DBL (Nose Bridge) (mm)</label><input disabled={isReadOnly} type="number" value={formData.dbl} onChange={e => setFormData({...formData, dbl: Number(e.target.value)})} /></div>
                            
                            <div className="pm-form-group"><label>A (Lens Width) (mm)</label><input disabled={isReadOnly} type="number" value={formData.a} onChange={e => setFormData({...formData, a: Number(e.target.value)})} /></div>
                            <div className="pm-form-group"><label>B (Lens Height) (mm)</label><input disabled={isReadOnly} type="number" value={formData.b} onChange={e => setFormData({...formData, b: Number(e.target.value)})} /></div>
                            <div className="pm-form-group pm-col-span-2">
                               <label className="pm-form-group-checkbox pm-nosepads-wrapper">
                                 <input disabled={isReadOnly} type="checkbox" checked={formData.hasNosePads} onChange={e => setFormData({...formData, hasNosePads: e.target.checked})} />
                                 Có Đệm Mũi (Has Nose Pads)
                               </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ==== THÔNG SỐ TRÒNG CẬN / MÁT ==== */}
                      {isLensGroup && (
                        <div className="pm-form-section pm-form-section--lens">
                          <h4 className="pm-section-title-modern pm-section-title-modern--lens">🥽 Thông Số Tròng Kính (Lens Specs)</h4>
                          <div className="pm-form-grid-4">
                            <div className="pm-form-group"><label>Design Type</label><input disabled={isReadOnly} placeholder="Single Vision / Progressive" value={formData.designType} onChange={e => setFormData({...formData, designType: e.target.value})} /></div>
                            <div className="pm-form-group"><label>RxLens Material</label><input disabled={isReadOnly} placeholder="Polycarbonate / Trivex" value={formData.rxLensMaterial} onChange={e => setFormData({...formData, rxLensMaterial: e.target.value})} /></div>
                            <div className="pm-form-group"><label>Lens Width (mm)</label><input disabled={isReadOnly} type="number" value={formData.lensWidth} onChange={e => setFormData({...formData, lensWidth: Number(e.target.value)})} /></div>
                            <div className="pm-form-group"></div> {/* Empty spacer */}

                            <div className="pm-form-group">
                              <label>Sphere (Độ cận/viễn)</label>
                              <div className="min-max-group">
                                <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minSphere} onChange={e => setFormData({...formData, minSphere: Number(e.target.value)})} />
                                <span>~</span>
                                <input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxSphere} onChange={e => setFormData({...formData, maxSphere: Number(e.target.value)})} />
                              </div>
                            </div>
                            <div className="pm-form-group">
                              <label>Cylinder (Độ loạn)</label>
                              <div className="min-max-group">
                                <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minCylinder} onChange={e => setFormData({...formData, minCylinder: Number(e.target.value)})} />
                                <span>~</span>
                                <input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxCylinder} onChange={e => setFormData({...formData, maxCylinder: Number(e.target.value)})} />
                              </div>
                            </div>
                            <div className="pm-form-group">
                              <label>Axis (Trục loạn)</label>
                              <div className="min-max-group">
                                <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minAxis} onChange={e => setFormData({...formData, minAxis: Number(e.target.value)})} />
                                <span>~</span>
                                <input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxAxis} onChange={e => setFormData({...formData, maxAxis: Number(e.target.value)})} />
                              </div>
                            </div>
                            <div className="pm-form-group">
                              <label>Add (Độ đọc chữ)</label>
                              <div className="min-max-group">
                                <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minAdd} onChange={e => setFormData({...formData, minAdd: Number(e.target.value)})} />
                                <span>~</span>
                                <input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxAdd} onChange={e => setFormData({...formData, maxAdd: Number(e.target.value)})} />
                              </div>
                            </div>

                            <label className="pm-form-group-checkbox"><input disabled={isReadOnly} type="checkbox" checked={formData.hasAntiReflective} onChange={e => setFormData({...formData, hasAntiReflective: e.target.checked})} /> Chống Lóa (Anti-Reflective)</label>
                            <label className="pm-form-group-checkbox"><input disabled={isReadOnly} type="checkbox" checked={formData.hasBlueLightFilter} onChange={e => setFormData({...formData, hasBlueLightFilter: e.target.checked})} /> Lọc Ánh Sáng Xanh</label>
                            <label className="pm-form-group-checkbox"><input disabled={isReadOnly} type="checkbox" checked={formData.hasUVProtection} onChange={e => setFormData({...formData, hasUVProtection: e.target.checked})} /> Chống Tia UV</label>
                            <label className="pm-form-group-checkbox"><input disabled={isReadOnly} type="checkbox" checked={formData.hasScratchResistant} onChange={e => setFormData({...formData, hasScratchResistant: e.target.checked})} /> Chống Trầy Xước</label>
                          </div>
                        </div>
                      )}

                      {/* ==== THÔNG SỐ KÍNH ÁP TRÒNG ==== */}
                      {isContactGroup && (
                        <div className="pm-form-section pm-form-section--contact">
                          <h4 className="pm-section-title-modern pm-section-title-modern--contact">👁️ Thông Số Kính Áp Tròng (Contact Lens Specs)</h4>
                          <div className="pm-form-grid-4">
                            <div className="pm-form-group"><label>Lens Type</label><input disabled={isReadOnly} placeholder="Soft / Hard" value={formData.lensType} onChange={e => setFormData({...formData, lensType: e.target.value})} /></div>
                            <div className="pm-form-group"><label>Material (Chất liệu)</label><input disabled={isReadOnly} placeholder="Silicone Hydrogel" value={formData.rxLensMaterial} onChange={e => setFormData({...formData, rxLensMaterial: e.target.value})} /></div>
                            <div className="pm-form-group"><label>Base Curve (Độ cong)</label><input disabled={isReadOnly} type="number" step="0.01" value={formData.baseCurve} onChange={e => setFormData({...formData, baseCurve: Number(e.target.value)})} /></div>
                            <div className="pm-form-group"><label>Diameter (Đường kính)</label><input disabled={isReadOnly} type="number" step="0.01" value={formData.diameter} onChange={e => setFormData({...formData, diameter: Number(e.target.value)})} /></div>
                            
                            <div className="pm-form-group"><label>Water Content (%)</label><input disabled={isReadOnly} type="number" step="1" value={formData.waterContent} onChange={e => setFormData({...formData, waterContent: Number(e.target.value)})} /></div>
                            <div className="pm-form-group"><label>Oxygen Permeability</label><input disabled={isReadOnly} type="number" step="1" value={formData.oxygenPermeability} onChange={e => setFormData({...formData, oxygenPermeability: Number(e.target.value)})} /></div>
                            <div className="pm-form-group"><label>Replacement (Days)</label><input disabled={isReadOnly} type="number" step="1" value={formData.replacementSchedule} onChange={e => setFormData({...formData, replacementSchedule: Number(e.target.value)})} /></div>
                            <div className="pm-form-group"></div>
 
                             <div className="pm-form-group">
                               <label>Sphere (Độ cận/viễn)</label>
                               <div className="min-max-group">
                                 <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minSphere} onChange={e => setFormData({...formData, minSphere: Number(e.target.value)})} /><span>~</span><input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxSphere} onChange={e => setFormData({...formData, maxSphere: Number(e.target.value)})} />
                               </div>
                             </div>
                             <div className="pm-form-group">
                               <label>Cylinder (Độ loạn)</label>
                               <div className="min-max-group">
                                 <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minCylinder} onChange={e => setFormData({...formData, minCylinder: Number(e.target.value)})} /><span>~</span><input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxCylinder} onChange={e => setFormData({...formData, maxCylinder: Number(e.target.value)})} />
                               </div>
                             </div>
                             <div className="pm-form-group">
                               <label>Axis (Trục loạn)</label>
                               <div className="min-max-group">
                                 <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minAxis} onChange={e => setFormData({...formData, minAxis: Number(e.target.value)})} /><span>~</span><input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxAxis} onChange={e => setFormData({...formData, maxAxis: Number(e.target.value)})} />
                               </div>
                             </div>
                             <div className="pm-form-group">
                               <label className="pm-form-group-checkbox pm-checkbox-group--inline">
                                 <input disabled={isReadOnly} type="checkbox" checked={formData.isToric} onChange={e => setFormData({...formData, isToric: e.target.checked})} /> Is Toric (Loạn thị)
                               </label>
                               <label className="pm-form-group-checkbox">
                                 <input disabled={isReadOnly} type="checkbox" checked={formData.isMultifocal} onChange={e => setFormData({...formData, isMultifocal: e.target.checked})} /> Multifocal (Đa tròng)
                               </label>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                </form>
              )}

              {modalTab === "variants" && editingProduct && (
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
                        {['RX_LENS', 'CONTACT_LENS'].includes(editingProduct.productType) && (
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
                      {/* Image selection panel for deletion - chỉ hiện khi đang chỉnh sửa */}
                      {editingVariant && editingProduct.images && editingProduct.images.length > 0 && (
                        <div style={{ gridColumn: 'span 3', marginTop: '4px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                            Ảnh sản phẩm — Click chọn ảnh muốn xóa ({imagesToDelete.length} đã chọn)
                          </label>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {editingProduct.images.map((img: any) => {
                              const isMarked = imagesToDelete.includes(img.imageId);
                              return (
                                <div
                                  key={img.imageId}
                                  onClick={() => setImagesToDelete(prev =>
                                    isMarked ? prev.filter(id => id !== img.imageId) : [...prev, img.imageId]
                                  )}
                                  style={{
                                    position: 'relative', width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                                    border: isMarked ? '3px solid #ef4444' : img.isPrimary ? '2px solid #f59e0b' : '2px solid #e2e8f0',
                                    opacity: isMarked ? 0.6 : 1,
                                    transition: 'all 0.2s'
                                  }}
                                  title={`Image ID: ${img.imageId}${img.isPrimary ? ' (Ảnh Chính)' : ''}`}
                                >
                                  {img.imageUrl
                                    ? <img src={img.imageUrl} alt={`img-${img.imageId}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontSize: '18px' }}>🖼️</span>
                                        <span style={{ fontSize: '9px', color: '#64748b' }}>#{img.imageId}</span>
                                      </div>
                                  }
                                  {img.isPrimary && !isMarked && (
                                    <span style={{ position: 'absolute', top: '2px', left: '2px', background: '#f59e0b', color: 'white', borderRadius: '3px', fontSize: '8px', padding: '1px 3px', fontWeight: 700 }}>⭐</span>
                                  )}
                                  {isMarked && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <span style={{ fontSize: '24px' }}>🗑️</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {imagesToDelete.length > 0 && (
                            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
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
                        <span>Danh sách Variants ({editingProduct.variants?.length || 0})</span>
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
                          {editingProduct.variants?.length > 0 ? editingProduct.variants.map((v: any) => (
                            <tr key={v.variantId}>
                              <td>
                                {editingProduct.images && editingProduct.images.length > 0 ? (() => {
                                  // Sort: primary first
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

                  {/* Phần hiển thị ảnh của Biến thể được chọn */}
                  {imageManageVariant && !isReadOnly && (
                    <div className="pm-subform" style={{ marginTop: '24px', borderColor: '#10b981', background: '#f0fdf4' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, color: '#047857' }}>Ảnh của Biến thể: {imageManageVariant.color}</h4>
                        <button className="pm-btn-cancel" style={{ padding: '6px 12px' }} onClick={() => setImageManageVariant(null)}>Đóng</button>
                      </div>
                      
                      {/* Đang có hình */}
                      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', borderBottom: stagedImages.length > 0 ? '1px dashed #6ee7b7' : 'none', marginBottom: stagedImages.length > 0 ? '16px' : '0' }}>
                        {imageManageVariant.images && imageManageVariant.images.length > 0 ? (
                          imageManageVariant.images.map((img: any) => (
                            <div key={img.imageId} style={{ position: 'relative', width: '120px', height: '120px', border: img.isPrimary ? '3px solid #f59e0b' : '1px solid #d1fae5', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={img.imageUrl || img.url} alt="variant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {img.isPrimary && <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(245, 158, 11, 0.9)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '2px 0', fontWeight: 'bold' }}>Ảnh Chính</span>}
                              <button onClick={() => handleImageDelete(img.imageId)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>X</button>
                            </div>
                          ))
                        ) : (
                          <span style={{ color: '#64748b' }}>Chưa có ảnh nào trên hệ thống.</span>
                        )}
                      </div>

                      {/* Hàng chờ Tải lên (Staged) */}
                      {stagedImages.length > 0 && (
                        <div>
                          <h5 style={{ margin: '0 0 12px 0', color: '#0d9488' }}>Ảnh chờ tải lên ({stagedImages.length})</h5>
                          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
                            {stagedImages.map((staged, idx) => (
                              <div key={idx} style={{ position: 'relative', width: '100px', flexShrink: 0 }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px dashed #94a3b8', marginBottom: '8px' }}>
                                  <img src={staged.previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer', justifyContent: 'center' }}>
                                  <input type="checkbox" checked={staged.isPrimary} onChange={(e) => {
                                    const newStaged = [...stagedImages];
                                    newStaged[idx].isPrimary = e.target.checked;
                                    setStagedImages(newStaged);
                                  }} /> isPrimary
                                </label>
                                <button type="button" onClick={() => setStagedImages(stagedImages.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>&times;</button>
                              </div>
                            ))}
                          </div>
                          
                          <div style={{ marginTop: '12px', textAlign: 'right' }}>
                            <button className="pm-btn-submit" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={handleConfirmUpload}>
                              Lưu Ảnh Đã Chọn ({stagedImages.filter(i=>i.isPrimary).length} Primary, {stagedImages.filter(i=>!i.isPrimary).length} Normal)
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="pm-form-group" style={{ marginTop: '16px', maxWidth: '300px' }}>
                        <label>Thêm ảnh vào Hàng chờ (Chọn nhiều)</label>
                        <input type="file" multiple accept="image/*" onChange={handleSelectImages} style={{ background: '#fff' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pm-modal-footer">
              <button className="pm-btn-cancel" onClick={() => setShowModal(false)}>{isReadOnly ? "Đóng" : "Hủy bỏ"}</button>
              {!isReadOnly && modalTab === "info" && (
                <button className="pm-btn-submit" type="submit" form="productForm">
                  Lưu Thông Tin Sản Phẩm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;