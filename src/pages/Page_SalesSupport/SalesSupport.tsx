import React, { useState, useEffect } from 'react';
import axiosClient from "../../API_BE/axiosClient";
import toast from 'react-hot-toast';
import './SalesSupport.css';

const SalesSupport: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]); // Luôn khởi tạo là mảng rỗng
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/orders');
      console.log("📡 SalesSupport API Response:", res.data);
      // 🔥 SỬA: Đảm bảo res.data là mảng mới set vào state
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Fetch error:", e);
      setOrders([]);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
      toast.success("Cập nhật trạng thái thành công!");
      fetchOrders();
    } catch (e) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  return (
    <div className="staff-container">
      <header className="staff-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Phòng Sales Support</h2>
          <p>Quản lý và xác nhận đơn hàng mới (Trạng thái 0 → 2)</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🚪 Đăng xuất
        </button>
      </header>

      <div className="order-list">
        {/* 🔥 SỬA: Kiểm tra mảng trước khi filter để tránh trắng trang */}
        {!Array.isArray(orders) || orders.filter(o => o.status <= 2).length === 0 ? (
          <p className="no-order">Hiện không có đơn hàng nào cần xác nhận.</p>
        ) : (
          orders.filter(o => o.status <= 2).map(order => (
            <div key={order.orderId} className={`order-staff-card status-${order.status}`}>
              <div className="card-info">
                <h4>Đơn hàng #{order.orderId}</h4>
                <p><strong>Khách hàng:</strong> {order.recipientName || 'Khách lẻ'}</p>
                <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                <p><strong>Tổng tiền:</strong> {order.totalAmount?.toLocaleString()}đ</p>
              </div>
              <div className="card-actions">
                {order.status === 0 && (
                  <button onClick={() => handleUpdateStatus(order.orderId, 1)} className="btn-validate">Xác thực đơn</button>
                )}
                {order.status === 1 && (
                  <button onClick={() => handleUpdateStatus(order.orderId, 2)} className="btn-confirm">Xác nhận với khách</button>
                )}
                {order.status === 2 && (
                  <button onClick={() => handleUpdateStatus(order.orderId, 3)} className="btn-process">Chuyển qua Operations</button>
                )}
                <button onClick={() => handleUpdateStatus(order.orderId, 6)} className="btn-cancel">Hủy đơn</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SalesSupport;