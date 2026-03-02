import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" không?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Xóa thành công!");
      fetchUsers(); // Tải lại danh sách
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể xóa!"));
    }
  };

  return (
    <div className="container mt-4 text-white mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-warning mb-0">👥 Quản Lý Tài Khoản</h2>
        <Link to="/admin/add-user" className="btn btn-success fw-bold shadow">
          + Thêm Tài Khoản
        </Link>
      </div>

      <div className="card bg-dark border-secondary shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle text-center">
              <thead className="table-active">
                <tr className="text-info">
                  <th>STT</th>
                  <th className="text-start">Họ và Tên</th>
                  <th className="text-start">Email</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold text-start">{user.name}</td>
                    <td className="text-start">{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/edit-user/${user._id}`} className="btn btn-sm btn-warning me-2 text-dark fw-bold">Sửa</Link>
                      <button onClick={() => handleDelete(user._id, user.name)} className="btn btn-sm btn-danger fw-bold">Xóa</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="5">Chưa có dữ liệu người dùng.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;