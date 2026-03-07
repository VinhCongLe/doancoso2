import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ktra kết quả thanh toán từ URL Query Params
    const query = new URLSearchParams(location.search);
    const paymentStatus = query.get('payment');
    const vnpayStatus = query.get('vnpay'); // Để tương thích ngược nếu cần

    if (paymentStatus === 'success' || vnpayStatus === 'success') toast.success("Thanh toán thành công! Hóa đơn đã được lưu.");
    else if (paymentStatus === 'cancel') toast.error("Giao dịch đã bị hủy.");
    else if (paymentStatus === 'failed' || vnpayStatus === 'failed') toast.error("Giao dịch thất bại.");
    else if (paymentStatus === 'error' || vnpayStatus === 'error') toast.error("Lỗi khi xử lý thanh toán.");

    // Nếu có query thì reload lại URL cho sạch
    if (paymentStatus || vnpayStatus) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchMyTickets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Bạn cần đăng nhập để xem vé!");
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/payment/my-invoices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách hóa đơn:", error);
      }
    };

    fetchMyTickets();
  }, [navigate]);

  // Helper: badge class by status (Invoice)
  const getStatusBadge = (status) => {
    if (status === 'success') return 'tp-badge tp-badge-success';
    return 'tp-badge tp-badge-warning';
  };

  const getStatusBarClass = (status) => {
    if (status === 'success') return 'paid';
    return 'pending';
  };

  const getStatusLabel = (status) => {
    if (status === 'success') return '✅ Đã thanh toán (Stripe)';
    return '⏳ Đang xử lý';
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="section-title">Vé Sự Kiện Của Tôi</h1>
          <p className="section-subtitle">Quản lý tất cả các vé bạn đã đặt</p>
        </div>

        {tickets.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🎫</span>
            <p className="empty-state-text">Bạn chưa đặt mua vé nào.</p>
          </div>
        ) : (
          <div className="row g-4">
            {tickets.map(ticket => (
              <div className="col-md-6" key={ticket._id}>
                <div className="ticket-card">
                  {/* Status color bar at the top */}
                  <div className={`ticket-status-bar ${getStatusBarClass(ticket.status)}`} />

                  <div className="ticket-card-inner">
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                        flex: 1,
                        paddingRight: '1rem',
                      }}>
                        {ticket.eventName || ticket.eventId?.title || 'Sự kiện đã bị xóa'}
                      </h4>
                      <span className={getStatusBadge(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1rem' }} />

                    {/* Info rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span>📍</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{ticket.eventId?.location || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span>📅</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {ticket.eventId?.startDate
                            ? new Date(ticket.eventId.startDate).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span>🎟️</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Số lượng: <strong style={{ color: 'var(--text-primary)' }}>{ticket.quantity} vé</strong></span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span>💳</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Hình thức: <strong style={{ color: 'var(--text-primary)' }}>{ticket.paymentMethod}</strong></span>
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Tổng tiền
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
                        {ticket.totalPrice.toLocaleString()} VNĐ
                      </span>
                    </div>

                    {/* QR Code Section (New for Phase 15) */}
                    {ticket.status === 'success' && (
                      <div style={{
                        marginTop: '1.2rem',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem',
                        border: '1px dashed var(--border)'
                      }}>
                        <div style={{ padding: '8px', background: 'white', borderRadius: '8px' }}>
                          <QRCodeSVG
                            value={`TICKET_${ticket._id}`}
                            size={140}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            MÃ VÉ VÀO CỔNG
                          </p>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {ticket.checkedIn ? '✅ Đã Check-in' : 'Trình mã này tại quầy soát vé'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;