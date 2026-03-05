import React, { useState, useEffect } from 'react';
import axiosClient from "../../API_BE/axiosClient";
import toast from 'react-hot-toast';
import './Operations.css';

const Operations: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy tên nhân viên từ localStorage
  const staffName = localStorage.getItem('fullName') || 'Nhân viên';

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchStaffOrders = async () => {
    try {
      setLoading(true);
      // Gọi API lấy toàn bộ đơn hàng hệ thống
      const res = await axiosClient.get('/orders/all?page=1&pageSize=50');
      const data = res.data?.items || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setOrders([]);
      toast.error("Lỗi tải danh sách vận hành");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffOrders();
  }, []);

  const handleViewDetail = async (orderId: number) => {
    try {
      toast.loading("Đang tải dữ liệu...", { id: 'ops-detail' });
      const res = await axiosClient.get(`/orders/staff-view/${orderId}`);
      if (res.data) {
        setSelectedOrder(res.data);
        setShowModal(true);
        toast.dismiss('ops-detail');
      }
    } catch (e) {
      toast.dismiss('ops-detail');
      toast.error("Không thể lấy chi tiết đơn hàng");
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axiosClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }
  };

  const updateProgress = async (id: number, nextStatus: number) => {
    const actionName = nextStatus === 6 ? "Hủy đơn" : "Cập nhật";
    
    if (nextStatus === 6 && !window.confirm("Bạn có chắc chắn muốn HỦY đơn hàng này không?")) {
      return;
    }

    try {
      // API cập nhật trạng thái đơn hàng
      await axiosClient.put(`/orders/${id}/status`, { newStatus: nextStatus });
      toast.success(`${actionName} thành công!`);
      fetchStaffOrders();
    } catch (e) {
      toast.error(`Lỗi thao tác ${actionName.toLowerCase()}`);
    }
  };

  const getStatusInfo = (status: number) => {
    const config: Record<number, { text: string; class: string }> = {
      2: { text: 'CHỜ XỬ LÝ', class: 'confirmed' },
      3: { text: 'ĐANG GIA CÔNG', class: 'processing' },
      4: { text: 'ĐANG GIAO', class: 'shipped' },
      5: { text: 'ĐÃ GIAO', class: 'delivered' },
      7: { text: 'HOÀN TẤT', class: 'completed' }
    };
    return config[status] || { text: 'N/A', class: 'na' };
  };

  if (loading) return <div className="loading-screen">Đang tải dữ liệu...</div>;

  return (
    <div className="staff-page-wrapper">
      <header className="staff-navbar-new">
        <div className="nav-left">
          <span className="brand-logo">EyewearHut</span>
          <span className="nav-divider">|</span>
          <span className="nav-role">Phòng Operations</span>
        </div>
        <div className="nav-right">
          <div className="staff-info-display">
            <p>Xin chào,</p>
            <p>{staffName}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout-new">🚪 Đăng xuất</button>
        </div>
      </header>

      <main className="staff-main-content">
        <div className="content-header">
          <h2>Điều hành Sản xuất & Giao hàng</h2>
          <p>Quản lý đơn hàng từ trạng thái <strong>Đã xác nhận (2)</strong> đến <strong>Hoàn tất (7)</strong>.</p>
        </div>

        <div className="order-cards-grid">
          {/* Lọc các đơn đang xử lý (không hiện đơn đã hủy 6 hoặc hoàn tất 7) */}
          {!Array.isArray(orders) || orders.filter(o => o.status >= 2 && o.status !== 6 && o.status !== 7).length === 0 ? (
            <div className="empty-state-card">Hiện không có đơn hàng nào cần xử lý.</div>
          ) : (
            orders.filter(o => o.status >= 2 && o.status !== 6 && o.status !== 7).map(order => {
              const status = getStatusInfo(order.status);
              return (
                <div key={order.orderId} className={`staff-order-card status-border-${order.status}`}>
                  <div className="card-header-top">
                    <span className="order-number">#{order.orderNumber || order.orderId}</span>
                    <span className={`status-tag-mini s-${order.status}`}>{status.text}</span>
                  </div>
                  
                  <div className="card-body-info" onClick={() => handleViewDetail(order.orderId)}>
                    <p><strong>👤 Khách:</strong> {order.recipientName}</p>
                    <p><strong>📅 Cập nhật:</strong> {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}</p>
                    <p className="card-total-price">{(order.totalAmount || 0).toLocaleString()}đ</p>
                  </div>

                  <div className="card-footer-actions">
                    <button onClick={() => handleViewDetail(order.orderId)} className="btn-action-view">👁️ Chi tiết</button>
                    <div className="group-btns">
                      {order.status === 2 && <button onClick={() => updateProgress(order.orderId, 3)} className="btn-action-ops">Gia công</button>}
                      {order.status === 3 && <button onClick={() => updateProgress(order.orderId, 4)} className="btn-action-ops">Giao hàng</button>}
                      {order.status === 4 && <button onClick={() => updateProgress(order.orderId, 5)} className="btn-action-ops">Đã giao</button>}
                      {order.status === 5 && <button onClick={() => updateProgress(order.orderId, 7)} className="btn-action-processing">Hoàn tất</button>}
                      
                      {/* 🔥 NÚT HỦY ĐƠN VỚI CHỮ RÕ RÀNG */}
                      <button 
                        onClick={() => updateProgress(order.orderId, 6)} 
                        className="btn-action-cancel-text"
                      >
                        Hủy đơn
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL CHI TIẾT */}
      {showModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-red">
              <h4>Đơn hàng {selectedOrder.orderNumber}</h4>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-scroll-body">
              {/* Nội dung chi tiết tương tự như cũ */}
              <div className="modal-info-section">
                <h4>📍 Thông tin vận chuyển</h4>
                <div className="info-grid">
                  <p><strong>Người nhận:</strong> {selectedOrder.shippingInfo?.recipientName}</p>
                  <p><strong>Điện thoại:</strong> {selectedOrder.shippingInfo?.phoneNumber}</p>
                  <p><strong>Địa chỉ:</strong> {selectedOrder.shippingInfo?.addressLine}, {selectedOrder.shippingInfo?.district}, {selectedOrder.shippingInfo?.city}</p>
                </div>
              </div>
              <hr className="modal-divider" />
              <div className="modal-products-section">
                <h4>📦 Sản phẩm</h4>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.orderItemId} className="product-mini-item">
                    <img src={item.primaryImageUrl} alt="" />
                    <div className="p-mini-details">
                      <p className="p-name">{item.productName}</p>
                      <p className="p-price">{item.quantity} x {item.unitPrice?.toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer-total">
                <div className="total-row"><span>Tổng cộng:</span><span className="total-red">{(selectedOrder.totalAmount || 0).toLocaleString()}đ</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;