import React, { useState, useEffect } from 'react';
import axiosClient from "../../API_BE/axiosClient";
import toast from 'react-hot-toast';
import './SalesSupport.css';

const SalesSupport: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const staffName = localStorage.getItem('fullName') || 'Nhân viên';

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/orders/all?page=1&pageSize=50');
      const data = res.data?.items || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setOrders([]);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetail = async (orderId: number) => {
    try {
      toast.loading("Đang tải...", { id: 'staff-detail' });
      const res = await axiosClient.get(`/orders/staff-view/${orderId}`);
      if (res.data) {
        setSelectedOrder(res.data);
        setShowModal(true);
        toast.dismiss('staff-detail');
      }
    } catch (e) {
      toast.dismiss('staff-detail');
      toast.error("Lỗi lấy chi tiết đơn hàng");
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

  const handleUpdateStatus = async (orderId: number, status: number) => {
    try {
      await axiosClient.put(`/orders/${orderId}/status`, { newStatus: status });
      toast.success("Cập nhật thành công!");
      fetchOrders();
    } catch (e) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const getStatusInfo = (status: number) => {
    const config: Record<number, { text: string; class: string }> = {
      0: { text: 'Chờ xác nhận', class: 'pending' },
      1: { text: 'Đã xác nhận', class: 'validated' },
      2: { text: 'Tiến hành', class: 'confirmed' },
      3: { text: 'Gia công', class: 'processing' },
      4: { text: 'Đang giao', class: 'shipped' },
      5: { text: 'Đã giao', class: 'delivered' },
      6: { text: 'Đã hủy', class: 'cancelled' },
      7: { text: 'Hoàn tất', class: 'completed' }
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
          <span className="nav-role">Phòng Sales Support</span>
        </div>
        <div className="nav-right">
          <div className="staff-info-display">
            <p className="welcome-label">Xin chào,</p>
            <p className="staff-name-text">{staffName}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout-new">🚪 Đăng xuất</button>
        </div>
      </header>

      <main className="staff-main-content">
        <div className="content-header">
          <h2>Tất cả đơn hàng hệ thống</h2>
          <p>Danh sách toàn bộ đơn hàng hiện có trên hệ thống EyewearHut.</p>
        </div>

        <div className="order-cards-grid">
          {Array.isArray(orders) && orders.length > 0 ? (
            orders.map(order => {
              const status = getStatusInfo(order.status);
              return (
                <div key={order.orderId} className={`staff-order-card status-border-${order.status}`}>
                  <div className="card-header-top">
                    <span className="order-number">#{order.orderNumber || order.orderId}</span>
                    <span className={`status-tag-mini s-${order.status}`}>{status.text}</span>
                  </div>

                  <div className="card-body-info" onClick={() => handleViewDetail(order.orderId)}>
                    <p><strong>👤 Khách hàng:</strong> {order.customer?.fullName || order.shippingInfo?.recipientName || 'N/A'}</p>
                    <p><strong>📅 Ngày đặt:</strong> {new Date(order.orderDate || order.createdAt).toLocaleDateString('vi-VN')}</p>
                    <p className="card-total-price">{(order.totalAmount || 0).toLocaleString()}đ</p>
                  </div>

                  <div className="card-footer-actions">
                    <button onClick={() => handleViewDetail(order.orderId)} className="btn-action-view">👁️ Chi tiết</button>
                    <div className="group-btns">
                      {order.status === 0 && <button onClick={() => handleUpdateStatus(order.orderId, 1)} className="btn-action-next">Xác nhận</button>}
                      {order.status === 1 && <button onClick={() => handleUpdateStatus(order.orderId, 2)} className="btn-action-ops">Chuyển OPS</button>}

                      {order.status < 6 && (
                        <button onClick={() => handleUpdateStatus(order.orderId, 6)} className="btn-action-cancel-text">Hủy đơn</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-card">Không tìm thấy đơn hàng nào.</div>
          )}
        </div>
      </main>

      {showModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-red">
              <h3>Chi tiết Đơn hàng #{selectedOrder.orderNumber}</h3>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <div className="modal-scroll-body">
              <div className="modal-info-section">
                <h4>📍 Thông tin giao hàng</h4>
                <div className="info-grid">
                  <p><strong>Người nhận:</strong> {selectedOrder.shippingInfo?.recipientName}</p>
                  <p><strong>Điện thoại:</strong> {selectedOrder.shippingInfo?.phoneNumber}</p>
                  <p><strong>Email khách:</strong> {selectedOrder.customerEmail}</p>
                  <p><strong>Địa chỉ:</strong> {selectedOrder.shippingInfo?.addressLine}, {selectedOrder.shippingInfo?.district}, {selectedOrder.shippingInfo?.city}</p>
                </div>
              </div>

              <hr className="modal-divider" />

              {selectedOrder.prescription && (
                <>
                  <div className="modal-prescription-section">
                    <h4>👁️ Thông số mắt</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px', background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                      <div>
                        <strong style={{ color: '#d32f2f' }}>Mắt phải (OD)</strong>
                        <p style={{ margin: '5px 0' }}>SPH: {selectedOrder.prescription.rightSphere} &nbsp;|&nbsp; CYL: {selectedOrder.prescription.rightCylinder}</p>
                        <p style={{ margin: '5px 0' }}>AXIS: {selectedOrder.prescription.rightAxis} &nbsp;|&nbsp; ADD: {selectedOrder.prescription.rightAdd}</p>
                        <p style={{ margin: '5px 0' }}>PD: {selectedOrder.prescription.rightPD}</p>
                      </div>
                      <div>
                        <strong style={{ color: '#d32f2f' }}>Mắt trái (OS)</strong>
                        <p style={{ margin: '5px 0' }}>SPH: {selectedOrder.prescription.leftSphere} &nbsp;|&nbsp; CYL: {selectedOrder.prescription.leftCylinder}</p>
                        <p style={{ margin: '5px 0' }}>AXIS: {selectedOrder.prescription.leftAxis} &nbsp;|&nbsp; ADD: {selectedOrder.prescription.leftAdd}</p>
                        <p style={{ margin: '5px 0' }}>PD: {selectedOrder.prescription.leftPD}</p>
                      </div>
                      {selectedOrder.prescription.notes && (
                        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                          <strong>Ghi chú:</strong> {selectedOrder.prescription.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <hr className="modal-divider" />
                </>
              )}

              <div className="modal-products-section">
                <h4>📦 Sản phẩm ({selectedOrder.items?.length})</h4>
                <div className="product-mini-list">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.orderItemId} className="product-mini-item">
                      <img src={item.primaryImageUrl} alt={item.productName} className="p-mini-img" />
                      <div className="p-mini-details">
                        <p className="p-mini-name">{item.productName}</p>
                        <p className="p-mini-price">{item.quantity} x {item.unitPrice?.toLocaleString()}đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer-total-box">
                <div className="modal-total-row">
                  <span>Tổng cộng:</span>
                  <span className="total-price-red">{(selectedOrder.totalAmount || 0).toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesSupport;