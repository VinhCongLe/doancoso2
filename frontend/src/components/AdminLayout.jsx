import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', icon: '', label: 'Dashboard' },
    { path: '/admin', icon: '', label: 'Quản lý sự kiện' },
    { path: '/admin/tickets', icon: '', label: 'Quản lý vé' },
    { path: '/admin/users', icon: '', label: 'Quản lý user' },
    { path: '/admin/categories', icon: '', label: 'Quản lý loại sự kiện' },
    { path: '/admin/checkin', icon: '', label: 'Quét mã Check-in' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const isActive = (path) => {
    // Exact match for /admin, prefix match for others
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="tp-admin-layout">
      {/* ─── SIDEBAR ─── */}
      <aside className="tp-sidebar">
        {/* Logo area */}
        <Link to="/" className="tp-sidebar-brand" style={{ textDecoration: 'none' }}>
          <span className="tp-sidebar-logo">🎫 TICKET PRO</span>
          <span className="tp-sidebar-sub">Admin Panel</span>
        </Link>

        {/* Navigation */}
        <nav className="tp-sidebar-nav">
          <span className="tp-sidebar-label">Quản lý</span>

          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`tp-sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.icon && <span className="tp-sidebar-icon">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout at bottom */}
        <div className="tp-sidebar-logout">
          <button onClick={handleLogout} className="tp-sidebar-logout-btn">
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="tp-admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;