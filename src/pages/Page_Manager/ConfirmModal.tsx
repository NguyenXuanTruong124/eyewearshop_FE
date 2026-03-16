import React from 'react';
import './ProductManager.css'; // Reusing common styles for modal

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "danger" | "warning" | "info";
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, type = "warning", onCancel, onConfirm 
}) => {
  if (!isOpen) return null;

  return (
    <div className="pm-confirm-overlay">
      <div className="pm-confirm-modal">
        <div className={`pm-confirm-icon ${type}`}>
          {type === 'danger' ? '🗑️' : type === 'info' ? '✨' : '❓'}
        </div>
        <h3 className="pm-confirm-title">{title}</h3>
        <p className="pm-confirm-message">{message}</p>
        <div className="pm-confirm-actions">
          <button className="pm-confirm-btn cancel" onClick={onCancel}>
            Hủy bỏ
          </button>
          <button className={`pm-confirm-btn confirm ${type}`} onClick={onConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
