const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID người mua
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // ID sự kiện
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);