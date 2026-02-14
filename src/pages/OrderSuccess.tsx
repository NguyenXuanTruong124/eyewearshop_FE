import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{textAlign: 'center', padding: '80px 20px'}}>
      <div style={{fontSize: '60px', color: '#2ecc71'}}>✅</div>
      <h2 style={{marginTop: '20px'}}>Đặt hàng thành công!</h2>
      <p style={{color: '#666', marginTop: '10px'}}>Cảm ơn bạn đã tin tưởng EyewearHut. Mã đơn hàng của bạn là #DH444882</p>
      <button 
        className="btn-checkout" 
        style={{maxWidth: '300px', margin: '40px auto'}}
        onClick={() => navigate('/')}
      >
        Tiếp tục mua sắm
      </button>
    </div>
  );
};

export default OrderSuccess;