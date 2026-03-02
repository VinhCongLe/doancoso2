const Banner = require('../models/Banner');

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const bannerData = req.body;
    if (req.file) bannerData.image = '/uploads/' + req.file.filename;
    const newBanner = new Banner(bannerData);
    await newBanner.save();
    res.status(201).json({ success: true, message: 'Thêm banner thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa banner!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};