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
      7: { text: 'Hoàn thành', class: 'completed' },
      6: { text: 'Đã hủy', class: 'cancelled' }
    };
    return config[status] || { text: 'N/A', class: 'na' };
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
                </div>
                <div className="card-bottom">
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
                <div className="shipping-box-mini">
                  <p><strong>📍 Người nhận:</strong> {selectedOrder.shippingInfo?.recipientName}</p>
                  <p><strong>📞 Điện thoại:</strong> {selectedOrder.shippingInfo?.phoneNumber}</p>
                  <p><strong>🏠 Địa chỉ:</strong> {selectedOrder.shippingInfo?.addressLine}, {selectedOrder.shippingInfo?.district}, {selectedOrder.shippingInfo?.city}</p>
                </div>
              </div>

              <div className="modal-section">
                <h5>📦 Sản phẩm</h5>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.orderItemId} className="mini-product-item">
                    <img src={item.primaryImageUrl || 'https://placehold.co/100'} alt="product" />
                    <div className="mini-info">
                      <p className="p-name-mini">{item.productName}</p>
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