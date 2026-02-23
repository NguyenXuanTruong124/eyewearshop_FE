import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API_BE/axiosClient';
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
      // 🔥 1. LOGIN
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
      });

      if (response.data?.accessToken) {

        // 🔥 2. LƯU TOKEN
        localStorage.setItem('accessToken', response.data.accessToken);

        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }

        // 🔥 3. LẤY PROFILE → ROLE
        const me = await axiosClient.get('/auth/me');

        const role = me.data?.role;
        const userEmail = me.data?.email;

        if (role) localStorage.setItem('userRole', role);
        if (userEmail) localStorage.setItem('userEmail', userEmail);

        // Phát sự kiện để Header cập nhật
        window.dispatchEvent(new Event('authChanged'));

        // 🔥 4. REDIRECT THEO ROLE
        if (role === 'Admin') {
          navigate('/admin');
        } 
        else if (role === 'Manager') {
          navigate('/manager');
        }else if (role === 'Operations') {
          navigate('/operations');
        }else if (role === 'SalesSupport') {
          navigate('/sales-support');
        } else {
          navigate('/'); // Customer
        }
      }

    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
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
            <div
              style={{
                color: '#cc0000',
                backgroundColor: '#fff5f5',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px',
                fontSize: '14px',
                textAlign: 'center',
                border: '1px solid #ffcccc',
              }}
            >
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
                href="#"
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
              <button
                type="button"
                className="link-button"
                onClick={() => navigate('/register')}
              >
                Đăng ký ngay
              </button>
            </p>
          </div>

          <div className="back-home">
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/')}
            >
              ← Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;