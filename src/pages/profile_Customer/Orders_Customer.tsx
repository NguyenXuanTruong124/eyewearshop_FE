import React, { useState, useEffect } from 'react';
import axiosClient from "../../API_BE/axiosClient";
import toast from 'react-hot-toast';
import './Orders_Customer.css';

const Orders_Customer: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/orders?page=1&pageSize=20');
      // API trả về items là mảng đơn hàng
      const data = res.data?.items || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setOrders([]);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // 🔥 Hàm này phải chạy thành công thì Modal mới mở
  const handleViewDetail = async (orderId: number) => {
    try {
      toast.loading("Đang tải chi tiết...", { id: 'loading-detail' });
      const res = await axiosClient.get(`/orders/${orderId}`);

      if (res.data) {
        setSelectedOrder(res.data);
        setShowModal(true); // Chỉ mở modal khi đã có dữ liệu
        toast.dismiss('loading-detail');
      }
    } catch (e: any) {
      toast.dismiss('loading-detail');
      // Nếu lỗi 404 như trong log, sẽ báo lỗi ở đây
      toast.error("Không tìm thấy thông tin chi tiết đơn hàng này");
    }
  };

  const getStatusInfo = (status: number) => {
    const config: Record<number, { text: string; class: string }> = {
      0: { text: 'Chờ xác nhận', class: 'pending' },
      4: { text: 'Đang giao', class: 'shipped' },
      6: { text: 'Đã hủy', class: 'cancelled' },
      7: { text: 'Hoàn thành', class: 'completed' },
      8: { text: 'Chờ thanh toán', class: 'awaiting-payment' },
      9: { text: 'Đã xóa', class: 'deleted' }
    };
    return config[status] || { text: 'N/A', class: 'na' };
  };

  const handleRepay = async (order: any) => {
    try {
      toast.loading("Đang tạo link thanh toán...", { id: 'payment' });
      const paymentPayload = {
        orderId: order.orderId,
        paymentMethod: 'VNPay',
        paymentType: 'VNPay',
        amount: order.totalAmount || 0,
        note: "Thanh toán lại đơn hàng " + order.orderNumber
      };
      const payRes = await axiosClient.post('/payments', paymentPayload);
      const vnpayUrl = payRes.data.paymentUrl || payRes.data.url || payRes.data.redirectUrl || (payRes.data.data && payRes.data.data.paymentUrl);
      if (vnpayUrl) {
        window.location.href = vnpayUrl;
      } else {
        toast.dismiss('payment');
        toast.error("Không tạo được link thanh toán VNPay");
      }
    } catch (e: any) {
      toast.dismiss('payment');
      toast.error(e.response?.data?.message || "Lỗi tạo thanh toán");
    }
  };

  const isOrderPaid = (order: any) => {
    return order.paymentStatus === 'Paid' || order.paymentStatus === 1 || order.paymentStatus === 'Đã thanh toán' || order.isPaid === true;
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
      try {
        toast.loading("Đang xóa đơn hàng...", { id: 'deleting' });
        await axiosClient.delete(`/orders/${orderId}`);
        toast.dismiss('deleting');
        toast.success("Đã xóa đơn hàng thành công");
        fetchOrders();
      } catch (e: any) {
        toast.dismiss('deleting');
        toast.error("Không thể xóa đơn hàng");
      }
    }
  };

  if (loading) return <div className="orders-loading">Đang tải đơn hàng...</div>;

  return (
    <div className="orders-customer-page">
      <div className="orders-header">
        <h3>Đơn hàng của tôi</h3>
      </div>

      <div className="order-cards-container">
        {Array.isArray(orders) && orders.length > 0 ? (
          orders.map((order) => {
            const status = getStatusInfo(order.status);
            return (
              <div key={order.orderId} className="order-item-card">
                <div className="card-top">
                  <div className="order-meta">
                    <span className="order-id">#{order.orderNumber || order.orderId}</span>
                    <span className={`status-badge ${status.class}`}>{status.text}</span>
                  </div>
                  <div className="order-price">
                    {(order.totalAmount || 0).toLocaleString()}đ
                  </div>
                </div>
                <div className="card-middle">
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  <span className="item-count">Mã đơn: {order.orderNumber}</span>
                  <span className="item-count">
                    Thanh toán:{' '}
                    <strong style={{ color: isOrderPaid(order) ? '#2ecc71' : '#e74c3c' }}>
                      {isOrderPaid(order) ? 'Đã TT' : 'Chưa TT'}
                    </strong>
                  </span>
                </div>
                <div className="card-bottom">
                  {(!isOrderPaid(order) && order.status !== 6 && order.status !== 7 && order.status !== 9) && (
                    <>
                      <button className="btn-secondary" onClick={() => handleRepay(order)}>
                        Thanh toán lại
                      </button>
                      <button className="btn-delete-order" onClick={() => handleDeleteOrder(order.orderId)}>
                        Xóa đơn hàng
                      </button>
                    </>
                  )}
                  <button className="btn-main-red" onClick={() => handleViewDetail(order.orderId)}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">Bạn chưa có đơn hàng nào.</div>
        )}
      </div>

      {/* 🔥 PHẦN MODAL CHI TIẾT - PHẢI CÓ NỘI DUNG NÀY MỚI HIỂN THỊ ĐƯỢC */}
      {showModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-red">
              <h4>Chi tiết đơn hàng #{selectedOrder.orderNumber}</h4>
              <button className="close-x-white" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <div className="modal-scroll-area">
              <div className="modal-section">
                <p className={`status-text ${getStatusInfo(selectedOrder.status).class}`}>
                  Trạng thái: {getStatusInfo(selectedOrder.status).text}
                </p>

                <div className="order-info-mini">
                  <p><strong>🕒 Ngày đặt:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                  <p>
                    <strong>💳 Thanh toán:</strong>{' '}
                    <span style={{ color: isOrderPaid(selectedOrder) ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>
                      {isOrderPaid(selectedOrder) ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                    {selectedOrder.paymentMethod && ` (${selectedOrder.paymentMethod})`}
                  </p>
                  {selectedOrder.note && <p><strong>📝 Ghi chú:</strong> {selectedOrder.note}</p>}
                </div>

                <div className="shipping-box-mini">
                  <p><strong>📍 Người nhận:</strong> {selectedOrder.shippingInfo?.recipientName}</p>
                  <p><strong>📞 Điện thoại:</strong> {selectedOrder.shippingInfo?.phoneNumber}</p>
                  <p><strong>🏠 Địa chỉ:</strong> {selectedOrder.shippingInfo?.addressLine}, {selectedOrder.shippingInfo?.district}, {selectedOrder.shippingInfo?.city}</p>
                  {selectedOrder.shippingInfo?.notes && <p><strong>📝 Ghi chú giao hàng:</strong> {selectedOrder.shippingInfo.notes}</p>}
                </div>
              </div>

              {selectedOrder.prescription && (
                <div className="modal-section">
                  <h5>👁️ Thông số mắt</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
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
              )}

              <div className="modal-section">
                <h5>📦 Sản phẩm</h5>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.orderItemId} className="mini-product-item">
                    <img src={item.primaryImageUrl || item.variant?.product?.primaryImageUrl || 'https://placehold.co/100'} alt="product" />
                    <div className="mini-info">
                      <p className="p-name-mini">{item.productName || item.variant?.product?.productName || 'Sản phẩm'}</p>
                      {item.variant && (
                        <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>
                          Màu: {item.variant.color || 'N/A'} | Chất liệu: {item.variant.glassMaterial || 'N/A'}
                        </p>
                      )}
                      <p className="p-price-mini">{item.quantity} x {item.unitPrice?.toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer-summary">
                <div className="summary-row"><span>Tạm tính:</span><span>{selectedOrder.subTotal?.toLocaleString()}đ</span></div>
                <div className="summary-row"><span>Phí ship:</span><span>{selectedOrder.shippingFee?.toLocaleString()}đ</span></div>
                <div className="summary-row total-red"><span>Tổng cộng:</span><span>{selectedOrder.totalAmount?.toLocaleString()}đ</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders_Customer;