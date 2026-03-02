const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// 1. DÀNH CHO KHÁCH: Đặt vé
exports.bookTicket = async (req, res) => {
  try {
    const { event, quantity, totalPrice } = req.body;
    const targetEvent = await Event.findById(event);
    if (!targetEvent) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện!' });
    
    if (targetEvent.availableTickets < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Rất tiếc! Sự kiện này chỉ còn ${targetEvent.availableTickets} vé.` 
      });
    }

    const newTicket = new Ticket({
      user: req.user.id,
      event: event,
      quantity: quantity,
      totalPrice: totalPrice,
      status: 'Pending'
    });
    const savedTicket = await newTicket.save();

    targetEvent.availableTickets -= quantity;
    await targetEvent.save();

    res.status(201).json({ success: true, message: 'Đặt vé thành công!', data: savedTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. DÀNH CHO KHÁCH: Lấy danh sách vé cá nhân
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate('event', 'title startDate location');
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. DÀNH CHO ADMIN: Lấy tất cả vé
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('user', 'name email')
      .populate('event', 'title startDate location');
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. DÀNH CHO ADMIN: Cập nhật trạng thái vé
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!updatedTicket) return res.status(404).json({ success: false, message: 'Không tìm thấy vé!' });
    res.status(200).json({ success: true, message: 'Đã cập nhật trạng thái vé!', data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}; // Đóng ngoặc đúng tại đây

// 5. DÀNH CHO BIỂU ĐỒ: Thống kê doanh thu (Đã tách ra ngoài)
exports.getStats = async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      { $match: { status: 'Paid' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalPrice" },
          totalTickets: { $sum: "$quantity" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};