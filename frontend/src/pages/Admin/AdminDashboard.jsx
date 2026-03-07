import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);

  // Lấy danh sách sự kiện
  const loadEvents = async () => {
    const res = await axios.get('http://localhost:5000/api/events');
    setEvents(res.data.data);
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/events');
        setEvents(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadEvents();
  }, []);

  // Hàm xóa sự kiện
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      alert("Đã xóa thành công!");
      loadEvents(); // Reload lại danh sách
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="tp-page-header">
        <h1 className="tp-page-title">Quản Lý Sự Kiện</h1>
        <Link to="/admin/add-event" className="btn-primary-tp">
          + Thêm Sự Kiện Mới
        </Link>
      </div>

      {/* Table */}
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Tên Sự Kiện</th>
              <th>Địa Điểm</th>
              <th>Ngày Diễn Ra</th>
              <th>Giá Vé</th>
              <th style={{ textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id}>
                <td>
                  <strong style={{ color: 'var(--text-primary)' }}>{event.title}</strong>
                </td>
                <td>{event.location}</td>
                <td>{new Date(event.startDate).toLocaleDateString('vi-VN')}</td>
                <td>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {event.price.toLocaleString()}đ
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <Link to={`/admin/edit-event/${event._id}`} className="btn-accent-tp" style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}>
                      Sửa
                    </Link>
                    <button
                      className="btn-danger-tp"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                      onClick={() => handleDelete(event._id)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan="5">
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <span className="empty-state-icon">📅</span>
                    <p className="empty-state-text">Chưa có sự kiện nào.</p>
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

export default AdminDashboard;