import React, { useState } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./Profile.css";

// Import các component đã tách
import PersonalInfo from "./PersonalInfo";
import Address_Customer from "./Address_Customer";
import Eyes_Customer from "./Eyes_Customer"; // Mới thêm vào

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
      window.location.href = "/login";
    }
  };

  return (
    <div className="profile-page">
      {/* Toast Notification dùng chung cho toàn bộ trang Profile */}
      {showToast && (
        <div className="toast-notification">
          <div className="toast-content">
            <span className="toast-icon">✅</span>
            <div className="toast-text-group">
              <p className="toast-desc">{toastMessage}</p>
            </div>
          </div>
          <div className="toast-progress"></div>
        </div>
      )}

      <div className="profile-container">
        {/* Sidebar Menu điều hướng */}
        <aside className="profile-sidebar">
          <div 
            className={`sidebar-menu-item ${activeTab === "info" ? "active" : ""}`} 
            onClick={() => setActiveTab("info")}
          >
            <span>👤</span> Thông tin cá nhân
          </div>

          <div 
            className={`sidebar-menu-item ${activeTab === "orders" ? "active" : ""}`} 
            onClick={() => setActiveTab("orders")}
          >
            <span>📦</span> Đơn hàng của tôi
          </div>

          <div 
            className={`sidebar-menu-item ${activeTab === "address" ? "active" : ""}`} 
            onClick={() => setActiveTab("address")}
          >
            <span>📍</span> Địa chỉ
          </div>

          <div 
            className={`sidebar-menu-item ${activeTab === "eyes" ? "active" : ""}`} 
            onClick={() => setActiveTab("eyes")}
          >
            <span>👁️</span> Thông số mắt
          </div>

          <div 
            className={`sidebar-menu-item ${activeTab === "password" ? "active" : ""}`} 
            onClick={() => setActiveTab("password")}
          >
            <span>🔒</span> Đổi mật khẩu
          </div>

          <div className="sidebar-menu-item logout-item-btn" onClick={handleLogout}>
            <span>🚪</span> Đăng xuất
          </div>
        </aside>

        {/* Nội dung chính hiển thị dựa trên tab đang chọn */}
        <main className="profile-main-content">
          {/* Tab Thông tin cá nhân */}
          {activeTab === "info" && (
            <PersonalInfo triggerToast={triggerToast} />
          )}

          {/* Tab Địa chỉ */}
          {activeTab === "address" && (
            <Address_Customer triggerToast={triggerToast} />
          )}

          {/* Tab Thông số mắt (Đã kết hợp API và layout mới) */}
          {activeTab === "eyes" && (
            <Eyes_Customer triggerToast={triggerToast} />
          )}

          {/* Các Tab khác */}
          {activeTab === "orders" && (
            <div className="tab-placeholder">
              <h3>Đơn hàng của tôi</h3>
              <p>Danh sách đơn hàng sẽ hiển thị tại đây.</p>
            </div>
          )}

          {activeTab === "password" && (
            <div className="tab-placeholder">
              <h3>Đổi mật khẩu</h3>
              <p>Chức năng đổi mật khẩu đang được cập nhật.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;