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
    <div className="container mt-5 text-white">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card bg-dark border-secondary shadow p-4">
            <h3 className="text-center text-warning mb-4">
              {id ? "Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="text-info">Họ và tên</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="mb-3">
                <label className="text-info">Email</label>
                <input type="email" className="form-control bg-dark text-white border-secondary" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="mb-3">
                <label className="text-info">
                  Mật khẩu {id && <small className="text-muted">(Bỏ trống nếu không muốn đổi)</small>}
                </label>
                <input type="password" className="form-control bg-dark text-white border-secondary" 
                  required={!id} // Nếu là Thêm mới thì bắt buộc nhập, nếu Sửa thì không
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="mb-4">
                <label className="text-info">Phân quyền</label>
                <select className="form-select bg-dark text-white border-secondary" 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="user">Khách hàng (User)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-warning w-50 fw-bold">Lưu Thông Tin</button>
                <button type="button" className="btn btn-outline-light w-50" onClick={() => navigate('/admin/users')}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;