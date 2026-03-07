import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UserForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const { id } = useParams(); // Nếu có ID trên URL thì là chế độ Sửa
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const token = localStorage.getItem('token');
      axios.get(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          const { name, email, role } = res.data.data;
          // Chú ý: Không set password từ DB về vì nó đã bị mã hóa
          setFormData({ name, email, password: '', role });
        })
        .catch(error => console.error("Lỗi lấy thông tin:", error));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (id) {
        await axios.put(`http://localhost:5000/api/users/${id}`, formData, config);
        alert("Cập nhật tài khoản thành công!");
      } else {
        await axios.post('http://localhost:5000/api/users', formData, config);
        alert("Thêm tài khoản thành công!");
      }
      navigate('/admin/users');
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Đã có lỗi xảy ra!"));
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="tp-page-header">
        <h1 className="tp-page-title">
          {id ? 'Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}
        </h1>
      </div>

      {/* Form card */}
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="tp-card">
            <div className="tp-card-body">
              <form onSubmit={handleSubmit}>
                <div className="tp-form-group">
                  <label className="tp-label">Họ và tên</label>
                  <input
                    type="text"
                    className="tp-input"
                    placeholder="Nguyễn Văn A"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="tp-form-group">
                  <label className="tp-label">Email</label>
                  <input
                    type="email"
                    className="tp-input"
                    placeholder="email@example.com"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="tp-form-group">
                  <label className="tp-label">
                    Mật khẩu{' '}
                    {id && (
                      <span style={{ fontWeight: 400, color: 'var(--text-disabled)', fontSize: '0.75rem', textTransform: 'none' }}>
                        (Bỏ trống nếu không muốn đổi)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    className="tp-input"
                    placeholder="••••••••"
                    required={!id} // Nếu là Thêm mới thì bắt buộc nhập, nếu Sửa thì không
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="tp-form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="tp-label">Phân quyền</label>
                  <select
                    className="tp-select"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">👤 Khách hàng (User)</option>
                    <option value="admin">👑 Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn-primary-tp" style={{ flex: 1, justifyContent: 'center' }}>
                    💾 Lưu Thông Tin
                  </button>
                  <button
                    type="button"
                    className="btn-ghost-tp"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => navigate('/admin/users')}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;