const cron = require('node-cron');
const Reservation = require('../models/Reservation');
const Event = require('../models/Event');

// Chạy mỗi 1 phút
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        // Tìm các bản ghi đã hết hạn
        const expiredReservations = await Reservation.find({ expiresAt: { $lt: now } });

        if (expiredReservations.length > 0) {
            console.log(`🕒 Tìm thấy ${expiredReservations.length} bản giữ vé hết hạn. Đang hoàn lại vé...`);

            for (const resv of expiredReservations) {
                // Hoàn lại số lượng vé cho sự kiện
                await Event.findByIdAndUpdate(resv.eventId, {
                    $inc: { availableTickets: resv.quantity }
                });

                // Xóa bản giữ vé
                await Reservation.findByIdAndDelete(resv._id);
            }
            console.log(`✅ Đã hoàn lại vé cho ${expiredReservations.length} đơn giữ vé.`);
        }
    } catch (error) {
        console.error("❌ Lỗi trong Reservation Cron Job:", error);
    }
});

console.log("🚀 Background Job: Kiểm tra hết hạn giữ vé đã được kích hoạt.");
