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
    <div className="container mt-5 text-white">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card bg-dark border-secondary shadow p-4">
            <h2 className="text-center mb-4">Đăng Nhập</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Email của bạn</label>
                <input type="email" className="form-control" required
                  onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="mb-3">
                <label>Mật khẩu</label>
                <input type="password" className="form-control" required
                  onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">Vào Hệ Thống</button>
              <div className="text-center">
                Chưa có tài khoản? <Link to="/register" className="text-warning">Đăng ký ngay</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;