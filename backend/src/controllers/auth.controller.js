const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "DoanQLSK_Secret_Key_2026"; // Khóa bảo mật tạo Token

// Đăng ký (Register)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Kiểm tra email tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Email đã được sử dụng!' });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Lưu user mới
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: 'Đăng ký thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Đăng nhập (Login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Tìm user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Sai mật khẩu!' });

    // Tạo mã Token (Giấy thông hành)
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};