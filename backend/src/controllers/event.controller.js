const Event = require('../models/Event');

// ==========================================
// API 1: Tạo sự kiện mới (POST) - ĐÃ TÍCH HỢP UPLOAD ẢNH
exports.createEvent = async (req, res) => {
  try {
    // 1. Lấy dữ liệu chữ (text) từ form
    const eventData = req.body;

    // 2. Kiểm tra xem có file ảnh được upload lên không
    if (req.file) {
      // Nếu có, tạo đường dẫn và thêm vào trường 'banner'
      eventData.banner = '/uploads/' + req.file.filename;
    }

    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Tạo sự kiện thành công!',
      data: savedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo sự kiện',
      error: error.message
    });
  }
};

// ==========================================
// API 2: Lấy danh sách tất cả sự kiện (GET)
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sự kiện',
      error: error.message
    });
  }
};

// ==========================================
// API 3: Lấy chi tiết 1 sự kiện theo ID (GET)
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('categoryId', 'name');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện này' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// ==========================================
// API 4: Cập nhật sự kiện (PUT) - ĐÃ TÍCH HỢP ĐỔI ẢNH MỚI
exports.updateEvent = async (req, res) => {
  try {
    const updateData = req.body;

    // Nếu Admin có chọn tải lên 1 bức ảnh mới để thay thế ảnh cũ
    if (req.file) {
      updateData.banner = '/uploads/' + req.file.filename;
    }

    // { new: true } giúp trả về dữ liệu mới sau khi đã cập nhật xong
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện để cập nhật' });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công!',
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật', error: error.message });
  }
};

// ==========================================
// API 5: Xóa sự kiện (DELETE)
exports.deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện để xóa' });
    }

    // Lưu ý: Ở một hệ thống lớn thực tế, người ta sẽ viết thêm hàm fs.unlinkSync() ở đây 
    // để xóa luôn cái file ảnh trong thư mục /uploads cho đỡ nặng ổ cứng. 
    // Nhưng với đồ án này, giữ thế này là đủ xài rồi!

    res.status(200).json({
      success: true,
      message: 'Đã xóa sự kiện thành công!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa', error: error.message });
  }
};