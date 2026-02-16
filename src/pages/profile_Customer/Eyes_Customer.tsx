import React, { useState, useEffect } from "react";
import axiosClient from "../../API_BE/axiosClient";
import "./Eyes_Customer.css";

interface Prescription {
  prescriptionId: number;
  prescribedBy: string;
  rightSphere: number;
  rightCylinder: number;
  rightAxis: number;
  rightAdd: number;
  rightPD: number;
  leftSphere: number;
  leftCylinder: number;
  leftAxis: number;
  leftAdd: number;
  leftPD: number;
  notes: string;
  prescriptionDate: string;
}

const Eyes_Customer: React.FC<{ triggerToast: (msg: string) => void }> = ({ triggerToast }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    rightSphere: 0, rightCylinder: 0, rightAxis: 0, rightAdd: 0, rightPD: 0,
    leftSphere: 0, leftCylinder: 0, leftAxis: 0, leftAdd: 0, leftPD: 0,
    notes: "",
    prescribedBy: "",
    prescriptionDate: new Date().toISOString()
  });

  const fetchPrescriptions = async () => {
    try {
      const response = await axiosClient.get("/prescriptions");
      if (response.data) setPrescriptions(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn kính:", error);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(`/prescriptions/${editingId}`, formData);
        triggerToast("Cập nhật thông số mắt thành công!");
      } else {
        await axiosClient.post("/prescriptions", formData);
        triggerToast("Thêm thông số mắt thành công!");
      }
      resetForm();
      fetchPrescriptions();
    } catch (error) {
      triggerToast("Lỗi khi lưu thông số.");
    }
  };

  const handleConfirmDelete = async () => {
    if (idToDelete) {
      try {
        await axiosClient.delete(`/prescriptions/${idToDelete}`);
        triggerToast("Đã xóa thông số mắt.");
        fetchPrescriptions();
      } catch (error) {
        triggerToast("Lỗi khi xóa thông số.");
      } finally {
        setShowDeleteModal(false);
        setIdToDelete(null);
      }
    }
  };

  const handleEditClick = (item: Prescription) => {
    setEditingId(item.prescriptionId);
    setFormData({
      rightSphere: item.rightSphere, rightCylinder: item.rightCylinder, 
      rightAxis: item.rightAxis, rightAdd: item.rightAdd, rightPD: item.rightPD,
      leftSphere: item.leftSphere, leftCylinder: item.leftCylinder, 
      leftAxis: item.leftAxis, leftAdd: item.leftAdd, leftPD: item.leftPD,
      notes: item.notes || "",
      prescribedBy: item.prescribedBy,
      prescriptionDate: item.prescriptionDate
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      rightSphere: 0, rightCylinder: 0, rightAxis: 0, rightAdd: 0, rightPD: 0,
      leftSphere: 0, leftCylinder: 0, leftAxis: 0, leftAdd: 0, leftPD: 0,
      notes: "", prescribedBy: "", prescriptionDate: new Date().toISOString()
    });
  };

  return (
    <section className="eyes-section">
      {/* Modal xác nhận xóa chuyên nghiệp */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header"><span>⚠️ Xác nhận xóa</span></div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa thông số này không?</p>
              <p className="modal-subtext">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={() => setShowDeleteModal(false)}>Hủy bỏ</button>
              <button className="btn-confirm-delete" onClick={handleConfirmDelete}>Đồng ý xóa</button>
            </div>
          </div>
        </div>
      )}

      <div className="content-header-main">
        <h3>Thông số mắt</h3>
      </div>

      <div className="prescriptions-list">
        {prescriptions.map((item) => (
          <div key={item.prescriptionId} className="prescription-card">
            <div className="card-header-eyes">
              <strong>{item.prescribedBy}</strong>
              <div className="card-actions">
                <button className="edit-link" onClick={() => handleEditClick(item)}>Chỉnh sửa</button>
                <button className="delete-link" onClick={() => { setIdToDelete(item.prescriptionId); setShowDeleteModal(true); }}>Xóa</button>
              </div>
            </div>
            
            <div className="eyes-display-container">
              {/* Mắt phải */}
              <div className="eye-group">
                <p className="eye-side-label">Mắt phải (Right Eye)</p>
                <div className="grid-4-cols">
                  <div className="info-item"><span>Sph</span><p>{item.rightSphere}</p></div>
                  <div className="info-item"><span>Cyl</span><p>{item.rightCylinder}</p></div>
                  <div className="info-item"><span>Axis</span><p>{item.rightAxis}</p></div>
                  <div className="info-item"><span>Add</span><p>{item.rightAdd}</p></div>
                </div>
                <div className="pd-item"><span>PD (Pupillary Distance)</span><p>{item.rightPD}</p></div>
              </div>

              {/* Mắt trái */}
              <div className="eye-group">
                <p className="eye-side-label">Mắt trái (Left Eye)</p>
                <div className="grid-4-cols">
                  <div className="info-item"><span>Sph</span><p>{item.leftSphere}</p></div>
                  <div className="info-item"><span>Cyl</span><p>{item.leftCylinder}</p></div>
                  <div className="info-item"><span>Axis</span><p>{item.leftAxis}</p></div>
                  <div className="info-item"><span>Add</span><p>{item.leftAdd}</p></div>
                </div>
                <div className="pd-item"><span>PD (Pupillary Distance)</span><p>{item.leftPD}</p></div>
              </div>
            </div>

            {/* HIỂN THỊ GHI CHÚ TẠI ĐÂY */}
            <div className="notes-box-display">
              <span>Ghi chú</span>
              <p>{item.notes || "Không có ghi chú nào cho đơn kính này."}</p>
            </div>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button className="add-new-btn" onClick={() => setShowForm(true)}>+ Thêm thông số mắt mới</button>
      ) : (
        <div className="eyes-form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group-full">
              <label>Họ và tên người sở hữu</label>
              <input 
                value={formData.prescribedBy} 
                onChange={(e) => setFormData({...formData, prescribedBy: e.target.value})} 
                required 
              />
            </div>

            <div className="form-eyes-split">
              {/* Cột mắt phải */}
              <div className="form-eye-column">
                <p className="column-title">Mắt phải (Right Eye)</p>
                <div className="input-grid-4">
                  <div className="input-wrap"><span>Sph</span><input type="number" step="0.01" value={formData.rightSphere} onChange={(e) => setFormData({...formData, rightSphere: +e.target.value})} /></div>
                  <div className="input-wrap"><span>Cyl</span><input type="number" step="0.01" value={formData.rightCylinder} onChange={(e) => setFormData({...formData, rightCylinder: +e.target.value})} /></div>
                  <div className="input-wrap"><span>Axis</span><input type="number" value={formData.rightAxis} onChange={(e) => setFormData({...formData, rightAxis: +e.target.value})} /></div>
                  <div className="input-wrap"><span>Add</span><input type="number" step="0.01" value={formData.rightAdd} onChange={(e) => setFormData({...formData, rightAdd: +e.target.value})} /></div>
                </div>
                <div className="pd-input-wrap">
                  <label>PD (Right)</label>
                  <input type="number" step="0.1" value={formData.rightPD} onChange={(e) => setFormData({...formData, rightPD: +e.target.value})} />
                </div>
              </div>

              {/* Cột mắt trái */}
              <div className="form-eye-column">
                <p className="column-title">Mắt trái (Left Eye)</p>
                <div className="input-grid-4">
                  <div className="input-wrap"><span>Sph</span><input type="number" step="0.01" value={formData.leftSphere} onChange={(e) => setFormData({...formData, leftSphere: +e.target.value})} /></div>
                  <div className="input-wrap"><span>Cyl</span><input type="number" step="0.01" value={formData.leftCylinder} onChange={(e) => setFormData({...formData, leftCylinder: +e.target.value})} /></div>
                  <div className="input-wrap"><span>Axis</span><input type="number" value={formData.leftAxis} onChange={(e) => setFormData({...formData, leftAxis: +e.target.value})} /></div>
                  <div className="input-wrap"><span>Add</span><input type="number" step="0.01" value={formData.leftAdd} onChange={(e) => setFormData({...formData, leftAdd: +e.target.value})} /></div>
                </div>
                <div className="pd-input-wrap">
                  <label>PD (Left)</label>
                  <input type="number" step="0.1" value={formData.leftPD} onChange={(e) => setFormData({...formData, leftPD: +e.target.value})} />
                </div>
              </div>
            </div>

            {/* NHẬP GHI CHÚ TẠI ĐÂY */}
            <div className="form-group-full">
              <label>Ghi chú</label>
              <textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                placeholder="Nhập ghi chú (VD: Kính cận dùng đi đường...)"
              />
            </div>

            <div className="form-btns">
              <button type="submit" className="btn-save">{editingId ? "Cập nhật" : "Lưu thông số"}</button>
              <button type="button" className="btn-cancel" onClick={resetForm}>Hủy</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default Eyes_Customer;