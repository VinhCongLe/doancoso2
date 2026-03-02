const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true }, // Lưu đường dẫn ảnh
  link: { type: String, default: '/' },    // Bấm vào banner sẽ dẫn đi đâu
  active: { type: Boolean, default: true } // Cho phép ẩn/hiện banner
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);