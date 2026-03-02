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
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản Lý Sự Kiện</h2>
        <Link to="/admin/add-event" className="btn btn-success">+ Thêm Sự Kiện Mới</Link>
      </div>

      <table className="table table-hover shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Tên Sự Kiện</th>
            <th>Địa Điểm</th>
            <th>Ngày Diễn Ra</th>
            <th>Giá Vé</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event._id}>
              <td><strong>{event.title}</strong></td>
              <td>{event.location}</td>
              <td>{new Date(event.startDate).toLocaleDateString('vi-VN')}</td>
              <td>{event.price.toLocaleString()}đ</td>
              <td>
                <Link to={`/admin/edit-event/${event._id}`} className="btn btn-warning btn-sm me-2">Sửa</Link>                                            
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;