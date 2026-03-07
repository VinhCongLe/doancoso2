import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Import các trang
import Home from './pages/Home';
import AdminDashboard from './pages/Admin/AdminDashboard';
import EventForm from './pages/Admin/EventForm';
import EventDetail from './pages/EventDetail';
import MyTickets from './pages/MyTickets';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import TicketManagement from './pages/Admin/TicketManagement';
import UserManagement from './pages/Admin/UserManagement';
import UserForm from './pages/Admin/UserForm';
import Dashboard from './pages/Admin/Dashboard';
import AdminLayout from './components/AdminLayout';
import CheckIn from './pages/Admin/CheckIn';
import CategoryManagement from './pages/Admin/CategoryManagement';
import ChatWidget from './components/ChatWidget';

function App() {
  // Kiểm tra xem trong máy có lưu User chưa
  const user = JSON.parse(localStorage.getItem('user'));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Hàm Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Đá về trang đăng nhập
  };

  // Lấy chữ cái đầu tên để làm avatar
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

  return (
    <Router>
      {/* ─── TOP NAVBAR ─── */}
      <nav className="tp-navbar">
        <div className="container">
          {/* Brand Logo */}
          <Link to="/" className="tp-brand">🎫 TICKET PRO</Link>

          {/* Nav Links */}
          <ul className="tp-nav-links">
            <li>
              <Link className="tp-nav-link" to="/">Trang Chủ</Link>
            </li>

            {user ? (
              <>
                {/* Vé của tôi */}
                <li>
                  <Link className="tp-nav-link" to="/my-tickets">🎟️ Vé của tôi</Link>
                </li>

                {/* Admin Dropdown */}
                {user.role === 'admin' && (
                  <li
                    className={`tp-dropdown ${dropdownOpen ? 'open' : ''}`}
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <button className="tp-admin-toggle">
                      ⚙️ Admin <span style={{ fontSize: '0.7rem' }}>▾</span>
                    </button>
                    <div className="tp-dropdown-menu">
                      <Link className="tp-dropdown-item" to="/admin" onClick={() => setDropdownOpen(false)}>
                        Quản lý Sự kiện
                      </Link>
                      <Link className="tp-dropdown-item" to="/admin/tickets" onClick={() => setDropdownOpen(false)}>
                        Quản lý Đơn vé
                      </Link>
                      <Link className="tp-dropdown-item" to="/admin/users" onClick={() => setDropdownOpen(false)}>
                        Quản lý Tài khoản
                      </Link>
                      <Link className="tp-dropdown-item" to="/admin/categories" onClick={() => setDropdownOpen(false)}>
                        Quản lý loại sự kiện
                      </Link>
                      <div className="tp-dropdown-divider" />
                      <Link className="tp-dropdown-item" to="/admin/dashboard" onClick={() => setDropdownOpen(false)}>
                        Thống kê doanh thu
                      </Link>
                      <Link className="tp-dropdown-item" to="/admin/checkin" onClick={() => setDropdownOpen(false)}>
                        Quét mã Check-in
                      </Link>
                    </div>
                  </li>
                )}

                {/* User chip with avatar */}
                <li>
                  <span className="tp-user-chip">
                    <span className="tp-avatar">{getInitials(user.name)}</span>
                    Chào, <strong>{user.name}</strong>
                  </span>
                </li>

                {/* Logout */}
                <li>
                  <button onClick={handleLogout} className="btn-danger-tp" style={{ fontSize: '0.82rem' }}>
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              /* Nếu chưa đăng nhập thì hiện nút Đăng nhập/Đăng ký */
              <>
                <li>
                  <Link className="btn-login-tp" to="/login">Đăng Nhập</Link>
                </li>
                <li>
                  <Link className="btn-register-tp" to="/register">Đăng Ký</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Các trang của Admin — wrapped trong AdminLayout */}
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/add-event" element={<AdminLayout><EventForm /></AdminLayout>} />
        <Route path="/admin/edit-event/:id" element={<AdminLayout><EventForm /></AdminLayout>} />
        <Route path="/admin/tickets" element={<AdminLayout><TicketManagement /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
        <Route path="/admin/add-user" element={<AdminLayout><UserForm /></AdminLayout>} />
        <Route path="/admin/edit-user/:id" element={<AdminLayout><UserForm /></AdminLayout>} />
        <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/checkin" element={<AdminLayout><CheckIn /></AdminLayout>} />
        <Route path="/admin/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
      </Routes>
      <ChatWidget />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontSize: '0.9rem',
            fontWeight: 500
          }
        }}
      />
    </Router >
  );
}

export default App;