const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  price: { type: Number, default: 0 },
  banner: { type: String, default: '' },
  availableTickets: { type: Number, required: true, default: 100 },
  description: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },

  customDetails: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Tối ưu hiệu năng truy vấn
EventSchema.index({ categoryId: 1 });
EventSchema.index({ startDate: 1 });

module.exports = mongoose.model('Event', EventSchema);