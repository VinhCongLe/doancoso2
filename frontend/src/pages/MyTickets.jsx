import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyTickets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Bạn cần đăng nhập để xem vé!");
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/tickets/my-tickets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách vé:", error);
      }
    };

    fetchMyTickets();
  }, [navigate]);

  return (
    <div className="container mt-5 text-white">
      <h2 className="mb-4 text-center">🎟️ Vé Sự Kiện Của Tôi</h2>
      
      {tickets.length === 0 ? (
        <div className="alert alert-info text-center">Bạn chưa đặt mua vé nào.</div>
      ) : (
        <div className="row">
          {tickets.map(ticket => (
            <div className="col-md-6 mb-4" key={ticket._id}>
              <div className="card bg-dark border-warning shadow">
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title text-warning mb-0">{ticket.event?.title || 'Sự kiện đã bị xóa'}</h5>
                    <span className={`badge ${ticket.status === 'Pending' ? 'bg-secondary' : ticket.status === 'Paid' ? 'bg-success' : 'bg-danger'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <hr className="border-secondary" />
                  <p className="mb-1"><strong>📍 Địa điểm:</strong> {ticket.event?.location}</p>
                  <p className="mb-1"><strong>📅 Ngày:</strong> {ticket.event?.startDate ? new Date(ticket.event.startDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  <p className="mb-1"><strong>🎟️ Số lượng vé:</strong> {ticket.quantity}</p>
                  <p className="mb-0 text-danger fs-5"><strong>💰 Tổng tiền: {ticket.totalPrice.toLocaleString()} VNĐ</strong></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;