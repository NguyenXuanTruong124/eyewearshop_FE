import React from 'react';
import './styles/ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean; 
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay mờ */}
      <div className="modal-overlay" onClick={onCancel}></div>
      
      {/* Modal */}
      <div className="modal-container">
        <div className="modal-content">
          <h2 className="modal-title">{title}</h2>
          <p className="modal-message">{message}</p>
          
          <div className="modal-actions">
            <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
              {cancelText}
            </button>
            <button 
              className={`modal-btn ${isDangerous ? 'modal-btn-danger' : 'modal-btn-confirm'}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
