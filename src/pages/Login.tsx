import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient.ts';
import './styles/Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axiosClient.post('/auth/login', {
        email: email,
        password: password,
      });

      if (response.data && response.data.accessToken) {
        // Lưu thông tin vào máy khách
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
        if (response.data.email) localStorage.setItem('userEmail', response.data.email);

        // Điều hướng SPA để giữ trạng thái ứng dụng
        navigate('/');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo">
              <span className="glasses-icon">👓</span>
              <h1>EyewearHut</h1>
            </div>
            <h2>Đăng nhập</h2>
            <p>Chào mừng bạn quay trở lại</p>
          </div>

          {errorMessage && (
            <div style={{ color: '#cc0000', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #ffcccc' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-footer">
              <a
                href="#forgot-password"
                aria-disabled="true"
                onClick={(e) => e.preventDefault()}
                className="forgot-password"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="signup-link">
            <p>
              Chưa có tài khoản?{' '}
              <button type="button" className="link-button" onClick={() => navigate('/register')}>
                Đăng ký ngay
              </button>
            </p>
          </div>

          <div className="back-home">
            <button type="button" className="link-button" onClick={() => navigate('/')}>← Quay lại trang chủ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;