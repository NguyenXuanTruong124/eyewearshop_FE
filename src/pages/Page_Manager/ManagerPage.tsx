import React, { useState, useEffect } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./ManagerPage.css";

// Import các component quản lý
import UserManager from "./UserManager";
import ProductManager from "./ProductManager";
import RevenueManager from "./RevenueManager";

const ManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [staffName, setStaffName] = useState<string>("Đang tải...");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem('fullName');
    const email = localStorage.getItem('userEmail');
    
    if (savedName) {
      setStaffName(savedName); 
    } else if (email) {
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
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
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
          <div className="sidebar-header-box">
            <div className="avatar-circle">
              {staffName.charAt(0).toUpperCase()}
            </div>
            <div className="staff-details">
              <span className="staff-label">Nhân Viên</span>
              <span className="staff-name">{staffName}</span>
              <p className="staff-role">Quản lý hệ thống</p>
            </div>
          </div>
          
          <nav className="sidebar-nav-menu">
            <div 
              className={`nav-item ${activeTab === "users" ? "active" : ""}`} 
              onClick={() => setActiveTab("users")}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Quản lý nhân sự</span>
            </div>

            <div 
              className={`nav-item ${activeTab === "products" ? "active" : ""}`} 
              onClick={() => setActiveTab("products")}
            >
              <span className="nav-icon">👓</span>
              <span className="nav-text">Quản lý sản phẩm</span>
            </div>

            <div 
              className={`nav-item ${activeTab === "revenue" ? "active" : ""}`} 
              onClick={() => setActiveTab("revenue")}
            >
              <span className="nav-icon">💰</span>
              <span className="nav-text">Quản lý doanh thu</span>
            </div>
          </nav>

          <div className="sidebar-footer-area">
            <div className="nav-item logout-btn" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              <span className="nav-text">Đăng xuất</span>
            </div>
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