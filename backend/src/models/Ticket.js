const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID người mua
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // ID sự kiện
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

// Tối ưu tra cứu vé
TicketSchema.index({ user: 1 });
TicketSchema.index({ event: 1 });

module.exports = mongoose.model('Ticket', TicketSchema);