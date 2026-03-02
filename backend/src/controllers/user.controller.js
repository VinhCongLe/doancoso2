const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu

// 1. Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Lấy chi tiết 1 người dùng để đưa lên form Sửa
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Thêm tài khoản mới (Admin cấp)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Kiểm tra email trùng
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Email này đã được sử dụng!' });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    
    res.status(201).json({ success: true, message: 'Tạo tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Sửa thông tin tài khoản
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    let updateData = { name, email, role };

    // Nếu Admin có nhập mật khẩu mới thì mới mã hóa và cập nhật, không thì giữ nguyên mk cũ
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.status(200).json({ success: true, message: 'Cập nhật thành công!', data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Xóa tài khoản
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
    res.status(200).json({ success: true, message: 'Đã xóa tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};