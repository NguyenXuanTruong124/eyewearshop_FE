import React, { useState } from 'react';
import './styles/Checkout.css';

const Checkout: React.FC = () => {
  const [step, setStep] = useState(1);
  const needsPrescription = true; // Sản phẩm cần độ kính

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="checkout-page">
      <div className="checkout-container-wide">
        
        {/* Stepper */}
        <div className="checkout-stepper">
          {needsPrescription && (
            <div className={`step-item ${step === 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Độ kính</span>
            </div>
          )}
          <div className={`step-item ${step === 2 ? 'active' : ''}`}>
            <div className="step-number">{needsPrescription ? 2 : 1}</div>
            <span>Thông tin</span>
          </div>
          <div className={`step-item ${step === 3 ? 'active' : ''}`}>
            <div className="step-number">{needsPrescription ? 3 : 2}</div>
            <span>Thanh toán</span>
          </div>
        </div>

        <div className="checkout-layout">
          <main className="checkout-main-card">
            
            {/* BƯỚC 1: ĐỘ KÍNH */}
            {step === 1 && needsPrescription && (
              <div className="step-content">
                <h3 className="section-title">👓 Thông số độ kính</h3>
                <p className="prescription-row-title">Mắt phải (OD)</p>
                <div className="prescription-grid">
                  <div className="form-field"><label>SPH</label><input placeholder="-2.00" /></div>
                  <div className="form-field"><label>CYL</label><input placeholder="-0.50" /></div>
                  <div className="form-field"><label>AXIS</label><input placeholder="180" /></div>
                  <div className="form-field"><label>ADD</label><input placeholder="0.00" /></div>
                </div>
                <p className="prescription-row-title">Mắt trái (OS)</p>
                <div className="prescription-grid">
                  <div className="form-field"><label>SPH</label><input placeholder="-2.25" /></div>
                  <div className="form-field"><label>CYL</label><input placeholder="-0.75" /></div>
                  <div className="form-field"><label>AXIS</label><input placeholder="175" /></div>
                  <div className="form-field"><label>ADD</label><input placeholder="0.00" /></div>
                </div>
                <div className="checkout-actions">
                  <button className="btn-primary-checkout" onClick={nextStep}>Tiếp tục thanh toán</button>
                </div>
              </div>
            )}

            {/* BƯỚC 2: THÔNG TIN */}
            {step === 2 && (
              <div className="step-content">
                <h3 className="section-title">📍 Thông tin giao hàng</h3>
                <div className="form-field"><label>Họ và tên *</label><input placeholder="Nguyễn Văn A" /></div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                  <div className="form-field"><label>Số điện thoại *</label><input placeholder="090..." /></div>
                  <div className="form-field"><label>Email *</label><input placeholder="a@gmail.com" /></div>
                </div>
                <div className="form-field"><label>Địa chỉ chi tiết *</label><input placeholder="Số nhà, tên đường..." /></div>
                <div className="checkout-actions">
                  <button className="btn-back-checkout" onClick={prevStep}>Quay lại</button>
                  <button className="btn-primary-checkout" onClick={nextStep}>Tiếp tục</button>
                </div>
              </div>
            )}

            {/* BƯỚC 3: THANH TOÁN */}
            {step === 3 && (
              <div className="step-content">
                <h3 className="section-title">💳 Phương thức thanh toán</h3>
                <div style={{border: '1px solid #cc0000', background: '#fff5f5', padding: '20px', borderRadius: '8px', marginBottom: '15px'}}>
                   <strong>Thanh toán khi nhận hàng (COD)</strong>
                </div>
                <div className="checkout-actions">
                  <button className="btn-back-checkout" onClick={prevStep}>Quay lại</button>
                  <button className="btn-primary-checkout">Đặt hàng ngay</button>
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="checkout-sidebar">
            <h3 style={{fontSize: '18px', marginBottom: '20px'}}>Đơn hàng của bạn</h3>
            <div style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
              <img src="https://via.placeholder.com/80" style={{borderRadius: '8px'}} alt="product" />
              <div>
                <p style={{fontWeight: 600, fontSize: '14px'}}>Tròng Kính Chống Ánh Sáng Xanh</p>
                <p style={{color: '#cc0000', fontWeight: 700, marginTop: '5px'}}>650.000đ</p>
              </div>
            </div>
            <div style={{borderTop: '1px solid #eee', paddingTop: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px'}}>
                <span>Tổng cộng</span><span style={{color: '#cc0000'}}>650.000đ</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;