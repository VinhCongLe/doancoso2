import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);

  // Hàm tải danh sách toàn bộ vé (Chỉ Admin mới gọi được)
  // Bọc hàm bằng useCallback để tối ưu hiệu suất và dập tắt lỗi ESLint
  const loadTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // Gọi API lấy toàn bộ hóa đơn (bao gồm cả Stripe/VNPay)
      const res = await axios.get('http://localhost:5000/api/payment/admin/invoices', {
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

  // Helper: badge by status
  const getStatusBadge = (status) => {
    if (status === 'Paid') return 'tp-badge tp-badge-success';
    if (status === 'Pending') return 'tp-badge tp-badge-warning';
    return 'tp-badge tp-badge-danger';
  };

  const getStatusLabel = (status) => {
    if (status === 'Paid') return ' Đã thanh toán';
    if (status === 'Pending') return ' Chờ xác nhận';
    return ' Đã hủy';
  };

  return (
    <div>
      {/* Page header */}
      <div className="tp-page-header">
        <h1 className="tp-page-title">Quản Lý Đơn Đặt Vé</h1>
        <span className="tp-badge tp-badge-muted">
          {tickets.length} đơn
        </span>
      </div>

      {/* Table */}
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Sự kiện</th>
              <th style={{ textAlign: 'center' }}>Số lượng</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Check-in</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.65rem' }}>
                      {ticket.user?.name?.substring(0, 2).toUpperCase() || 'NA'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {ticket.user?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ticket.user?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ticket.event?.title || 'N/A'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="tp-badge tp-badge-primary">{ticket.quantity}</span>
                </td>
                <td>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    {ticket.totalPrice?.toLocaleString()}đ
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {ticket.paymentMethod || 'Manual'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={getStatusBadge(ticket.status)}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {ticket.checkedIn ? (
                    <span className="tp-badge tp-badge-success">✅ Đã vào</span>
                  ) : (
                    <span className="tp-badge tp-badge-muted" style={{ opacity: 0.6 }}>Chưa</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {ticket.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleUpdateStatus(ticket._id, 'Paid')}
                        className="btn-success-tp"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                      >
                        ✅ Duyệt
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(ticket._id, 'Cancelled')}
                        className="btn-danger-tp"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                      >
                        ❌ Hủy
                      </button>
                    </div>
                  )}
                  {ticket.status !== 'Pending' && (
                    <span style={{ color: 'var(--text-disabled)', fontSize: '0.78rem' }}>Đã xử lý</span>
                  )}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan="6">
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <span className="empty-state-icon">🎫</span>
                    <p className="empty-state-text">Chưa có đơn vé nào!</p>
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

export default TicketManagement;