import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
import toast from 'react-hot-toast';
import './styles/Checkout.css';

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  // GIỮ CỦA TEAM: Dùng logic check tự động xem có cần độ kính không
  const [needsPrescription, setNeedsPrescription] = useState(false);
  const [cartData, setCartData] = useState<any>(null);

  const [orderId, setOrderId] = useState<number | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [savedPrescriptions, setSavedPrescriptions] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

  const [prescription, setPrescription] = useState({
    od_sph: '', od_cyl: '', od_axis: '', od_add: '',
    os_sph: '', os_cyl: '', os_axis: '', os_add: '', pd: ''
  });
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '', phoneNumber: '', email: '', address: '', city: '', district: '', ward: '', notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('VNPay'); // Mặc định VNPay như ý bạn

  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Lấy giỏ hàng (Cấu trúc team)
        const cartRes = await axiosClient.get('/cart');
        
        if (!cartRes.data || !cartRes.data.items || cartRes.data.items.length === 0) {
          toast.error('Giỏ hàng trống, vui lòng thêm sản phẩm.');
          navigate('/cart');
          return;
        }
        setCartData(cartRes.data);

        // 2. GIỮ LOGIC TEAM: Kiểm tra requirement từ BE
        try {
          const reqRes = await axiosClient.get('/checkout/requirements');
          setNeedsPrescription(reqRes.data.needsPrescription || reqRes.data.requiresPrescription || false);
        } catch (err: any) {
          // Fallback nếu API lỗi
          const hasFrame = cartRes.data.items.some((i: any) => i.variant?.product?.productType === 'FRAME');
          const hasRxLens = cartRes.data.items.some((i: any) => i.variant?.product?.productType === 'RX_LENS');
          setNeedsPrescription(hasFrame && hasRxLens);
        }

        setStep(1);

        // 3. Tải dữ liệu Profile
        const [addrRes, presRes, profileRes] = await Promise.all([
          axiosClient.get('/account/addresses'),
          axiosClient.get('/prescriptions'),
          axiosClient.get('/account/profile')
        ]);

        setSavedAddresses(addrRes.data);
        setSavedPrescriptions(presRes.data);

        if (profileRes.data) {
          setShippingInfo(prev => ({
            ...prev,
            fullName: profileRes.data.fullName || '',
            email: profileRes.data.email || ''
          }));
        }
      } catch (e) {
        console.error("Lỗi khởi tạo Checkout:", e);
        navigate('/cart');
      }
    };
    initData();
  }, [navigate]);

  const handleSelectPrescription = (id: number) => {
    setSelectedPrescriptionId(id);
    const p = savedPrescriptions.find(item => item.prescriptionId === id);
    if (p) {
      setPrescription({
        od_sph: p.odSph || p.rightSphere || '', od_cyl: p.odCyl || p.rightCylinder || '', od_axis: p.odAxis || p.rightAxis || '', od_add: p.odAdd || p.rightAdd || '',
        os_sph: p.osSph || p.leftSphere || '', os_cyl: p.osCyl || p.leftCylinder || '', os_axis: p.osAxis || p.leftAxis || '', os_add: p.osAdd || p.leftAdd || '',
        pd: p.pd || p.pd_value || ''
      });
      toast.success(`Đã áp dụng thông số mắt`);
    }
  };

  const handleSelectAddress = (id: number) => {
    setSelectedAddressId(id);
    const a = savedAddresses.find(item => item.addressId === id);
    if (a) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: a.receiverName || a.fullName || prev.fullName,
        phoneNumber: a.phoneNumber || prev.phoneNumber,
        address: a.addressLine || '',
        city: a.city || '',
        district: a.district || '',
        ward: a.ward || ''
      }));
      toast.success("Đã áp dụng địa chỉ giao hàng!");
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        addressId: selectedAddressId,
        shippingMethod: "Standard"
      };
      if (needsPrescription && selectedPrescriptionId) {
        payload.prescriptionId = selectedPrescriptionId;
      }

      const res = await axiosClient.post('/checkout', payload);
      if (res.data && res.data.orderId) {
        setOrderId(res.data.orderId);
        setStep(needsPrescription ? 3 : 2);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi khi chốt đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const paymentPayload = {
        orderId: orderId,
        paymentMethod: paymentMethod,
        amount: cartData.summary?.subTotal || 0,
        note: shippingInfo.notes || ""
      };

      const payRes = await axiosClient.post('/payments', paymentPayload);
      const vnpayUrl = payRes.data.paymentUrl || payRes.data.url || (payRes.data.data && payRes.data.data.paymentUrl);
      
      if (paymentMethod === 'VNPay' && vnpayUrl) {
        window.location.href = vnpayUrl;
      } else {
        navigate(`/order-success?orderId=${orderId}`);
      }
    } catch (e: any) {
      toast.error("Có lỗi khi thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  if (!cartData || step === null) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* STEPPER LOGIC CỦA TEAM */}
        <div className="checkout-stepper-new">
          {needsPrescription ? (
            <>
              <div className={`step ${step === 1 ? 'active' : ''}`}><span>1</span><p>Độ kính</p></div>
              <div className="line"></div>
              <div className={`step ${step === 2 ? 'active' : ''}`}><span>2</span><p>Thông tin</p></div>
              <div className="line"></div>
              <div className={`step ${step === 3 ? 'active' : ''}`}><span>3</span><p>Thanh toán</p></div>
            </>
          ) : (
            <>
              <div className={`step ${step === 1 ? 'active' : ''}`}><span>1</span><p>Thông tin</p></div>
              <div className="line"></div>
              <div className={`step ${step === 2 ? 'active' : ''}`}><span>2</span><p>Thanh toán</p></div>
            </>
          )}
        </div>

        <div className="checkout-content-grid">
          <main className="checkout-main">
            {/* RENDER CÁC BƯỚC (GIỮ NGUYÊN LOGIC PHÂN CHIA STEP CỦA TEAM) */}
            {step === 1 && needsPrescription && (
              <div className="card-section">
                <h3 className="card-title">👓 Thông số độ kính</h3>
                {/* ... Form độ kính của bạn ... */}
                <div className="address-select-box highlight">
                  <select onChange={(e) => handleSelectPrescription(Number(e.target.value))} value={selectedPrescriptionId || ''}>
                    <option value="">-- Chọn thông số của bạn --</option>
                    {savedPrescriptions.map(p => <option key={p.prescriptionId} value={p.prescriptionId}>{p.prescribedBy || `Thông số #${p.prescriptionId}`}</option>)}
                  </select>
                </div>
                {/* (Phần input OD/OS giữ nguyên như code của bạn) */}
                <div className="actions">
                  <button className="btn-next" onClick={() => setStep(2)}>Tiếp tục</button>
                </div>
              </div>
            )}

            {((step === 1 && !needsPrescription) || (step === 2 && needsPrescription)) && (
              <div className="card-section">
                <h3 className="card-title">📍 Thông tin giao hàng</h3>
                {/* ... Form địa chỉ ... */}
                <div className="actions">
                  {needsPrescription && <button className="btn-back" onClick={() => setStep(1)}>Quay lại</button>}
                  <button className="btn-next" onClick={handleProceedToPayment} disabled={loading}>Tiếp tục</button>
                </div>
              </div>
            )}

            {((step === 2 && !needsPrescription) || (step === 3 && needsPrescription)) && (
              <div className="card-section">
                <h3 className="card-title">💳 Phương thức thanh toán</h3>
                <div className="payment-list">
                  {['VNPay', 'MoMo', 'COD'].map(method => (
                    <div key={method} className={`pay-item ${paymentMethod === method ? 'active' : ''}`} onClick={() => setPaymentMethod(method)}>
                      <strong>{method}</strong>
                    </div>
                  ))}
                </div>
                <div className="actions">
                  <button className="btn-back" onClick={() => (needsPrescription ? setStep(2) : setStep(1))}>Quay lại</button>
                  <button className="btn-order" onClick={handleFinalOrder} disabled={loading}>Đặt hàng ngay</button>
                </div>
              </div>
            )}
          </main>

          <aside className="checkout-sidebar-new">
            {/* GIỮ SIDEBAR CỦA TEAM (Hiển thị list sản phẩm và summary) */}
            <h3 className="sidebar-title">Đơn hàng của bạn</h3>
            <div className="order-items">
              {cartData.items?.map((it: any) => (
                <div className="mini-item" key={it.variantId}>
                  <img src={it.variant?.product?.primaryImageUrl} alt="product" width="50" />
                  <div className="info">
                    <p className="name">{it.variant?.product?.productName}</p>
                    <p className="price">{(it.variant?.price || 0).toLocaleString()}đ</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-box">
               <div className="row"><span>Tổng cộng</span><span className="final">{(cartData.summary?.subTotal || 0).toLocaleString()}đ</span></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;