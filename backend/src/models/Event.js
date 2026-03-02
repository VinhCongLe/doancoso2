const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  price: { type: Number, default: 0 },
  banner: { type: String, default: '' },
  availableTickets: { type: Number, required: true, default: 100 },


  customDetails: { type: mongoose.Schema.Types.Mixed } 
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);