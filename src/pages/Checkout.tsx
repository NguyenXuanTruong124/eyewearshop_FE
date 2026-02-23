import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
import toast from 'react-hot-toast';
import './styles/Checkout.css';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. MẶC ĐỊNH LUÔN BẮT ĐẦU TỪ BƯỚC 1 VÀ LUÔN CẦN TOA THUỐC
  const [step, setStep] = useState<number>(1); 
  const [loading, setLoading] = useState(false);
  const [needsPrescription, setNeedsPrescription] = useState(true); // Luôn hiện bước độ kính
  const [cartData, setCartData] = useState<any>(null);

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
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        // 1. Lấy giỏ hàng
        const cartRes = await axiosClient.get('/cart');
        let currentCart = cartRes?.data && cartRes.data.items && cartRes.data.items.length > 0 
          ? cartRes.data 
          : JSON.parse(localStorage.getItem('localCart') || '{"items":[],"summary":{"subTotal":0,"itemCount":0}}');
        
        setCartData(currentCart);

        // 🔥 ĐÃ BỎ QUA API REQUIREMENTS - LUÔN SET LÀ TRUE
        setNeedsPrescription(true);
        setStep(1);

        // 2. Tải dữ liệu Profile, Địa chỉ và Đơn kính
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
        console.error("Lỗi khởi tạo:", e);
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
        pd: p.pd || p.rightPD || p.leftPD || ''
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
        fullName: a.receiverName || prev.fullName,
        phoneNumber: a.phoneNumber || prev.phoneNumber,
        address: a.addressLine || '',
        city: a.city || '',
        district: a.district || '',
        ward: a.ward || ''
      }));
      toast.success("Đã áp dụng địa chỉ giao hàng!");
    }
  };

  const handleFinalOrder = async () => {
    setLoading(true);
    try {
      const orderRes = await axiosClient.post('/checkout', {
        shippingAddressId: selectedAddressId,
        ...shippingInfo,
        prescription: needsPrescription ? prescription : null
      });
      
      const payRes = await axiosClient.post('/payments', {
        orderId: orderRes.data.orderId,
        paymentMethod: paymentMethod
      });

      if (paymentMethod === 'VNPay') window.location.href = payRes.data.paymentUrl;
      else navigate(`/order-success?orderId=${orderRes.data.orderId}`);
    } catch (e: any) { 
      toast.error(e.response?.data?.message || "Có lỗi khi đặt hàng"); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!cartData) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        
        {/* PROGRESS BAR - LUÔN HIỆN 3 BƯỚC CỐ ĐỊNH */}
        <div className="checkout-stepper-new">
          <div className={`step ${step === 1 ? 'active' : ''}`}><span>1</span><p>Độ kính</p></div>
          <div className="line"></div>
          <div className={`step ${step === 2 ? 'active' : ''}`}><span>2</span><p>Thông tin</p></div>
          <div className="line"></div>
          <div className={`step ${step === 3 ? 'active' : ''}`}><span>3</span><p>Thanh toán</p></div>
        </div>

        <div className="checkout-content-grid">
          <main className="checkout-main">
            
            {/* BƯỚC 1: ĐỘ KÍNH */}
            {step === 1 && (
              <div className="card-section">
                <h3 className="card-title">👓 Thông số độ kính</h3>
                <div className="address-select-box highlight">
                  <label>Sử dụng độ kính đã lưu</label>
                  <select onChange={(e) => handleSelectPrescription(Number(e.target.value))} value={selectedPrescriptionId || ''}>
                    <option value="">-- Chọn thông số của bạn --</option>
                    {savedPrescriptions.map(p => (
                      <option key={p.prescriptionId} value={p.prescriptionId}>
                        {p.prescribedBy ? p.prescribedBy : `Thông số #${p.prescriptionId}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="prescription-form">
                  {['od', 'os'].map(eye => (
                    <div key={eye}>
                      <p className="eye-label">{eye === 'od' ? 'Mắt phải (OD)' : 'Mắt trái (OS)'}</p>
                      <div className="input-row">
                        {['sph', 'cyl', 'axis', 'add'].map(f => (
                          <div className="field" key={f}>
                            <label>{f.toUpperCase()}</label>
                            <input 
                              type="text"
                              value={(prescription as any)[`${eye}_${f}`]} 
                              onChange={(e) => setPrescription({...prescription, [`${eye}_${f}`]: e.target.value})} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="field pd-field">
                    <label>PD (Khoảng cách đồng tử)</label>
                    <input value={prescription.pd} onChange={(e) => setPrescription({...prescription, pd: e.target.value})} />
                  </div>
                </div>
                <div className="actions">
                  <button className="btn-next" onClick={() => setStep(2)}>Tiếp tục</button>
                </div>
              </div>
            )}

            {/* BƯỚC 2: THÔNG TIN GIAO HÀNG */}
            {step === 2 && (
              <div className="card-section">
                <h3 className="card-title">📍 Thông tin giao hàng</h3>
                <div className="address-select-box highlight">
                  <label>Sử dụng địa chỉ đã lưu</label>
                  <select onChange={(e) => handleSelectAddress(Number(e.target.value))} value={selectedAddressId || ''}>
                    <option value="">-- Chọn địa chỉ --</option>
                    {savedAddresses.map(a => (
                      <option key={a.addressId} value={a.addressId}>{a.receiverName} - {a.addressLine}</option>
                    ))}
                  </select>
                </div>
                <div className="shipping-form">
                  <div className="field">
                    <label>Họ và tên *</label>
                    <input value={shippingInfo.fullName} onChange={e => setShippingInfo({...shippingInfo, fullName: e.target.value})} />
                  </div>
                  <div className="input-row-2">
                    <div className="field"><label>Số điện thoại *</label><input value={shippingInfo.phoneNumber} onChange={e => setShippingInfo({...shippingInfo, phoneNumber: e.target.value})} /></div>
                    <div className="field"><label>Email *</label><input value={shippingInfo.email} onChange={e => setShippingInfo({...shippingInfo, email: e.target.value})} /></div>
                  </div>
                  <div className="field">
                    <label>Địa chỉ nhận hàng *</label>
                    <input value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} />
                  </div>
                  <div className="input-row-2">
                    <div className="field"><label>Tỉnh/Thành phố *</label><input value={shippingInfo.city} onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})} /></div>
                    <div className="field"><label>Quận/Huyện *</label><input value={shippingInfo.district} onChange={e => setShippingInfo({...shippingInfo, district: e.target.value})} /></div>
                  </div>
                </div>
                <div className="actions">
                  <button className="btn-back" onClick={() => setStep(1)}>Quay lại</button>
                  <button className="btn-next" onClick={() => setStep(3)}>Tiếp tục</button>
                </div>
              </div>
            )}

            {/* BƯỚC 3: THANH TOÁN */}
            {step === 3 && (
              <div className="card-section">
                <h3 className="card-title">💳 Phương thức thanh toán</h3>
                <div className="payment-list">
                  {['COD', 'VNPay', 'MoMo'].map(method => (
                    <div key={method} className={`pay-item ${paymentMethod === method ? 'active' : ''}`} onClick={() => setPaymentMethod(method)}>
                      <strong>{method === 'COD' ? 'Thanh toán khi nhận hàng' : method}</strong>
                    </div>
                  ))}
                </div>
                <div className="actions">
                  <button className="btn-back" onClick={() => setStep(2)}>Quay lại</button>
                  <button className="btn-order" onClick={handleFinalOrder} disabled={loading}>{loading ? "Đang xử lý..." : "Đặt hàng ngay"}</button>
                </div>
              </div>
            )}
          </main>

          <aside className="checkout-sidebar-new">
            <h3 className="sidebar-title">Đơn hàng của bạn</h3>
            <div className="order-items">
              {cartData.items?.map((it: any) => (
                <div className="mini-item" key={it.variantId}>
                  <div className="img-box">
                    <img src={it.variant?.product?.primaryImageUrl || 'https://placehold.co/100'} alt="product" />
                  </div>
                  <div className="info">
                    <p className="name">{it.variant?.product?.productName}</p>
                    <p className="item-qty-info">Số lượng: <strong>{it.quantity}</strong></p>
                    <p className="price">{(it.variant?.price || 0).toLocaleString()}đ</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-box">
              <div className="row"><span>Tạm tính</span><span>{(cartData.summary?.subTotal || 0).toLocaleString()}đ</span></div>
              <div className="row"><span>Phí vận chuyển</span><span className="free">Miễn phí</span></div>
              <div className="row total"><span>Tổng cộng</span><span className="final">{(cartData.summary?.subTotal || 0).toLocaleString()}đ</span></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;