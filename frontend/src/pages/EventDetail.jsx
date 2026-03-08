import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/events/${id}`)
      .then(res => setEvent(res.data.data))
      .catch(error => console.error("Lỗi lấy chi tiết sự kiện:", error));
  }, [id]);

  const handleBookTicket = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Bạn cần đăng nhập để đặt vé nhé!");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/payment/stripe/create-checkout',
        { eventId: id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && res.data.checkoutUrl) {
        toast.loading("Đang chuyển hướng sang trang thanh toán...");
        window.location.href = res.data.checkoutUrl;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo thanh toán. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return (
    <div className="tp-loading">
      <span style={{ fontSize: '2rem' }}>⏳</span>
      Đang tải thông tin sự kiện...
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Hero Image */}
      {event.banner && (
        <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
          <img
            src={`http://localhost:5000${event.banner}`}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            width: '90%',
          }}>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: 'rgba(99,102,241,0.25)',
              border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: '99px',
              fontSize: '0.78rem',
              color: 'var(--primary-light)',
              marginBottom: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {event.categoryId?.name || event.category}
            </span>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)', margin: 0 }}>
              {event.title}
            </h1>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="container" style={{ paddingTop: event.banner ? '2rem' : '2rem' }}>
        {/* Page title if no banner */}
        {!event.banner && (
          <div style={{ marginBottom: '2rem' }}>
            <span className="tp-badge tp-badge-primary" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{event.category}</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{event.title}</h1>
          </div>
        )}

        <div className="row g-4">
          {/* Left: Info */}
          <div className="col-lg-8">
            <div className="tp-card">
              <div className="tp-card-body">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem' }}>
                  Thông tin sự kiện
                </h3>

                {/* Info rows */}
                {[
                  { icon: '📍', label: 'Địa điểm', value: event.location },
                  { icon: '📅', label: 'Thời gian', value: new Date(event.startDate).toLocaleString('vi-VN') },
                  { icon: '🏷️', label: 'Danh mục', value: event.category },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '0.9rem 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>{row.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.2rem' }}>
                        {row.label}
                      </div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{row.value}</div>
                    </div>
                  </div>
                ))}

                {/* Description */}
                <div style={{ paddingTop: '1.2rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                    Mô tả sự kiện
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {event.description || 'Chưa có mô tả chi tiết cho sự kiện này.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking card */}
          <div className="col-lg-4">
            <div className="tp-card" style={{ position: 'sticky', top: '80px' }}>
              <div className="tp-card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                  Giá vé
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '1rem' }}>
                  {event.price.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 600 }}>VNĐ</span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Vé còn lại: <strong style={{ color: event.availableTickets < 10 ? '#ef4444' : 'inherit' }}>{event.availableTickets}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button className="btn-ghost-tp" style={{ padding: '0.3rem 0.8rem' }} onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || event.availableTickets === 0}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{quantity}</span>
                  <button className="btn-ghost-tp" style={{ padding: '0.3rem 0.8rem' }} onClick={() => setQuantity(q => Math.min(event.availableTickets, q + 1))} disabled={quantity >= event.availableTickets || event.availableTickets === 0}>+</button>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Tổng: <strong style={{ color: 'var(--accent)', fontSize: '1rem' }}>{(event.price * quantity).toLocaleString()} VNĐ</strong>
                </div>

                <button
                  className="btn-primary-tp"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.85rem', opacity: loading ? 0.7 : 1 }}
                  onClick={handleBookTicket}
                  disabled={event.availableTickets === 0 || loading}
                >
                  {event.availableTickets === 0 ? '🚫 Hết Vé' : loading ? '⏳ Đang xử lý...' : '🎟️ Đặt Vé Ngay'}
                </button>

                <button
                  className="btn-ghost-tp"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
                  onClick={() => navigate('/')}
                >
                  ← Quay lại Trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;