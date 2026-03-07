const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    eventName: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, default: "Stripe" },
    status: { type: String, default: "success" },
    checkedIn: { type: Boolean, default: false }
}, { timestamps: true });

// Tối ưu hiệu năng cho thống kê Dashboard và tra cứu của User
InvoiceSchema.index({ userId: 1 });
InvoiceSchema.index({ eventId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
