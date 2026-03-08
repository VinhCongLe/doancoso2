import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

/* ─── Styles ─────────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    paddingBottom: '4rem',
  },
  container: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '2.5rem 1rem',
  },
  badgeRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '99px',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 900,
    color: 'var(--text-primary)',
    margin: '0 0 0.4rem',
  },
  pageSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    margin: '1.75rem 0 2rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '1rem',
    textAlign: 'center',
  },
  statIcon: { fontSize: '1.4rem', marginBottom: '0.25rem' },
  statValue: { fontSize: '1.8rem', fontWeight: 900, color: '#fff', lineHeight: 1 },
  statLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.35)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '0.3rem',
  },

  // ── Ticket Card ──
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    borderRadius: '18px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.09)',
    background: 'linear-gradient(135deg, #1a1f35 0%, #0f1422 100%)',
    boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
    marginBottom: '1.25rem',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
    cursor: 'default',
  },
  accentBar: (paid) => ({
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    background: paid
      ? 'linear-gradient(to bottom, #34d399, #0d9488)'
      : 'linear-gradient(to bottom, #fbbf24, #f97316)',
  }),
  cardLeft: {
    flex: 1,
    padding: '1.5rem 1.5rem 1.5rem 1.75rem',
    minWidth: 0,
  },
  ticketId: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.2)',
    fontFamily: 'monospace',
    marginBottom: '0.5rem',
  },
  statusBadge: (paid) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.2rem 0.65rem',
    borderRadius: '99px',
    fontSize: '0.65rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.75rem',
    background: paid ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
    border: paid ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(251,191,36,0.3)',
    color: paid ? '#6ee7b7' : '#fcd34d',
  }),
  checkedInBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.2rem 0.65rem',
    borderRadius: '99px',
    fontSize: '0.65rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.75rem',
    marginLeft: '0.5rem',
    background: 'rgba(56,189,248,0.12)',
    border: '1px solid rgba(56,189,248,0.3)',
    color: '#7dd3fc',
  },
  eventName: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 1rem',
    lineHeight: 1.3,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.5rem',
  },
  infoIcon: { fontSize: '0.95rem', width: '20px', textAlign: 'center', flexShrink: 0 },
  infoLabel: {
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.35)',
    fontWeight: 600,
    width: '90px',
    flexShrink: 0,
  },
  infoValue: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1rem 0',
    gap: 0,
  },
  hole: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#090d1a',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  dashedLine: {
    flex: 1,
    borderTop: '1px dashed rgba(255,255,255,0.12)',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: '0.68rem',
    color: 'rgba(255,255,255,0.35)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  priceValue: {
    fontSize: '1.4rem',
    fontWeight: 900,
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  // ── Vertical sep ──
  vertSep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.75rem 0',
  },
  vertHole: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#090d1a',
    border: '1px solid rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  vertLine: {
    flex: 1,
    width: '1px',
    borderLeft: '1px dashed rgba(255,255,255,0.12)',
  },

  // ── QR Section ──
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1.5rem 1.25rem',
    width: '180px',
    flexShrink: 0,
  },
  qrWrap: {
    padding: '8px',
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  qrLabel: {
    textAlign: 'center',
  },
  qrLabelText: {
    margin: 0,
    fontSize: '0.72rem',
    fontWeight: 800,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  qrSubText: {
    margin: '0.2rem 0 0',
    fontSize: '0.63rem',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  qrPending: {
    width: '130px',
    height: '130px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    opacity: 0.4,
  },

  // ── Empty / Loading ──
  centerFlex: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 1rem',
    gap: '1rem',
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
  },
  emptyTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    maxWidth: '280px',
    margin: 0,
  },
  browseBtn: {
    padding: '0.6rem 1.5rem',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
  },
};

/* ─── TicketCard ─────────────────────────────────────────────── */
const TicketCard = ({ ticket }) => {
  const [hovered, setHovered] = useState(false);
  const isPaid = ticket.status === 'success';
  const isCheckedIn = ticket.checkedIn;

  const eventName = ticket.eventName || ticket.eventId?.title || 'Sự kiện không xác định';
  const location = ticket.eventId?.location || '—';
  const startDate = ticket.eventId?.startDate
    ? new Date(ticket.eventId.startDate).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    : '—';

  const cardStyle = {
    ...S.card,
    ...(hovered
      ? { transform: 'translateY(-3px)', boxShadow: '0 12px 40px rgba(99,102,241,0.25)', borderColor: 'rgba(99,102,241,0.35)' }
      : {}),
  };

  return (
    <div style={cardStyle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Left accent bar */}
      <div style={S.accentBar(isPaid)} />

      {/* ── Left: Info ── */}
      <div style={S.cardLeft}>
        {/* ID + badges */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <span style={S.statusBadge(isPaid)}>
            {isPaid ? '✓ Đã thanh toán' : '⏳ Đang xử lý'}
          </span>
          {isCheckedIn && (
            <span style={S.checkedInBadge}>✓ Đã check-in</span>
          )}
          <span style={{ ...S.ticketId, marginBottom: 0, marginLeft: 'auto' }}>
            #{ticket._id?.slice(-8).toUpperCase()}
          </span>
        </div>

        {/* Event name */}
        <h2 style={S.eventName}>{eventName}</h2>

        {/* Info rows */}
        {[
          { icon: '📍', label: 'Địa điểm', value: location },
          { icon: '📅', label: 'Ngày diễn ra', value: startDate },
          { icon: '🎟️', label: 'Số lượng', value: `${ticket.quantity} vé`, highlight: true },
          { icon: '💳', label: 'Thanh toán', value: ticket.paymentMethod || 'Stripe' },
        ].map(({ icon, label, value, highlight }) => (
          <div key={label} style={S.infoRow}>
            <span style={S.infoIcon}>{icon}</span>
            <span style={S.infoLabel}>{label}</span>
            <span style={{ ...S.infoValue, color: highlight ? '#a5b4fc' : S.infoValue.color }}>{value}</span>
          </div>
        ))}

        {/* Dashed divider with holes */}
        <div style={S.divider}>
          <div style={{ ...S.hole, marginLeft: '-1.75rem' }} />
          <div style={S.dashedLine} />
        </div>

        {/* Total price */}
        <div style={S.priceRow}>
          <span style={S.priceLabel}>Tổng tiền</span>
          <span style={S.priceValue}>
            {ticket.totalPrice?.toLocaleString('vi-VN')} <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', WebkitTextFillColor: 'rgba(255,255,255,0.4)' }}>₫</span>
          </span>
        </div>
      </div>

      {/* ── Vertical separator ── */}
      <div style={S.vertSep}>
        <div style={S.vertHole} />
        <div style={S.vertLine} />
        <div style={S.vertHole} />
      </div>

      {/* ── Right: QR Code ── */}
      <div style={S.qrSection}>
        {isPaid ? (
          <>
            <div style={S.qrWrap}>
              <QRCodeSVG value={`TICKET_${ticket._id}`} size={130} level="H" includeMargin={false} />
            </div>
            <div style={S.qrLabel}>
              <p style={S.qrLabelText}>{isCheckedIn ? '✅ Đã sử dụng' : 'Mã vào cổng'}</p>
              <p style={S.qrSubText}>{isCheckedIn ? 'Vé này đã được quét' : 'Xuất trình tại quầy soát vé'}</p>
            </div>
          </>
        ) : (
          <>
            <div style={S.qrPending}>⏳</div>
            <p style={S.qrSubText}>QR hiển thị sau khi thanh toán xong</p>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────── */
const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const paymentStatus = query.get('payment');

    if (paymentStatus === 'success') toast.success('🎉 Thanh toán thành công! Vé đã được lưu.');
    else if (paymentStatus === 'cancel') toast.error('Giao dịch đã bị hủy.');
    else if (paymentStatus === 'failed') toast.error('Giao dịch thất bại. Vui lòng thử lại.');
    else if (paymentStatus === 'error') toast.error('Lỗi khi xử lý thanh toán.');

    if (paymentStatus) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchMyTickets = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const res = await axios.get('http://localhost:5000/api/payment/my-invoices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data.data);
      } catch (error) {
        console.error('Lỗi khi tải hóa đơn:', error);
        toast.error('Không thể tải danh sách vé.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, [navigate]);

  const stats = [
    { icon: '🎟️', label: 'Tổng vé', value: tickets.length },
    { icon: '✅', label: 'Đã thanh toán', value: tickets.filter(t => t.status === 'success').length },
    { icon: '✓', label: 'Đã check-in', value: tickets.filter(t => t.checkedIn).length },
  ];

  return (
    <div style={S.page}>
      <div style={S.container}>

        {/* Header */}
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={S.badgeRow}>🎫 Vé của tôi</span>
          <h1 style={S.pageTitle}>Danh sách vé đã mua</h1>
          <p style={S.pageSubtitle}>Tất cả vé sự kiện bạn đã đặt sẽ hiển thị tại đây</p>
        </div>

        {/* Stats */}
        {tickets.length > 0 && (
          <div style={S.statsGrid}>
            {stats.map(s => (
              <div key={s.label} style={S.statCard}>
                <div style={S.statIcon}>{s.icon}</div>
                <div style={S.statValue}>{s.value}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={S.centerFlex}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '3px solid rgba(99,102,241,0.3)',
              borderTopColor: '#6366f1',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', margin: 0 }}>Đang tải vé của bạn...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : tickets.length === 0 ? (
          <div style={S.centerFlex}>
            <div style={S.emptyIcon}>🎫</div>
            <h3 style={S.emptyTitle}>Chưa có vé nào</h3>
            <p style={S.emptyText}>Bạn chưa mua vé sự kiện nào. Hãy khám phá các sự kiện ngay!</p>
            <button style={S.browseBtn} onClick={() => navigate('/')}>
              Xem sự kiện ngay →
            </button>
          </div>
        ) : (
          <div>
            {tickets.map(ticket => (
              <TicketCard key={ticket._id} ticket={ticket} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyTickets;