import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);

  // Hàm tải danh sách toàn bộ vé (Chỉ Admin mới gọi được)
 // Bọc hàm bằng useCallback để tối ưu hiệu suất và dập tắt lỗi ESLint
  const loadTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách vé:", error);
    }
  }, []); // Mảng rỗng nghĩa là hàm này chỉ tạo ra 1 lần duy nhất

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTickets();
  }, [loadTickets]); // Đưa loadTickets vào đây để ESLint vui lòng

  // Hàm cập nhật trạng thái vé
  const handleUpdateStatus = async (ticketId, newStatus) => {
    if (!window.confirm(`Xác nhận chuyển vé sang trạng thái: ${newStatus}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Cập nhật trạng thái thành công!");
      loadTickets(); // Tải lại bảng sau khi cập nhật
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra!");
    }
  };

  return (
    <div className="container mt-4 text-white">
      <h2 className="mb-4">Quản Lý Đơn Đặt Vé</h2>
      <div className="table-responsive">
        <table className="table table-dark table-hover table-bordered border-secondary align-middle">
          <thead className="table-active">
            <tr className="text-center">
              <th>Khách hàng</th>
              <th>Sự kiện</th>
              <th>Số lượng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket._id}>
                <td>
                  <strong>{ticket.user?.name}</strong> <br/>
                  <small className="text-muted">{ticket.user?.email}</small>
                </td>
                <td>{ticket.event?.title || 'N/A'}</td>
                <td className="text-center">{ticket.quantity}</td>
                <td className="text-danger fw-bold text-center">
                  {ticket.totalPrice.toLocaleString()}đ
                </td>
                <td className="text-center">
                  <span className={`badge ${ticket.status === 'Pending' ? 'bg-secondary' : ticket.status === 'Paid' ? 'bg-success' : 'bg-danger'}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="text-center">
                  {ticket.status === 'Pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(ticket._id, 'Paid')} className="btn btn-sm btn-success me-2">Duyệt</button>
                      <button onClick={() => handleUpdateStatus(ticket._id, 'Cancelled')} className="btn btn-sm btn-danger">Hủy</button>
                    </>
                  )}
                  {ticket.status !== 'Pending' && <span className="text-muted">Đã xử lý</span>}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan="6" className="text-center">Chưa có đơn vé nào!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketManagement;