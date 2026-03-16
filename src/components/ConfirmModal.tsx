import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "danger" | "warning" | "info";
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  type = "warning", 
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  onCancel, 
  onConfirm 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger": return "🗑️";
      case "info": return "✨";
      default: return "❓";
    }
  };

  return (
    <div className="pm-confirm-overlay" onClick={onCancel}>
      <div className="pm-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className={`pm-confirm-icon ${type}`}>
          {getIcon()}
        </div>
        <h3 className="pm-confirm-title">{title}</h3>
        <p className="pm-confirm-message">{message}</p>
        <div className="pm-confirm-actions">
          <button className="pm-confirm-btn cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`pm-confirm-btn confirm ${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
