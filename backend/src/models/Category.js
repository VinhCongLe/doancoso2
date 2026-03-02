const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Tên danh mục (VD: Âm nhạc)
  description: { type: String } // Mô tả thêm
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);