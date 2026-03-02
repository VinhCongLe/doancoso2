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
    <div className="container mt-5 text-white">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card bg-dark border-secondary shadow p-4">
            <h2 className="text-center mb-4">Tạo Tài Khoản</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Họ và tên</label>
                <input type="text" className="form-control" required
                  onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input type="email" className="form-control" required
                  onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="mb-3">
                <label>Mật khẩu</label>
                <input type="password" className="form-control" required
                  onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-success w-100 mb-3">Đăng Ký Mới</button>
              <div className="text-center">
                Đã có tài khoản? <Link to="/login" className="text-info">Đăng nhập tại đây</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;