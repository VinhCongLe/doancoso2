import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('🎉 Đăng ký thành công! Giờ bạn có thể đăng nhập.');
      navigate('/login'); // Đăng ký xong tự động chuyển sang trang Login
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Vui lòng thử lại'));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        {/* Logo */}
        <div className="auth-logo">🎫 TICKET PRO</div>
        <h1 className="auth-title">Tạo tài khoản mới</h1>
        <p className="auth-subtitle">Tham gia để khám phá các sự kiện hấp dẫn</p>

        <form onSubmit={handleSubmit}>
          <div className="tp-form-group">
            <label className="tp-label">Họ và tên</label>
            <input
              type="text"
              className="tp-input"
              placeholder="Nguyễn Văn A"
              required
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

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
            Đăng Ký Ngay →
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản?{' '}
          <Link to="/login">Đăng nhập tại đây</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;