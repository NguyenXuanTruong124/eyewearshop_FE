import React, { useState, useEffect } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./UserManager.css"; 

interface UserManagerProps {
  triggerToast: (msg: string) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ triggerToast }) => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"staff" | "customers">("staff");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Giá trị khởi tạo mặc định
  const initialForm = {
    email: "", 
    password: "", 
    fullName: "", 
    phoneNumber: "", 
    gender: null as string | null,
    dateOfBirth: null as string | null,
    roleId: 2, // Mặc định là SalesSupport khi tạo mới nhân viên
    status: 1
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, customerRes] = await Promise.all([
        axiosClient.get("/manager/users/staff?page=1&pageSize=20"),
        axiosClient.get("/manager/users/customers?page=1&pageSize=20")
      ]);
      setStaffList(staffRes.data?.items || []);
      setCustomerList(customerRes.data?.items || []);
    } catch (err) {
      triggerToast("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 🔥 SỬA: Hàm reset để thêm tài khoản mới
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsReadOnly(false);
    setFormData(initialForm); // Reset sạch form
    setShowModal(true);
  };

  const handleOpenModal = async (userId: number, readOnly: boolean) => {
    try {
      const res = await axiosClient.get(`/manager/users/${userId}`);
      const user = res.data;
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "",
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        roleId: user.roleId || (user.role === "Customer" ? 1 : 4), 
        status: user.status
      });
      setIsReadOnly(readOnly);
      setShowModal(true);
    } catch (err) {
      triggerToast("Không thể lấy thông tin chi tiết");
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await axiosClient.patch(`/manager/users/${userId}/status`, { status: newStatus });
      triggerToast("Cập nhật trạng thái thành công!");
      fetchData();
    } catch (err) {
      triggerToast("Lỗi khi thay đổi trạng thái");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    try {
      if (editingUser) {
        await axiosClient.put(`/manager/users/${editingUser.userId}`, {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          roleId: Number(formData.roleId),
          status: Number(formData.status)
        });
        triggerToast("Cập nhật tài khoản thành công!");
      } else {
        // 🔥 Tạo mới nhân viên
        await axiosClient.post("/manager/users/staff", formData);
        triggerToast("Thêm nhân viên thành công!");
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  return (
    <div className="manager-content-wrapper">
      <div className="manager-content-header">
        <div className="header-text">
          <p className="sub-label">Điều hành đội ngũ và khách hàng hệ thống</p>
        </div>
        <button className="btn-add-account" onClick={handleOpenAddModal}>
          <span>+</span> Thêm tài khoản
        </button>
      </div>

      <div className="stats-grid-4">
        <div className="stat-card"><span className="label">Tổng nhân viên</span><span className="value purple">{staffList.length}</span></div>
        <div className="stat-card"><span className="label">Khách hàng</span><span className="value blue">{customerList.length}</span></div>
        <div className="stat-card"><span className="label">Sales Support</span><span className="value red">{staffList.filter(s => s.role === "SalesSupport").length}</span></div>
        <div className="stat-card"><span className="label">Manager</span><span className="value green">{staffList.filter(s => s.role === "Manager").length}</span></div>
      </div>

      <div className="sub-tab-nav">
        <button className={subTab === "staff" ? "active" : ""} onClick={() => setSubTab("staff")}>Danh sách Nhân viên</button>
        <button className={subTab === "customers" ? "active" : ""} onClick={() => setSubTab("customers")}>Danh sách Khách hàng</button>
      </div>

      <div className="data-table-container">
        <table className="manager-custom-table">
          <thead>
            <tr>
              <th>{subTab === "staff" ? "Nhân viên" : "Khách hàng"}</th>
              <th>Vai trò / Hạng</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading ? (
              (subTab === "staff" ? staffList : customerList).map((user) => (
                <tr key={user.userId}>
                  <td>
                    <div className="user-info-cell">
                      <div className="avatar-small">{user.fullName?.charAt(0).toUpperCase()}</div>
                      <span>{user.fullName}</span>
                    </div>
                  </td>
                  <td><span className={`badge-role ${user.role?.replace(/\s+/g, '-').toLowerCase() || 'customer'}`}>{user.role || "Customer"}</span></td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || "N/A"}</td>
                  <td>
                    <span className={`status-tag ${user.status === 1 ? "active" : "inactive"}`} style={{cursor: "pointer"}} onClick={() => handleToggleStatus(user.userId, user.status)}>
                      {user.status === 1 ? "Hoạt động" : "Tạm khóa"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon view-btn" onClick={() => handleOpenModal(user.userId, true)}>👁️</button>
                      <button className="btn-icon edit-btn" onClick={() => handleOpenModal(user.userId, false)}>📝</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="table-loading">Đang tải...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isReadOnly ? "Chi tiết tài khoản" : (editingUser ? "Cập nhật tài khoản" : "Thêm tài khoản mới")}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input 
                  disabled={isReadOnly} 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  className={isReadOnly ? "input-readonly" : ""} 
                  required 
                  placeholder="Nhập họ và tên..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email đăng nhập</label>
                  {/* 🔥 SỬA: Chỉ khóa email khi đang Edit hoặc Xem. Khi tạo mới (không có editingUser) thì cho nhập */}
                  <input 
                    disabled={isReadOnly || !!editingUser} 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className={(isReadOnly || !!editingUser) ? "input-readonly" : ""} 
                    required
                    type="email"
                    placeholder="example@gmail.com"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input 
                    disabled={isReadOnly} 
                    value={formData.phoneNumber} 
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                    className={isReadOnly ? "input-readonly" : ""} 
                    placeholder="0123456789"
                  />
                </div>
              </div>

              {/* Chỉ hiện Password khi thêm mới hoàn toàn */}
              {!isReadOnly && !editingUser && (
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    required 
                    placeholder="Nhập mật khẩu cho tài khoản mới..."
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Vai trò</label>
                  <select disabled={isReadOnly} value={formData.roleId} onChange={e => setFormData({...formData, roleId: Number(e.target.value)})}>
                    <option value={1}>Customer</option>
                    <option value={2}>SalesSupport</option>
                    <option value={3}>Operations Staff</option>
                    <option value={4}>Manager</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select disabled={isReadOnly} value={formData.status} onChange={e => setFormData({...formData, status: Number(e.target.value)})}>
                    <option value={1}>Hoạt động</option>
                    <option value={0}>Tạm khóa</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>{isReadOnly ? "Đóng" : "Hủy"}</button>
                {!isReadOnly && <button type="submit" className="btn-confirm">Xác nhận</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;