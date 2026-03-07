const Category = require('../models/Category');

// Tạo danh mục mới
exports.createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json({ success: true, data: savedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo danh mục', error: error.message });
  }
};

// Lấy danh sách danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy loại sự kiện' });
    }
    res.status(200).json({ success: true, data: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật', error: error.message });
  }
};

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy loại sự kiện' });
    }
    res.status(200).json({ success: true, message: 'Đã xóa loại sự kiện' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};