import React from "react";

interface RevenueManagerProps {
  triggerToast: (msg: string) => void;
}

const RevenueManager: React.FC<RevenueManagerProps> = ({ triggerToast }) => {
  return (
    <div className="manager-content-wrapper">
      <div className="content-header-action">
        <p className="content-desc">Theo dõi biến động doanh thu và hiệu suất bán hàng</p>
        <div className="filter-group">
          <select className="select-custom">
            <option>Tháng này</option>
            <option>Tháng trước</option>
            <option>Năm nay</option>
          </select>
          <button className="btn-outline">Xuất báo cáo (Excel)</button>
        </div>
      </div>

      <div className="stats-grid-3">
        <div className="stat-card highlight-purple">
          <p className="label">Tổng doanh thu</p>
          <h3 className="value">1,250,000,000đ</h3>
          <p className="sub-value green">↑ 12% so với tháng trước</p>
        </div>
        <div className="stat-card">
          <p className="label">Đơn hàng hoàn tất</p>
          <h3 className="value">856</h3>
        </div>
        <div className="stat-card">
          <p className="label">Giá trị trung bình đơn</p>
          <h3 className="value">1,460,000đ</h3>
        </div>
      </div>

      <div className="revenue-charts-area" style={{ marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '12px' }}>
        <h4>Biểu đồ tăng trưởng</h4>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', border: '1px dashed #ddd' }}>
          [Khu vực tích hợp Chart.js hoặc Recharts]
        </div>
      </div>

      <div className="data-table-container" style={{ marginTop: '20px' }}>
        <h4>Giao dịch gần đây</h4>
        <table className="manager-custom-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày giao dịch</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#ORD-9921</td>
              <td>Trần Thị B</td>
              <td>23/02/2026</td>
              <td>3,150,000đ</td>
              <td>VNPay</td>
              <td><span className="status-tag success">Thành công</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueManager;