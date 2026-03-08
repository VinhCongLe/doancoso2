require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/QuanLySuKienDB')
  .then(() => console.log('🎉 Đã kết nối thành công với MongoDB!'))
  .catch(err => console.error('❌ Lỗi kết nối CSDL:', err));

// Đăng ký Route cho Event
const eventRoutes = require('./src/routes/event.route');
app.use('/api/events', eventRoutes);

// Đăng ký Route cho Category
const categoryRoutes = require('./src/routes/category.route');
app.use('/api/categories', categoryRoutes);

// ĐĂNG KÝ CÁC ROUTES API Ở ĐÂY
const authRoutes = require('./src/routes/auth.route');
const ticketRoutes = require('./src/routes/ticket.route');
const paymentRoutes = require('./src/routes/payment.route');

// BẠN CẦN THÊM 2 DÒNG NÀY ĐỂ KÍCH HOẠT ĐƯỜNG DẪN:
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payment', paymentRoutes);

// Cho phép truy cập thư mục 'uploads' để lấy ảnh sự kiện
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', require('./src/routes/user.route'));
app.use('/api/ai', require('./src/routes/ai.route'));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy tại http://localhost:${PORT}`);
});