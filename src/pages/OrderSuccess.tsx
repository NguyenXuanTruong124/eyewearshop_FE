import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div style={{textAlign: 'center', padding: '80px 20px'}}>
      <div style={{fontSize: '60px', color: '#2ecc71'}}>✅</div>
      <h2 style={{marginTop: '20px'}}>Đặt hàng thành công!</h2>
      <p style={{color: '#666', marginTop: '10px'}}>
        Cảm ơn bạn đã tin tưởng EyewearHut. Mã đơn hàng của bạn là <strong>#{orderId || "N/A"}</strong>
      </p>
      <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px'}}>
        <button className="btn-back-checkout" onClick={() => navigate('/account/orders')}>Xem đơn hàng</button>
        <button className="btn-primary-checkout" style={{maxWidth: '300px'}} onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
      </div>
    </div>
  );
};

export default OrderSuccess;