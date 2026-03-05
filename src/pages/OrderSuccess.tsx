import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import './styles/OrderSuccess.css';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 🔍 Trích xuất các tham số từ URL (Sử dụng cho cả thanh toán trực tiếp và VNPay redirect)
  const orderId = searchParams.get('orderId') || searchParams.get('vnp_TxnRef');
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpAmount = searchParams.get('vnp_Amount');
  const vnpBankCode = searchParams.get('vnp_BankCode');
  const vnpPayDate = searchParams.get('vnp_PayDate');
  const vnpTransactionNo = searchParams.get('vnp_TransactionNo');

  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  useEffect(() => {
    // 🏦 Kiểm tra kết quả từ VNPay hoặc từ Backend redirect
    if (vnpResponseCode) {
      if (vnpResponseCode === '00') {
        setIsSuccess(true);
        toast.success("Thanh toán thành công!");
      } else {
        setIsSuccess(false);
        toast.error("Thanh toán thất bại hoặc bị hủy.");
      }
    } else if (orderId) {
      // Nếu chỉ có orderId mà không có vnpResponseCode (BE đã xử lý và redirect về FE)
      // Mặc định coi là thành công vì nếu thất bại thường BE sẽ đẩy về trang khác hoặc kèm mã lỗi
      setIsSuccess(true);
    }
  }, [vnpResponseCode, orderId]);

  // Format số tiền (VNPay amount / 100)
  const formattedAmount = vnpAmount ? (Number(vnpAmount) / 100).toLocaleString() : null;

  // Format ngày thanh toán (YYYYMMDDHHMMSS -> DD/MM/YYYY HH:MM:SS)
  const formatVNPayDate = (dateStr: string | null) => {
    if (!dateStr || dateStr.length < 14) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  return (
    <div className="order-success-container">
      {isSuccess ? (
        <>
          <div className="success-icon">✅</div>
          <h2>Đặt hàng thành công!</h2>
          <p>
            Cảm ơn bạn đã tin tưởng <strong>EyewearHut</strong>. <br />
            Đơn hàng của bạn đã được tiếp nhận và đang xử lý.
          </p>
          <div className="payment-status-info">
            <p>Mã đơn hàng: <span className="order-id-badge">{orderId || "N/A"}</span></p>
            {vnpResponseCode === '00' && (
              <>
                <p>Số tiền: <strong>{formattedAmount}đ</strong></p>
                <p>Ngân hàng: <strong>{vnpBankCode}</strong></p>
                <p>Mã giao dịch VNPay: <strong>{vnpTransactionNo}</strong></p>
                <p>Ngày thanh toán: <strong>{formatVNPayDate(vnpPayDate)}</strong></p>
                <p style={{ color: '#2ecc71', fontWeight: 'bold', marginTop: '10px' }}>
                  ✨ Trạng thái: Đã thanh toán trực tuyến
                </p>
              </>
            )}
            {!vnpResponseCode && (
              <p style={{ color: '#0056b3', fontWeight: 'bold', marginTop: '10px' }}>
                🕒 Trạng thái: Chờ xác nhận
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="error-icon">❌</div>
          <h2 className="text-error">Thanh toán không thành công!</h2>
          <p>
            Rất tiếc, giao dịch của bạn đã gặp lỗi hoặc bị hủy bởi người dùng. <br />
            Mã lỗi VNPay: <strong>{vnpResponseCode}</strong>
          </p>
          <div className="payment-status-info">
            <p>Mã đơn hàng: <span className="order-id-badge">{orderId || "N/A"}</span></p>
            <p className="text-error">Giao dịch không thành công. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.</p>
          </div>
        </>
      )}

      <div className="success-actions">
        <button className="btn-secondary" onClick={() => navigate('/profile')}>
          Quản lý đơn hàng
        </button>
        <button className="btn-primary-success" onClick={() => navigate('/')}>
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;