import React, { useState } from 'react';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password });
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
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-footer">
              <a href="#forgot-password" className="forgot-password">
                Quên mật khẩu?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Đăng nhập
            </button>
          </form>

          <div className="social-login">
            <p>Hoặc đăng nhập với</p>
            <div className="social-buttons">
              <button className="social-btn google-btn">
                <span>📍</span> Google
              </button>
              <button className="social-btn facebook-btn">
                <span>f</span> Facebook
              </button>
            </div>
          </div>

          <div className="signup-link">
            <p>
              Chưa có tài khoản?{' '}
              <a href="#signup">Đăng ký ngay</a>
            </p>
          </div>

          <div className="back-home">
            <a href="/">← Quay lại trang chủ</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
