import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);

      // 1. Lưu "Giấy thông hành" (Token) và Thông tin user vào máy
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('🔓 Đăng nhập thành công!');

      // 2. Refresh lại toàn bộ trang web để Navbar cập nhật (ẩn nút Đăng nhập)
      window.location.href = '/';
    } catch {
      alert('❌ Sai email hoặc mật khẩu!');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        {/* Logo */}
        <div className="auth-logo">🎫 TICKET PRO</div>
        <h1 className="auth-title">Chào mừng trở lại</h1>
        <p className="auth-subtitle">Đăng nhập để tiếp tục trải nghiệm</p>

        <form onSubmit={handleSubmit}>
          <div className="tp-form-group">
            <label className="tp-label">Email</label>
            <input
              type="email"
              className="tp-input"
              placeholder="your@email.com"
              required
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="tp-form-group">
            <label className="tp-label">Mật khẩu</label>
            <input
              type="password"
              className="tp-input"
              placeholder="••••••••"
              required
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            Vào Hệ Thống →
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản?{' '}
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;