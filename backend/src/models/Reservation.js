const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Tự động xóa sau khi hết hạn (TTL Index) 
        // Tuy nhiên, chúng ta vẫn dùng Cron để hoàn lại vé trước khi xóa
    }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
