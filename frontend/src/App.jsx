import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

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

function App() {
  // Kiểm tra xem trong máy có lưu User chưa
  const user = JSON.parse(localStorage.getItem('user'));

  // Hàm Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Đá về trang đăng nhập
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 border-bottom border-secondary">
        <div className="container">
          <Link className="navbar-brand text-warning fw-bold" to="/">🎫 TICKET PRO</Link>
          <div className="navbar-nav ms-auto align-items-center">
            <Link className="nav-link" to="/">Trang Chủ</Link>
            
            {/* Nếu đã đăng nhập thì hiện tên và các nút quản lý */}
            {user ? (
              <>
                <Link className="nav-link text-info" to="/my-tickets">Vé của tôi</Link>
               {user.role === 'admin' && (
                    <li className="nav-item dropdown border-start border-secondary ps-3 ms-2">
                      <a className="nav-link dropdown-toggle text-warning fw-bold" href="#" id="adminMenu" role="button" data-bs-toggle="dropdown">
                        ⚙️ Dành cho Admin
                      </a>
                      <ul className="dropdown-menu dropdown-menu-dark shadow">
                        <li><Link className="dropdown-item" to="/admin">📅 Quản lý Sự kiện</Link></li>
                        <li><Link className="dropdown-item" to="/admin/tickets">🎫 Quản lý Đơn vé</Link></li>
                        <li><Link className="dropdown-item" to="/admin/users">👥 Quản lý Tài khoản</Link></li>
                        <li><hr className="dropdown-divider border-secondary" /></li>
                        <li><Link className="dropdown-item" to="/admin/dashboard">📊 Thống kê doanh thu</Link></li>
                        <li><Link className="dropdown-item" to="/admin/banners">🖼️ Quản lý Banner</Link></li>
                      </ul>
                    </li>
                  )}
                <span className="nav-link text-white ms-3">Chào, <strong>{user.name}</strong>!</span>
                <button onClick={handleLogout} className="btn btn-sm btn-danger ms-2">Đăng xuất</button>
              </>
            ) : (
              /* Nếu chưa đăng nhập thì hiện nút Đăng nhập/Đăng ký */
              <>
                <Link className="nav-link btn btn-primary text-white ms-2 px-3" to="/login">Đăng Nhập</Link>
                <Link className="nav-link btn btn-success text-white ms-2 px-3" to="/register">Đăng Ký</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Các trang của Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-event" element={<EventForm />} />
        <Route path="/admin/edit-event/:id" element={<EventForm />} />
        <Route path="/admin/tickets" element={<TicketManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/add-user" element={<UserForm />} />
        <Route path="/admin/edit-user/:id" element={<UserForm />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;