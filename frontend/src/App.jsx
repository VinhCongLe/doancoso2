import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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

function NavigationBar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Search logic for Navbar
  const navigate = useNavigate();
  const location = useLocation();
  const [navSearch, setNavSearch] = useState('');

  // Sync search input with URL params if any
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setNavSearch(q);
    else if (location.pathname !== '/') setNavSearch('');
  }, [location]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setNavSearch(val);
    if (val.trim()) {
      navigate(`/?q=${encodeURIComponent(val)}`);
    } else {
      navigate('/');
    }
  };

  const clearSearch = () => {
    setNavSearch('');
    navigate('/');
  };

  // Hàm Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Đá về trang đăng nhập
  };

  // Lấy chữ cái đầu tên để làm avatar
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

  return (
    <nav className="tp-navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Brand Logo & Search Bar Group */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className="tp-brand">🎫 TICKET PRO</Link>

          {/* ── Navbar Search ── */}
          <div className="nav-search-container hidden md:flex">
            <svg className="nav-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="nav-search-input"
              placeholder="Tìm sự kiện..."
              value={navSearch}
              onChange={handleSearchChange}
            />
            {navSearch && (
              <button className="nav-search-clear" onClick={clearSearch}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <ul className="tp-nav-links" style={{ display: 'flex', alignItems: 'center', margin: 0 }}>


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
  );
}

function App() {
  return (
    <Router>
      <NavigationBar />
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