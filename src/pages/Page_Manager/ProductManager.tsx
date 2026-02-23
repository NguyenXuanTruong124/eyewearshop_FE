import React, { useState, useEffect } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./ProductManager.css";

interface ProductManagerProps {
  triggerToast: (msg: string) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ triggerToast }) => {
  const [productList, setProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    basePrice: 0,
    status: 1,
    sku: "",
    productType: "FRAME",
    categoryId: 1,
    brandId: 1
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/manager/products?page=1&pageSize=20");
      setProductList(res.data?.items || []);
    } catch (err) {
      triggerToast("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // HÀM XEM CHI TIẾT: Vẫn hiện dữ liệu để đối chiếu
  const handleViewDetail = async (productId: number) => {
    try {
      const res = await axiosClient.get(`/manager/products/${productId}`);
      setEditingProduct(res.data);
      setFormData(res.data);
      setIsReadOnly(true);
      setShowModal(true);
    } catch (err) {
      triggerToast("Lỗi khi xem chi tiết");
    }
  };

  // HÀM SỬA: Không hiện dữ liệu cũ, chỉ hiện form trống
  const handleEditInit = (product: any) => {
    setEditingProduct(product);
    // Reset form về rỗng để người dùng tự điền mới hoàn toàn
    setFormData({
      productName: "",
      description: "",
      basePrice: 0,
      status: 1,
      sku: "",
      productType: "FRAME",
      categoryId: 1,
      brandId: 1
    });
    setIsReadOnly(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Chỉ gửi 4 trường bắt buộc cho API Update
        const updatePayload = {
          productName: formData.productName,
          description: formData.description,
          basePrice: Number(formData.basePrice),
          status: Number(formData.status)
        };
        await axiosClient.put(`/manager/products/${editingProduct.productId}`, updatePayload);
        triggerToast("Cập nhật thông tin thành công!");
      } else {
        // Gửi đủ 7 trường cho API Thêm mới
        await axiosClient.post("/manager/products", {
          ...formData,
          basePrice: Number(formData.basePrice),
          categoryId: Number(formData.categoryId),
          brandId: Number(formData.brandId)
        });
        triggerToast("Thêm sản phẩm thành công!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  return (
    <div className="product-manager-wrapper">
      <div className="manager-content-header">
        <div className="header-text">
          
        </div>
        <button className="btn-add-account" onClick={() => { 
          setEditingProduct(null); 
          setIsReadOnly(false); 
          setFormData({ productName: "", description: "", basePrice: 0, status: 1, sku: "", productType: "FRAME", categoryId: 1, brandId: 1 });
          setShowModal(true); 
        }}>
          + Thêm sản phẩm mới
        </button>
      </div>

      <div className="data-table-container">
        <table className="manager-custom-table">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Mã SKU</th>
              <th>Giá niêm yết</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading ? productList.map((prod) => (
              <tr key={prod.productId}>
                <td>{prod.productName}</td>
                <td>{prod.sku}</td>
                <td>{prod.basePrice?.toLocaleString()}đ</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon view-btn" onClick={() => handleViewDetail(prod.productId)}>👁️</button>
                    {/* Truyền trực tiếp object sản phẩm để lấy ID khi submit */}
                    <button className="btn-icon edit-btn" onClick={() => handleEditInit(prod)}>📝</button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={4}>Đang tải danh sách...</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              {isReadOnly ? "Thông tin chi tiết" : (editingProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới")}
            </h3>
            
            <form onSubmit={handleSubmit} className="product-form">
              {/* PHẦN ĐIỀN CHUNG: Tên, Giá, Trạng thái, Mô tả */}
              <div className="form-group">
                <label>Tên sản phẩm mới</label>
                <input 
                  placeholder="Nhập tên sản phẩm..."
                  disabled={isReadOnly} 
                  value={formData.productName} 
                  onChange={e => setFormData({...formData, productName: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Giá bán (VNĐ)</label>
                <input 
                  placeholder="Ví dụ: 500000"
                  disabled={isReadOnly} 
                  type="number" 
                  value={formData.basePrice} 
                  onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Trạng thái kinh doanh (1: Đang bán, 0: Ngừng bán)</label>
                <input 
                  placeholder="Nhập 1 hoặc 0"
                  disabled={isReadOnly} 
                  type="number" 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: Number(e.target.value)})} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea 
                  placeholder="Thông tin về chất liệu, kích thước..."
                  disabled={isReadOnly} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  rows={3} 
                />
              </div>

              {/* PHẦN CHỈ ĐIỀN KHI THÊM MỚI (POST) */}
              {!editingProduct && !isReadOnly && (
                <div className="extra-fields">
                  <div className="form-group">
                    <label>Mã SKU hệ thống</label>
                    <input 
                      placeholder="Ví dụ: RB-AV-001"
                      value={formData.sku} 
                      onChange={e => setFormData({...formData, sku: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Loại hàng (FRAME hoặc LENS)</label>
                    <input 
                      placeholder="FRAME"
                      value={formData.productType} 
                      onChange={e => setFormData({...formData, productType: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}>
                  {isReadOnly ? "Đóng" : "Hủy bỏ"}
                </button>
                {!isReadOnly && (
                  <button type="submit" className="btn-submit-form">
                    Xác nhận {editingProduct ? "cập nhật" : "thêm mới"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;