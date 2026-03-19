import React, { useState, useEffect } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./PersonalInfo.css";

interface Props {
  triggerToast: (msg: string) => void;
}

const PersonalInfo: React.FC<Props> = ({ triggerToast }) => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // State lưu trữ dữ liệu người dùng
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    gender: "",
    dateOfBirth: "",
  });

  // State tạm thời để phục vụ việc chỉnh sửa
  const [editData, setEditData] = useState({ ...user });

  // Hàm lấy thông tin profile từ hệ thống
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/account/profile");
      if (response.data) {
        const data = {
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          phoneNumber: response.data.phoneNumber || "",
          role: response.data.role || "",
          gender: response.data.gender || "",
          dateOfBirth: response.data.dateOfBirth
            ? response.data.dateOfBirth.split("T")[0]
            : "",
        };
        setUser(data);
        setEditData(data);
        
        // Cập nhật localStorage để đồng bộ với Header
        if (data.fullName) {
          localStorage.setItem('fullName', data.fullName);
          window.dispatchEvent(new Event('authChanged'));
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin cá nhân:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Hàm xử lý cập nhật thông tin gọi API PUT
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosClient.put("/account/profile", {
        fullName: editData.fullName,
        phoneNumber: editData.phoneNumber,
        gender: editData.gender,
        dateOfBirth: editData.dateOfBirth,
      });

      if (response.status === 200) {
        localStorage.setItem('fullName', editData.fullName);
        window.dispatchEvent(new Event('authChanged'));
        
        triggerToast("Cập nhật thông tin cá nhân thành công.");
        setIsEditing(false);
        fetchUserProfile(); // Tải lại dữ liệu mới nhất
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật profile:", error);
      triggerToast("Có lỗi xảy ra khi lưu thông tin.");
    }
  };

  if (loading) return <div className="loading-text">Đang tải thông tin...</div>;

  return (
    <section className="personal-info-section">
      <div className="content-header">
        <h3>Thông tin cá nhân</h3>
        {!isEditing && (
          <button className="edit-action-btn" onClick={() => setIsEditing(true)}>
            ✎ Chỉnh sửa
          </button>
        )}
      </div>

      <form onSubmit={handleUpdateProfile}>
        {/* Vai trò tài khoản (Chỉ đọc) */}
        <div className="info-field-wrapper">
          <label className="info-label">Vai trò tài khoản</label>
          <div className="user-role-badge">{user.role}</div>
        </div>

        {/* Họ và tên */}
        <div className="info-field-wrapper">
          <label className="info-label">Họ và tên</label>
          {isEditing ? (
            <input
              className="info-input-edit"
              value={editData.fullName}
              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
              required
            />
          ) : (
            <div className="info-box-readonly">{user.fullName}</div>
          )}
        </div>

        {/* Giới tính */}
        <div className="info-field-wrapper">
          <label className="info-label">Giới tính</label>
          {isEditing ? (
            <select
              className="info-input-edit"
              value={editData.gender}
              onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
            >
              <option value="">Chọn giới tính</option>
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
              <option value="khac">Khác</option>
            </select>
          ) : (
            <div className="info-box-readonly" style={{ textTransform: "capitalize" }}>
              {user.gender || "Chưa xác định"}
            </div>
          )}
        </div>

        {/* Ngày sinh */}
        <div className="info-field-wrapper">
          <label className="info-label">Ngày sinh</label>
          {isEditing ? (
            <input
              type="date"
              className="info-input-edit"
              value={editData.dateOfBirth}
              onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
            />
          ) : (
            <div className="info-box-readonly">
              {user.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                : "Chưa cập nhật"}
            </div>
          )}
        </div>

        {/* Email (Chỉ đọc - Không cho sửa) */}
        <div className="info-field-wrapper">
          <label className="info-label">Email</label>
          <div className="info-box-readonly" style={{ backgroundColor: "#f0f0f0", color: "#888" }}>
            {user.email}
          </div>
        </div>

        {/* Số điện thoại */}
        <div className="info-field-wrapper">
          <label className="info-label">Số điện thoại</label>
          {isEditing ? (
            <input
              className="info-input-edit"
              value={editData.phoneNumber}
              onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
            />
          ) : (
            <div className="info-box-readonly">{user.phoneNumber}</div>
          )}
        </div>

        {/* Nhóm nút hành động khi đang sửa */}
        {isEditing && (
          <div className="edit-actions-group">
            <button type="submit" className="save-btn">Lưu thay đổi</button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setEditData({ ...user });
              }}
            >
              Hủy
            </button>
          </div>
        )}
      </form>
    </section>
  );
};

export default PersonalInfo;