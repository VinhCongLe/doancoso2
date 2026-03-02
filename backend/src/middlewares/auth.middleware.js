const jwt = require('jsonwebtoken');
const SECRET_KEY = "DoanQLSK_Secret_Key_2026";

// 1. Chốt chặn kiểm tra xem đã Đăng nhập chưa (Có Token không?)
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ success: false, message: 'Từ chối truy cập. Bạn chưa đăng nhập!' });

  try {
    // Tách chữ "Bearer " ra khỏi chuỗi token
    const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
    req.user = decoded; // Gắn thông tin user vào request để dùng sau
    next(); // Cho phép đi tiếp
  } catch (error) {
    res.status(400).json({ success: false, message: 'Token không hợp lệ!' });
  }
};

// 2. Chốt chặn kiểm tra xem có phải Admin không?
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Báo động: Yêu cầu quyền Admin!' });
  }
  next(); // Là Admin thì cho đi tiếp
};