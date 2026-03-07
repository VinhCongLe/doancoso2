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

  // Generate initials from name
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'NA';

  return (
    <div>
      {/* Page header */}
      <div className="tp-page-header">
        <h1 className="tp-page-title">Quản Lý Tài Khoản</h1>
        <Link to="/admin/add-user" className="btn-primary-tp">
          + Thêm Tài Khoản
        </Link>
      </div>

      {/* Table */}
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th style={{ textAlign: 'center' }}>Vai trò</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                {/* Avatar + name */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="user-avatar">{getInitials(user.name)}</div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={user.role === 'admin' ? 'tp-badge tp-badge-danger' : 'tp-badge tp-badge-primary'}>
                    {user.role === 'admin' ? '👑 Quản trị viên' : '👤 Khách hàng'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <Link
                      to={`/admin/edit-user/${user._id}`}
                      className="btn-accent-tp"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                    >
                      ✏️ Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(user._id, user.name)}
                      className="btn-danger-tp"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4">
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <span className="empty-state-icon">👥</span>
                    <p className="empty-state-text">Chưa có dữ liệu người dùng.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;