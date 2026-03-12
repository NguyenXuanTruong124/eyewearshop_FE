import React, { useState, useEffect } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./Address_Customer.css";

interface Props {
  triggerToast: (msg: string) => void;
}

const Address_Customer: React.FC<Props> = ({ triggerToast }) => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  // Logic xóa địa chỉ và Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  
  const [newAddress, setNewAddress] = useState({
    recipientName: "", 
    phoneNumber: "", 
    addressLine: "", 
    city: "", 
    district: "", 
    ward: "",
    ghnDistrictId: 0,
    ghnWardCode: "",
    note: "",
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0);

  // Lấy danh sách địa chỉ
  const fetchAddresses = async () => {
    try {
      const response = await axiosClient.get("/account/addresses");
      if (response.data) setAddresses(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách địa chỉ:", error);
    }
  };

  useEffect(() => { 
    const fetchProvinces = async () => {
      try {
        const response = await axiosClient.get("/ghn/provinces");
        if (response.data) setProvinces(response.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách tỉnh:", error);
      }
    };
    fetchProvinces();
    fetchAddresses(); 
  }, []);

  useEffect(() => {
    if (selectedProvinceId) {
      const fetchDistricts = async () => {
        try {
          const response = await axiosClient.get(`/ghn/districts?provinceId=${selectedProvinceId}`);
          if (response.data) setDistricts(response.data);
        } catch (error) {
          console.error("Lỗi lấy danh sách huyện:", error);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
    }
    setWards([]);
  }, [selectedProvinceId]);

  useEffect(() => {
    if (newAddress.ghnDistrictId) {
      const fetchWards = async () => {
        try {
          const response = await axiosClient.get(`/ghn/wards?districtId=${newAddress.ghnDistrictId}`);
          if (response.data) setWards(response.data);
        } catch (error) {
          console.error("Lỗi lấy danh sách xã:", error);
        }
      };
      fetchWards();
    } else {
      setWards([]);
    }
  }, [newAddress.ghnDistrictId]);

  // Xử lý Thêm hoặc Cập nhật địa chỉ
  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        // Gửi yêu cầu cập nhật (PUT)
        await axiosClient.put(`/account/addresses/${editingAddressId}`, newAddress);
        triggerToast("Cập nhật địa chỉ thành công.");
      } else {
        // Gửi yêu cầu thêm mới (POST)
        await axiosClient.post("/account/addresses", newAddress);
        triggerToast("Thêm địa chỉ mới thành công.");
      }
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error("Lỗi xử lý địa chỉ:", error);
      triggerToast("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  // Xác nhận xóa địa chỉ
  const handleConfirmDelete = async () => {
    if (addressToDelete) {
      try {
        const response = await axiosClient.delete(`/account/addresses/${addressToDelete}`);
        if (response.status === 200) triggerToast("Đã xóa địa chỉ thành công.");
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          triggerToast("Địa chỉ đã được đồng bộ khỏi hệ thống.");
        }
      } finally {
        setShowDeleteModal(false);
        setAddressToDelete(null);
        fetchAddresses(); 
      }
    }
  };

  const handleEditClick = (addr: any) => {
    setEditingAddressId(addr.addressId);
    
    // Tìm ProvinceID dựa trên tên
    const matchedProvince = provinces.find(p => p.ProvinceName === addr.city || p.NameExtension?.includes(addr.city));
    if (matchedProvince) setSelectedProvinceId(matchedProvince.ProvinceID);
    else setSelectedProvinceId(0);

    setNewAddress({
      recipientName: addr.recipientName || "",
      phoneNumber: addr.phoneNumber || "",
      addressLine: addr.addressLine || "",
      city: addr.city || "",
      district: addr.district || "",
      ward: addr.ward || "",
      ghnDistrictId: addr.ghnDistrictId || 0,
      ghnWardCode: addr.ghnWardCode || "",
      note: addr.note || "",
    });
    setShowAddAddress(true);
  };

  const resetForm = () => {
    setShowAddAddress(false);
    setEditingAddressId(null);
    setSelectedProvinceId(0);
    setNewAddress({
      recipientName: "", phoneNumber: "", addressLine: "", city: "", district: "", ward: "", ghnDistrictId: 0, ghnWardCode: "", note: "",
    });
  };

  return (
    <section className="address-section">
      {/* Modal xác nhận xóa cân đối */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header"><span>⚠️ Xác nhận xóa</span></div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa địa chỉ này không?</p>
              <p className="modal-subtext">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={() => setShowDeleteModal(false)}>Hủy bỏ</button>
              <button className="btn-confirm-delete" onClick={handleConfirmDelete}>Đồng ý xóa</button>
            </div>
          </div>
        </div>
      )}

      <div className="content-header">
        <h3>Địa chỉ của tôi</h3>
        {!showAddAddress && (
          <button className="add-btn-red" onClick={() => { resetForm(); setShowAddAddress(true); }}>
            + Thêm địa chỉ mới
          </button>
        )}
      </div>

      {showAddAddress && (
        <div className="address-form-box">
          <form className="address-grid-form" onSubmit={handleSubmitAddress}>
            <input 
              placeholder="Tên người nhận" 
              value={newAddress.recipientName} 
              onChange={(e) => setNewAddress({...newAddress, recipientName: e.target.value})} 
              required 
            />
            <input 
              placeholder="Số điện thoại" 
              value={newAddress.phoneNumber} 
              onChange={(e) => setNewAddress({...newAddress, phoneNumber: e.target.value})} 
              required 
            />
            <select 
              className="full-width"
              value={selectedProvinceId} 
              onChange={(e) => {
                const provId = Number(e.target.value);
                const provName = e.target.options[e.target.selectedIndex].text;
                setSelectedProvinceId(provId);
                setNewAddress({...newAddress, city: provId ? provName : "", district: "", ward: "", ghnDistrictId: 0, ghnWardCode: ""});
              }}
              required
            >
              <option value={0}>-- Chọn Tỉnh/Thành phố --</option>
              {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
            </select>
            <select 
              className="full-width"
              value={newAddress.ghnDistrictId} 
              onChange={(e) => {
                const distId = Number(e.target.value);
                const distName = e.target.options[e.target.selectedIndex].text;
                setNewAddress({...newAddress, ghnDistrictId: distId, district: distId ? distName : "", ward: "", ghnWardCode: ""});
              }}
              required
              disabled={!selectedProvinceId}
            >
              <option value={0}>-- Chọn Quận/Huyện --</option>
              {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
            </select>
            <select 
              className="full-width"
              value={newAddress.ghnWardCode} 
              onChange={(e) => {
                const wardCode = e.target.value;
                const wardName = e.target.options[e.target.selectedIndex].text;
                setNewAddress({...newAddress, ghnWardCode: wardCode, ward: wardCode ? wardName : ""});
              }}
              required
              disabled={!newAddress.ghnDistrictId}
            >
              <option value="">-- Chọn Phường/Xã --</option>
              {wards.map(w => <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>)}
            </select>
            <input 
              className="full-width" 
              placeholder="Tên đường" 
              value={newAddress.addressLine} 
              onChange={(e) => setNewAddress({...newAddress, addressLine: e.target.value})} 
              required 
            />
            <textarea 
              className="full-width" 
              placeholder="Ghi chú (Ví dụ: Giao giờ hành chính)" 
              value={newAddress.note} 
              onChange={(e) => setNewAddress({...newAddress, note: e.target.value})} 
            />
            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingAddressId ? "Cập nhật địa chỉ" : "Lưu địa chỉ"}
              </button>
              <button type="button" className="cancel-btn" onClick={resetForm}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="address-list">
        {addresses.length > 0 ? addresses.map((addr) => (
          <div key={addr.addressId} className="address-card">
            <div className="address-card-header">
              <strong><span className="addr-label">Người nhận:</span> {addr.recipientName}</strong>
              <div className="address-actions">
                <button className="edit-link-btn" onClick={() => handleEditClick(addr)}>Sửa</button>
                <button className="delete-link-btn" onClick={() => { setAddressToDelete(addr.addressId); setShowDeleteModal(true); }}>Xóa</button>
                <span className="badge-default">Địa chỉ</span>
              </div>
            </div>
            <p className="addr-text"><span className="addr-label">SĐT:</span> {addr.phoneNumber}</p>
            <p className="addr-text"><span className="addr-label">Địa chỉ:</span> {addr.addressLine}, {addr.ward ? addr.ward + ', ' : ''}{addr.district}, {addr.city}</p>
            {addr.note && <p className="addr-note"><span className="addr-label">Ghi chú:</span> {addr.note}</p>}
          </div>
        )) : (
          <div className="empty-state">Bạn chưa lưu địa chỉ nào.</div>
        )}
      </div>
    </section>
  );
};

export default Address_Customer;