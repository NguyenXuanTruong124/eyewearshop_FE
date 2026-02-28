import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient.ts';
import toast from 'react-hot-toast';
import './styles/Register.css';

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Các trạng thái lưu trữ thông tin đăng ký
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra khớp mật khẩu trước khi gọi API
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    const registerToast = toast.loading('Đang xử lý đăng ký...');

    try {
      // Gọi API đăng ký dựa trên Swagger
      const response = await axiosClient.post('/auth/register', {
        email: email,
        password: password,
        fullName: fullName,
        phoneNumber: phoneNumber
      });

      // Nếu đăng ký thành công và server trả về Token ngay lập tức
      if (response.data && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('userEmail', response.data.email);

        toast.success('Đăng ký tài khoản thành công!', { id: registerToast });

        // Tạo khoảng chờ nhỏ để user nhìn thấy toast thành công
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Register error:', error);
      // Hiển thị lỗi từ server hoặc lỗi mặc định
      const msg = error.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại!';
      toast.error(msg, { id: registerToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-box">
          <h2>Đăng ký tài khoản</h2>
          <p>Tham gia với EyewearHut ngay hôm nay</p>

          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại *</label>
              <input
                type="tel"
                placeholder="0123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
            </button>
          </form>

          <div className="login-link">
            <p>
              Đã có tài khoản?{' '}
              <button type="button" className="link-button" onClick={() => navigate('/login')}>
                Đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;