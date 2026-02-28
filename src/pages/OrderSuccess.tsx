import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('vnp_TxnRef');
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTransactionStatus = searchParams.get('vnp_TransactionStatus');

  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  useEffect(() => {
    // VNPay gửi các vnp_ResponseCode và vnp_TransactionStatus qua URL query param
    if (vnpResponseCode) {
      if (vnpResponseCode === '00') {
        setIsSuccess(true);
        // "Nếu thành công thì trạng thái đơn hàng là 0" bạn vừa bảo
        console.log(`✅ [VNPay Return] Giao dịch thành công. Mã Response: ${vnpResponseCode}. Trạng thái đơn: 0`);
      } else {
        setIsSuccess(false);
        console.warn(`❌ [VNPay Return] Giao dịch thất bại / hủy. Mã Response: ${vnpResponseCode}`);
        toast.error("Thanh toán thất bại hoặc đã bị bạn hủy!");
      }
    }
  }, [vnpResponseCode]);

  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      {isSuccess ? (
        <>
          <div style={{ fontSize: '60px', color: '#2ecc71' }}>✅</div>
          <h2 style={{ marginTop: '20px' }}>Thanh toán thành công!</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Cảm ơn bạn đã tin tưởng EyewearHut. Mã đơn hàng của bạn là <strong>#{orderId || "N/A"}</strong>
          </p>
          {vnpResponseCode === '00' && (
            <p style={{ color: '#0056b3', marginTop: '10px', fontWeight: 'bold' }}>
              Trạng thái thanh toán: Đã thanh toán (0)
            </p>
          )}
        </>
      ) : (
        <>
          <div style={{ fontSize: '60px', color: '#e74c3c' }}>❌</div>
          <h2 style={{ marginTop: '20px', color: '#e74c3c' }}>Thanh toán không thành công!</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Giao dịch bị hủy hoặc xảy ra lỗi (Mã phản hồi: {vnpResponseCode}).<br />
            Mã đơn hàng: <strong>#{orderId || "N/A"}</strong>
          </p>
        </>
      )}

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
        <button className="btn-back-checkout" onClick={() => navigate('/profiles')}>Quản lý đơn hàng</button>
        <button className="btn-primary-checkout" style={{ maxWidth: '300px' }} onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
      </div>
    </div>
  );
};

export default OrderSuccess;