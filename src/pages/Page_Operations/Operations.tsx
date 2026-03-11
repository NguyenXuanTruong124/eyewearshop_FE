import React, { useState, useEffect } from 'react';
import axiosClient from "../../API_BE/axiosClient";
import toast from 'react-hot-toast';
import './Operations.css';

const Operations: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('AVAILABLE');
  const staffName = localStorage.getItem('fullName') || 'Nhân viên OPS';

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const [mode, setMode] = useState<'ORDERS' | 'RETURNS'>('ORDERS');
  const [returnRequests, setReturnRequests] = useState<any[]>([]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      // Operations: Lấy yêu cầu đang ở trạng thái 1 (Approved by Sales)
      const res = await axiosClient.get(`/return-requests/all?page=1&pageSize=100&status=1`);
      setReturnRequests(res.data?.items || []);
    } catch (e) {
      setReturnRequests([]);
      toast.error("Không thể tải danh sách khiếu nại");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReturnStatus = async (id: number, status: number) => {
    try {
      await axiosClient.put(`/return-requests/${id}/status`, status, { headers: { 'Content-Type': 'application/json' } });
      toast.success("Cập nhật khiếu nại thành công!");
      fetchReturns();
    } catch(e) {
      toast.error("Lỗi cập nhật khiếu nại");
    }
  };

  const fetchOrders = async (tab: string) => {
    try {
      setLoading(true);
      let apiType = '';
      if (tab === 'AVAILABLE') apiType = 'AVAILABLE';
      else if (tab === 'PREORDER') apiType = 'PRE_ORDER';
      else if (tab === 'PRESCRIPTION') apiType = 'PRESCRIPTION';
      else if (tab === 'PREORDER_PRESCRIPTION') apiType = 'PRE_ORDER_PRESCRIPTION';

      const res = await axiosClient.get(`/orders/all?page=1&pageSize=100&orderType=${apiType}`);
      const data = res.data?.items || [];
      let fetchedOrders = Array.isArray(data) ? data : [];

      // Lọc các đơn đang ở trạng thái >= 2 và chưa Hoàn tất(7)/Hủy(6)
      // Nếu muốn xem cả đơn hoàn tất thì gỡ filter này
      fetchedOrders = fetchedOrders.filter(o => o.status >= 2 && o.status !== 6 && o.status !== 7);

      setOrders(fetchedOrders);
    } catch (e) {
      setOrders([]);
      toast.error("Không thể tải danh sách đơn hàng Operations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'ORDERS') {
      fetchOrders(activeTab);
    } else {
      fetchReturns();
    }
  }, [mode, activeTab]);

  const handleViewDetail = async (orderId: number) => {
    try {
      toast.loading("Đang tải chi tiết...", { id: 'ops-detail' });
      const res = await axiosClient.get(`/orders/staff-view/${orderId}`);
      if (res.data) {
        setSelectedOrder(res.data);
        setShowModal(true);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi lấy chi tiết đơn hàng");
    } finally {
      toast.dismiss('ops-detail');
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
      await axiosClient.put(`/orders/${id}/status`, { newStatus: nextStatus });
      toast.success(`${actionName} thành công!`);
      fetchOrders(activeTab);
      if (showModal && selectedOrder?.orderId === id) {
        setShowModal(false);
      }
    } catch (e) {
      toast.error(`Lỗi thao tác ${actionName.toLowerCase()}`);
    }
  };

  const getStatusInfo = (status: number) => {
    const config: Record<number, { text: string; class: string }> = {
      0: { text: 'Chờ Xác nhận', class: 'pending' },
      1: { text: 'Đã xác nhận', class: 'validated' },
      2: { text: 'Chờ Xử lý OPS', class: 'confirmed' }, // Confirmed
      10: { text: 'Gia công', class: 'processing' }, // Processed
      3: { text: 'Đóng gói', class: 'produced' }, // Produced
      4: { text: 'Đang giao hàng', class: 'shipped' }, // Shipped
      5: { text: 'Đã giao hàng', class: 'delivered' }, // Delivered
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
          <span className="nav-role">Phòng Operations</span>
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
        <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Dashboard Phân loại & Xử lý (Operations)</h2>
            <p>Quản lý gia công mắt kính, đóng gói và xử lý khiếu nại hoàn tất.</p>
          </div>
          <div className="mode-toggle-buttons">
            <button className={`mode-btn ${mode === 'ORDERS' ? 'active-mode' : ''}`} onClick={() => setMode('ORDERS')}>Quản lý Đơn hàng</button>
            <button className={`mode-btn ${mode === 'RETURNS' ? 'active-mode' : ''}`} onClick={() => setMode('RETURNS')}>Xử lý Đổi trả / Bảo hành</button>
          </div>
        </div>

        {mode === 'ORDERS' ? (
          <>
            <div className="staff-tabs-container">
          <button className={`staff-tab-btn ${activeTab === 'AVAILABLE' ? 'active' : ''}`} onClick={() => setActiveTab('AVAILABLE')}>
            Đơn hàng Có Sẵn
          </button>
          <button className={`staff-tab-btn ${activeTab === 'PRESCRIPTION' ? 'active' : ''}`} onClick={() => setActiveTab('PRESCRIPTION')}>
            Đơn có Thông Số Mắt
          </button>
          <button className={`staff-tab-btn ${activeTab === 'PREORDER' ? 'active' : ''}`} onClick={() => setActiveTab('PREORDER')}>
            Đơn hàng Preorder
          </button>
          <button className={`staff-tab-btn ${activeTab === 'PREORDER_PRESCRIPTION' ? 'active' : ''}`} onClick={() => setActiveTab('PREORDER_PRESCRIPTION')}>
            Preorder + Thông Số
          </button>
        </div>

        <div className="order-cards-grid">
          {orders.length > 0 ? (
            orders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              const isPreorderType = activeTab.includes('PRE_ORDER');
              const hasPrescription = !!order.prescription;
              const allInStock = order.items?.every((item: any) => item.inStock === true);

              return (
                <div key={order.orderId} className={`staff-order-card status-border-${order.status}`}>
                  <div className="card-header-top">
                    <span className="order-number">#{order.orderNumber || order.orderId}</span>
                    <span className={`status-tag-mini s-${order.status}`}>{statusInfo.text}</span>
                  </div>

                  <div className="card-body-info" onClick={() => handleViewDetail(order.orderId)}>
                    <p><strong>👤 Khách:</strong> {order.customer?.fullName || order.shippingInfo?.recipientName || 'N/A'}</p>
                    <p><strong>📅 Bắt đầu:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                    <p className="card-total-price">{(order.totalAmount || 0).toLocaleString()}đ</p>

                    {isPreorderType && (
                      <div className={`stock-status-badge ${allInStock ? 'stock-ok' : 'stock-wait'}`}>
                        {allInStock ? '✅ Kho đã nhập đủ hàng' : '⏳ Đang chờ hàng về kho'}
                      </div>
                    )}
                  </div>

                  <div className="card-footer-actions">
                    <button onClick={() => handleViewDetail(order.orderId)} className="btn-action-view">👁️ Chi tiết</button>
                    <div className="group-btns">
                      {/* Xử lý cho ĐƠN CÓ THÔNG SỐ: 2 -> 10 ->  3 -> 4 -> 5 -> 7 */}
                      {hasPrescription ? (
                        <>
                          {order.status === 2 && <button onClick={() => updateProgress(order.orderId, 10)} className="btn-action-ops">Gia công</button>}
                          {order.status === 10 && <button onClick={() => updateProgress(order.orderId, 3)} className="btn-action-ops">Đóng gói</button>}
                        </>
                      ) : (
                        /* Xử lý cho ĐƠN KHÔNG CÓ THÔNG SỐ: 2 ->  3 -> 4 -> 5 -> 7 */
                        <>
                          {order.status === 2 && <button onClick={() => updateProgress(order.orderId, 3)} className="btn-action-ops">Đóng gói</button>}
                        </>
                      )}

                      {/* Các trạng thái chung của việc Giao hàng */}
                      {order.status === 3 && <button onClick={() => updateProgress(order.orderId, 4)} className="btn-action-next">Giao hàng</button>}
                      {order.status === 4 && <button onClick={() => updateProgress(order.orderId, 5)} className="btn-action-ops">Đã giao</button>}
                      {order.status === 5 && <button onClick={() => updateProgress(order.orderId, 7)} className="btn-action-processing">Hoàn tất</button>}

                      {order.status < 6 && (
                        <button onClick={() => updateProgress(order.orderId, 6)} className="btn-action-cancel-text">Hủy đơn</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-card">Chưa có đơn hàng nào cần xử lý trong phân loại này.</div>
          )}
            </div>
          </>
        ) : (
          <>
            <div className="staff-tabs-container">
              <button className="staff-tab-btn active">
                Yêu cầu chờ xử lý
              </button>
            </div>
            <div className="order-cards-grid">
              {returnRequests.length > 0 ? (
                returnRequests.map(req => (
                  <div key={req.returnRequestId} className={`staff-order-card status-border-1`}>
                    <div className="card-header-top">
                      <span className="order-number">Mã KN: #{req.returnRequestId}</span>
                      <span className={`status-tag-mini s-1`}>Đã Duyệt (Chờ OPS)</span>
                    </div>
                    <div className="card-body-info">
                      <p><strong>🛍️ Mã Đơn:</strong> #{req.order?.orderNumber}</p>
                      <p><strong>Loại:</strong> <span style={{fontWeight: 'bold', color: '#e31837'}}>{req.requestType}</span></p>
                      <p><strong>Lý do:</strong> {req.reason}</p>
                      <p><strong>Chi tiết:</strong> {req.description}</p>
                      <p><strong>Ngày tạo:</strong> {new Date(req.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="card-footer-actions">
                      <div className="group-btns" style={{ width: '100%', justifyContent: 'space-between' }}>
                        {req.status === 1 && (
                          <>
                            <button onClick={() => handleUpdateReturnStatus(req.returnRequestId, 3)} className="btn-action-next">Đã xử lý xong (Hoàn tất)</button>
                            <button onClick={() => handleUpdateReturnStatus(req.returnRequestId, 2)} className="btn-action-cancel-text">Từ chối (Hủy KN)</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state-card">Không có yêu cầu khiếu nại nào đang chờ.</div>
              )}
            </div>
          </>
        )}
      </main>

      {showModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="order-modal-content order-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-red">
              <div>
                <h3 style={{ margin: 0 }}>Đơn hàng: #{selectedOrder.orderNumber}</h3>
                <span className="modal-subtitle">Loại: {selectedOrder.orderType} | Trạng thái: {getStatusInfo(selectedOrder.status).text}</span>
              </div>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <div className="modal-scroll-body modal-grid-layout">
              {/* CỘT TRÁI: THÔNG TIN KHÁCH & GIAO HÀNG */}
              <div className="modal-left-col">
                <div className="modal-info-section box-shadow-card">
                  <h4>📍 Thông tin giao hàng</h4>
                  <div className="info-grid">
                    <p><strong>Khách hàng:</strong> {selectedOrder.customer?.fullName || 'Khách vãng lai'}</p>
                    <p><strong>Người nhận:</strong> {selectedOrder.shippingInfo?.recipientName}</p>
                    <p><strong>Điện thoại:</strong> {selectedOrder.shippingInfo?.phoneNumber || selectedOrder.customer?.phoneNumber}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.shippingInfo?.addressLine}, {selectedOrder.shippingInfo?.district}, {selectedOrder.shippingInfo?.city}</p>
                    <p><strong>P.Thức T.Toán:</strong> {selectedOrder.payments?.[0]?.paymentType || 'COD'} ({selectedOrder.payments?.[0]?.paymentMethod})</p>
                    <p><strong>Trạng thái:</strong> <span className={selectedOrder.paymentStatus === 1 ? 'text-success' : 'text-warning'}>
                      {selectedOrder.paymentStatus === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span></p>
                  </div>
                </div>

                {selectedOrder.prescription && (
                  <div className="modal-prescription-section box-shadow-card mt-15">
                    <h4>👁️ Thông số mắt chi tiết</h4>
                    <div className="rx-grid">
                      <div className="rx-col">
                        <div className="rx-title">Mắt phải (OD)</div>
                        <ul>
                          <li><strong>SPH:</strong> {selectedOrder.prescription.rightSphere}</li>
                          <li><strong>CYL:</strong> {selectedOrder.prescription.rightCylinder}</li>
                          <li><strong>AXIS:</strong> {selectedOrder.prescription.rightAxis}</li>
                          <li><strong>ADD:</strong> {selectedOrder.prescription.rightAdd}</li>
                          <li><strong>PD:</strong> {selectedOrder.prescription.rightPD}</li>
                        </ul>
                      </div>
                      <div className="rx-col">
                        <div className="rx-title">Mắt trái (OS)</div>
                        <ul>
                          <li><strong>SPH:</strong> {selectedOrder.prescription.leftSphere}</li>
                          <li><strong>CYL:</strong> {selectedOrder.prescription.leftCylinder}</li>
                          <li><strong>AXIS:</strong> {selectedOrder.prescription.leftAxis}</li>
                          <li><strong>ADD:</strong> {selectedOrder.prescription.leftAdd}</li>
                          <li><strong>PD:</strong> {selectedOrder.prescription.leftPD}</li>
                        </ul>
                      </div>
                    </div>
                    {selectedOrder.prescription.notes && (
                      <div className="rx-notes mt-15">
                        <strong>Ghi chú (Sale):</strong> {selectedOrder.prescription.notes || 'Không có ghi chú'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CỘT PHẢI: SẢN PHẨM & TỔNG TIỀN */}
              <div className="modal-right-col">
                <div className="modal-products-section box-shadow-card">
                  <h4>📦 Sản phẩm ({selectedOrder.items?.length})</h4>
                  <div className="product-mini-list custom-scroll">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.orderItemId} className="product-mini-item">
                        <div className="p-mini-details">
                          <p className="p-mini-name">{item.variant?.product?.productName || 'Sản phẩm'}</p>
                          <p className="p-mini-meta">Màu: {item.variant?.color} | SKU: {item.variant?.product?.sku}</p>
                          <p className="p-mini-price">
                            {item.quantity} x {item.unitPrice?.toLocaleString()}đ
                            {!item.inStock && <span className="p-mini-outstock"> (Hết hàng tại kho)</span>}
                            {item.inStock && <span className="p-mini-instock"> (Có hàng sẵn)</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-footer-total-box box-shadow-card mt-15">
                  <div className="modal-total-row summary-row">
                    <span>Tạm tính:</span>
                    <span>{(selectedOrder.subTotal || 0).toLocaleString()}đ</span>
                  </div>
                  <div className="modal-total-row summary-row">
                    <span>Phí ship:</span>
                    <span>{(selectedOrder.shippingFee || 0).toLocaleString()}đ</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="modal-total-row summary-row text-success">
                      <span>Giảm giá:</span>
                      <span>-{(selectedOrder.discountAmount || 0).toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="modal-total-row final-total mt-15" style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '18px' }}>Tổng cộng:</span>
                    <span className="total-price-red" style={{ fontSize: '22px', color: '#e31837', fontWeight: 'bold' }}>{(selectedOrder.totalAmount || 0).toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;