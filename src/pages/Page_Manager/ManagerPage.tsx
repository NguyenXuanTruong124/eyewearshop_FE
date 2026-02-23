import React, { useState, useEffect } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./ManagerPage.css";

// Import 3 file nội dung lẻ tương ứng
import UserManager from "./UserManager";
import ProductManager from "./ProductManager";
import RevenueManager from "./RevenueManager";

const ManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [staffName, setStaffName] = useState<string>("Đang tải...");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // 🔥 ÉP BUỘC lấy tên đầy đủ từ localStorage
    const savedName = localStorage.getItem('fullName');
    const email = localStorage.getItem('userEmail');
    
    if (savedName) {
      // Ưu tiên hiển thị fullname thực tế từ database (ví dụ: nguyen quang)
      setStaffName(savedName); 
    } else if (email) {
      // Nếu chưa có fullname, hiển thị phần trước @ của email
      setStaffName(email.split('@')[0]);
    } else {
      setStaffName("Nhân viên");
    }
  }, []);

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
      // Xóa sạch để đảm bảo lần login tới sẽ cập nhật lại fullname mới
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <div className="manager-page">
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

      <div className="manager-container">
        <aside className="manager-sidebar">
          <div className="manager-profile-brand">
            <div className="staff-info">
              {/* Hiển thị fullname lấy từ cơ sở dữ liệu */}
              <span className="name" style={{fontWeight: 'bold'}}>Nhân Viên: {staffName}</span>
              <p className="role">Quản lý hệ thống</p>
            </div>
          </div>
          
          <div 
            className={`sidebar-menu-item ${activeTab === "users" ? "active" : ""}`} 
            onClick={() => setActiveTab("users")}
          >
            <span>👥</span> Quản lý nhân sự
          </div>

          <div 
            className={`sidebar-menu-item ${activeTab === "products" ? "active" : ""}`} 
            onClick={() => setActiveTab("products")}
          >
            <span>👓</span> Quản lý sản phẩm
          </div>

          <div 
            className={`sidebar-menu-item ${activeTab === "revenue" ? "active" : ""}`} 
            onClick={() => setActiveTab("revenue")}
          >
            <span>💰</span> Quản lý doanh thu
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-menu-item logout-item-btn" onClick={handleLogout}>
            <span>🚪</span> Đăng xuất
          </div>
        </aside>

        <main className="manager-main-content">
          <header className="manager-content-header">
            <h2 className="current-tab-title">
              {activeTab === "users" && "Quản lý nhân sự"}
              {activeTab === "products" && "Quản lý sản phẩm"}
              {activeTab === "revenue" && "Thống kê doanh thu"}
            </h2>
          </header>

          <section className="tab-content-area">
            {activeTab === "users" && <UserManager triggerToast={triggerToast} />}
            {activeTab === "products" && <ProductManager triggerToast={triggerToast} />}
            {activeTab === "revenue" && <RevenueManager triggerToast={triggerToast} />}
          </section>
        </main>
      </div>
    </div>
  );
};

export default ManagerPage;