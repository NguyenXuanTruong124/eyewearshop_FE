import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
import toast from 'react-hot-toast';
import './styles/Checkout.css';

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsPrescription, setNeedsPrescription] = useState(false);
  const [cartData, setCartData] = useState<any>(null);

  // Lưu ID đơn hàng sau khi tạo thành công để dùng cho Payment
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
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Lấy giỏ hàng từ Session
        const cartRes = await axiosClient.get('/cart');
        console.log('📡 [API GET /cart] Phản hồi:', cartRes.data);

        if (!cartRes.data || !cartRes.data.items || cartRes.data.items.length === 0) {
          toast.error('Giỏ hàng trống, vui lòng thêm sản phẩm.');
          navigate('/cart');
          return;
        }

        setCartData(cartRes.data);

        // 2. Tải requirement để kiểm tra xem có cần nhập thông số mắt không
        try {
          // Lưu ý: Đường dẫn API requirement có thể cần điều chỉnh nếu tên API API thực tế của bạn khác
          const reqRes = await axiosClient.get('/checkout/requirements');
          console.log('📡 [API GET /checkout/requirements] Phản hồi:', reqRes.data);
          // Kiểm tra field trả về (có thể là needsPrescription hoặc requiresPrescription tuỳ BE bạn định nghĩa)
          setNeedsPrescription(reqRes.data.needsPrescription || reqRes.data.requiresPrescription || false);
        } catch (err: any) {
          console.error("Lỗi gọi API yêu cầu:", err);
          // Fallback logic nếu API chưa có sẵn
          const hasFrame = cartRes.data.items.some((i: any) => i.variant?.product?.productType === 'FRAME');
          const hasRxLens = cartRes.data.items.some((i: any) => i.variant?.product?.productType === 'RX_LENS');
          setNeedsPrescription(hasFrame && hasRxLens);
        }

        // Luôn khởi tạo ở bước đầu tiên hiển thị thực tế (số 1)
        setStep(1);

        // 3. Tải dữ liệu Profile, Địa chỉ và Đơn kính
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
        od_sph: p.odSph || p.rightSphere || p.od_sph || '', od_cyl: p.odCyl || p.rightCylinder || p.od_cyl || '', od_axis: p.odAxis || p.rightAxis || p.od_axis || '', od_add: p.odAdd || p.rightAdd || p.od_add || '',
        os_sph: p.osSph || p.leftSphere || p.os_sph || '', os_cyl: p.osCyl || p.leftCylinder || p.os_cyl || '', os_axis: p.osAxis || p.leftAxis || p.os_axis || '', os_add: p.osAdd || p.leftAdd || p.os_add || '',
        pd: p.pd || p.rightPD || p.pd_value || ''
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
        phoneNumber: a.phoneNumber || a.phone || prev.phoneNumber,
        address: a.addressLine || a.address || '',
        city: a.city || '',
        district: a.district || '',
        ward: a.ward || ''
      }));
      toast.success("Đã áp dụng địa chỉ giao hàng!");
    }
  };

  // Gọi API Checkout chốt đơn khi nhấn Tiếp tục ở Bước 2
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

      console.log('➡️ [Checkout] Đang gửi Payload Checkout:', payload);
      const res = await axiosClient.post('/checkout', payload);
      console.log('✅ [Checkout] Phản hồi Checkout:', res.data);

      if (res.data && res.data.orderId) {
        setOrderId(res.data.orderId);
        toast.success("Thông tin đã được xác nhận. Order ID: " + res.data.orderId);
        console.log('🎯 [Checkout] Đã lưu Order ID thành công:', res.data.orderId);

        // 🔥 Cập nhật giỏ hàng trên Header sau khi tạo đơn hàng thành công
        window.dispatchEvent(new Event('cartUpdated'));

        // Chuyển sang bước thanh toán an toàn
        setStep(needsPrescription ? 3 : 2);
      } else {
        toast.error("Không nhận được Order ID từ Server!");
        console.error('❌ [Checkout] Phản hồi không có Order ID:', res.data);
      }
    } catch (e: any) {
      console.error('❌ [Checkout] Lỗi tạo đơn hàng:', e.response?.data || e.message);
      toast.error(e.response?.data?.message || "Lỗi khi chốt đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalOrder = async () => {
    if (!orderId) {
      toast.error("Thiếu thông tin đơn hàng!");
      return;
    }
    setLoading(true);
    try {
      const paymentPayload = {
        orderId: orderId,
        paymentMethod: paymentMethod,
        paymentType: paymentMethod, // Đề phòng BE cần thêm field paymentType
        amount: cartData.summary?.subTotal || 0,
        note: shippingInfo.notes || ""
      };

      console.log('➡️ [Payment] Đang gửi Payload Payment:', paymentPayload);
      const payRes = await axiosClient.post('/payments', paymentPayload);
      console.log('✅ [Payment] Phản hồi Payment:', payRes.data);

      const vnpayUrl = payRes.data.paymentUrl || payRes.data.url || payRes.data.redirectUrl || (payRes.data.data && payRes.data.data.paymentUrl);
      if (paymentMethod === 'VNPay') {
        if (vnpayUrl) {
          window.location.href = vnpayUrl;
        } else {
          toast.error("Không nhận được Link thanh toán VNPay từ Request!");
          console.error("❌ VNPay Missing URL, payRes.data:", payRes.data);
        }
      } else {
        navigate(`/order-success?orderId=${orderId}`);
      }
    } catch (e: any) {
      console.error('❌ [Payment] Lỗi thanh toán:', e.response?.data || e.message);
      toast.error(e.response?.data?.message || "Có lỗi khi thanh toán. Xem Console để biết chi tiết.");
    } finally {
      setLoading(false);
    }
  };

  if (!cartData || step === null) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* PROGRESS BAR */}
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

            {/* BƯỚC 1: ĐỘ KÍNH */}
            {step === 1 && needsPrescription && (
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
                              onChange={(e) => setPrescription({ ...prescription, [`${eye}_${f}`]: e.target.value })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="field pd-field">
                    <label>PD (Khoảng cách đồng tử)</label>
                    <input value={prescription.pd} onChange={(e) => setPrescription({ ...prescription, pd: e.target.value })} />
                  </div>
                </div>
                <div className="actions">
                  <button className="btn-next" onClick={() => setStep(2)}>Tiếp tục</button>
                </div>
              </div>
            )}

            {/* BƯỚC GIAO HÀNG */}
            {((step === 1 && !needsPrescription) || (step === 2 && needsPrescription)) && (
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
                    <input value={shippingInfo.fullName} onChange={e => setShippingInfo({ ...shippingInfo, fullName: e.target.value })} />
                  </div>
                  <div className="input-row-2">
                    <div className="field"><label>Số điện thoại *</label><input value={shippingInfo.phoneNumber} onChange={e => setShippingInfo({ ...shippingInfo, phoneNumber: e.target.value })} /></div>
                    <div className="field"><label>Email *</label><input value={shippingInfo.email} onChange={e => setShippingInfo({ ...shippingInfo, email: e.target.value })} /></div>
                  </div>
                  <div className="field">
                    <label>Địa chỉ nhận hàng *</label>
                    <input value={shippingInfo.address} onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })} />
                  </div>
                  <div className="input-row-2">
                    <div className="field"><label>Tỉnh/Thành phố *</label><input value={shippingInfo.city} onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })} /></div>
                    <div className="field"><label>Quận/Huyện *</label><input value={shippingInfo.district} onChange={e => setShippingInfo({ ...shippingInfo, district: e.target.value })} /></div>
                  </div>
                </div>
                <div className="actions">
                  {needsPrescription && <button className="btn-back" onClick={() => setStep(1)}>Quay lại</button>}
                  <button className="btn-next" onClick={handleProceedToPayment} disabled={loading}>
                    {loading ? "Đang xử lý..." : "Tiếp tục"}
                  </button>
                </div>
              </div>
            )}

            {/* BƯỚC THANH TOÁN */}
            {((step === 2 && !needsPrescription) || (step === 3 && needsPrescription)) && (
              <div className="card-section">
                <h3 className="card-title">💳 Phương thức thanh toán</h3>
                <div className="payment-list">
                  {['VNPay', 'MoMo'].map(method => (
                    <div key={method} className={`pay-item ${paymentMethod === method ? 'active' : ''}`} onClick={() => setPaymentMethod(method)}>
                      <strong>{method === 'COD' ? 'Thanh toán khi nhận hàng' : method}</strong>
                    </div>
                  ))}
                </div>
                <div className="actions">
                  <button className="btn-back" onClick={() => (needsPrescription ? setStep(2) : setStep(1))}>Quay lại</button>
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