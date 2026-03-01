import React, { useState, useEffect } from 'react';
import axiosClient from "../../API_BE/axiosClient";
import toast from 'react-hot-toast';
import './Operations.css';

const Operations: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchStaffOrders = async () => {
    try {
      const res = await axiosClient.get('/orders');
      console.log("📡 Operations API Response:", res.data);
      // 🔥 SỬA: Bảo vệ state khỏi dữ liệu không phải mảng
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setOrders([]);
      toast.error("Lỗi tải danh sách sản xuất");
    }
  };

  useEffect(() => {
    fetchStaffOrders();
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

  const updateProgress = async (id: number, nextStatus: number) => {
    try {
      await axiosClient.put(`/orders/${id}/status`, { newStatus: nextStatus });
      toast.success("Đã cập nhật tiến độ sản xuất");
      fetchStaffOrders();
    } catch (e) {
      toast.error("Không thể cập nhật");
    }
  };

  return (
    <div className="staff-container">
      <header className="staff-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Phòng Operations</h2>
          <p>Gia công tròng kính & Giao hàng (Trạng thái 3 → 7)</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🚪 Đăng xuất
        </button>
      </header>

      <table className="staff-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Trạng thái</th>
            <th>Toa kính</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {/* 🔥 SỬA: Thêm check mảng an toàn */}
          {Array.isArray(orders) && orders.filter(o => o.status >= 3 && o.status !== 6).map(order => (
            <tr key={order.orderId}>
              <td>#{order.orderId}</td>
              <td><span className={`badge status-${order.status}`}>{order.status}</span></td>
              <td>
                {order.hasPrescription ? <button className="btn-view-rx">Xem Toa</button> : 'N/A'}
              </td>
              <td>
                <div className="table-actions">
                  {order.status === 3 && <button onClick={() => updateProgress(order.orderId, 4)}>Bắt đầu giao</button>}
                  {order.status === 4 && <button onClick={() => updateProgress(order.orderId, 5)}>Xác nhận đã giao</button>}
                  {order.status === 5 && <button onClick={() => updateProgress(order.orderId, 7)}>Hoàn tất đơn</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Operations;