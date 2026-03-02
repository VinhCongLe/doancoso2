import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin', icon: '📅', label: 'Quản lý sự kiện' },
    { path: '/admin/tickets', icon: '🎫', label: 'Quản lý vé' },
    { path: '/admin/users', icon: '👥', label: 'Quản lý user' },
    { path: '/admin/banners', icon: '🖼️', label: 'Quản lý banner' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
      {/* --- SIDEBAR TRÁI --- */}
      <div className="bg-dark border-end border-secondary shadow" style={{ width: '260px', position: 'sticky', top: 0, height: '100vh' }}>
        <div className="p-4 border-bottom border-secondary mb-3">
          <Link to="/" className="text-decoration-none">
            <h4 className="text-warning fw-bold mb-0">🎫 TICKET PRO</h4>
            <small className="text-muted">Admin Panel</small>
          </Link>
        </div>

        <div className="nav flex-column nav-pills px-3 gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link text-white d-flex align-items-center gap-3 py-3 px-3 rounded-3 transition-all ${
                location.pathname === item.path ? 'bg-warning text-dark fw-bold shadow' : 'hover-bg-dark'
              }`}
            >
              <span className="fs-5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <hr className="border-secondary mt-4" />
          
          <button 
            onClick={handleLogout}
            className="nav-link text-danger d-flex align-items-center gap-3 py-3 px-3 rounded-3 border-0 bg-transparent hover-bg-danger"
          >
            <span className="fs-5">🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* --- NỘI DUNG BÊN PHẢI --- */}
      <div className="flex-grow-1 p-4 overflow-auto">
        <div className="container-fluid">
          {children}
        </div>
      </div>

      <style>{`
        .hover-bg-dark:hover { background-color: #2c2c2c; }
        .hover-bg-danger:hover { background-color: rgba(220, 53, 69, 0.1); }
        .transition-all { transition: all 0.2s ease-in-out; }
        .nav-link { color: #adb5bd !important; }
        .nav-link.bg-warning { color: #000 !important; }
      `}</style>
    </div>
  );
};

export default AdminLayout;