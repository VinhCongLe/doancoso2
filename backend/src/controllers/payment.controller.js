const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Event = require('../models/Event');
const Invoice = require('../models/Invoice');
const Reservation = require('../models/Reservation');
const mongoose = require('mongoose');

// ==============================
// 1. TẠO YÊU CẦU GIỮ VÉ (RESERVE)
// ==============================
exports.reserveTickets = async (req, res) => {
    try {
        const { eventId, quantity } = req.body;
        const userId = req.user.id;
        const q = parseInt(quantity);

        // Sử dụng findOneAndUpdate với điều kiện số vé còn lại đủ để đảm bảo tính nguyên tử (Atomic)
        const targetEvent = await Event.findOneAndUpdate(
            { _id: eventId, availableTickets: { $gte: q } },
            { $inc: { availableTickets: -q } },
            { new: true }
        );

        if (!targetEvent) {
            return res.status(400).json({
                success: false,
                message: "Không đủ vé hoặc sự kiện không tồn tại"
            });
        }

        // Tạo bản ghi giữ vé trong 5 phút
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Now + 5 mins
        const reservation = new Reservation({
            userId,
            eventId,
            quantity: q,
            expiresAt
        });

        await reservation.save();

        return res.status(200).json({
            success: true,
            message: "Giữ vé thành công trong 5 phút",
            reservationId: reservation._id,
            expiresAt
        });

    } catch (error) {
        console.error("Reserve Error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi giữ vé",
            error: error.message
        });
    }
};

// ==============================
// CREATE STRIPE CHECKOUT SESSION
// ==============================
exports.createStripeCheckout = async (req, res) => {
    try {
        const { eventId, quantity, reservationId } = req.body;

        if (!reservationId) {
            return res.status(400).json({
                success: false,
                message: "Cần code giữ vé (reservationId) để thanh toán"
            });
        }

        const targetEvent = await Event.findById(eventId);
        if (!targetEvent) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: targetEvent.title,
                        description: targetEvent.description || 'Event Ticket',
                    },
                    unit_amount: targetEvent.price,
                },
                quantity: quantity,
            }],
            mode: 'payment',
            metadata: {
                userId: req.user.id,
                eventId: eventId,
                quantity: quantity,
                reservationId: reservationId.toString()
            },
            success_url: `http://localhost:5000/api/payment/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/event/${eventId}?payment=cancel`,
        });

        return res.status(200).json({
            success: true,
            checkoutUrl: session.url
        });

    } catch (error) {
        console.error("Stripe Error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi tạo thanh toán Stripe",
            error: error.message
        });
    }
};

// ==============================
// STRIPE SUCCESS CALLBACK
// ==============================
exports.stripeSuccess = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.redirect('http://localhost:5173/my-tickets?payment=error');

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const { userId, eventId, quantity, reservationId } = session.metadata;
            const q = parseInt(quantity);

            const targetEvent = await Event.findById(eventId);
            if (targetEvent) {
                const existingInvoice = await Invoice.findOne({ paymentMethod: `Stripe_${session_id}` });

                if (!existingInvoice) {
                    const newInvoice = new Invoice({
                        userId,
                        eventId,
                        eventName: targetEvent.title,
                        quantity: q,
                        totalPrice: session.amount_total,
                        paymentMethod: `Stripe`,
                        status: "success"
                    });
                    await newInvoice.save();

                    // XÓA GIỮ VÉ VÌ ĐÃ THANH TOÁN THÀNH CÔNG
                    if (reservationId) {
                        await Reservation.findByIdAndDelete(reservationId);
                    }

                    // LƯU Ý: Không trừ vé ở đây nữa vì đã trừ lúc Reserve
                }
            }
            return res.redirect('http://localhost:5173/my-tickets?payment=success');
        } else {
            return res.redirect('http://localhost:5173/my-tickets?payment=failed');
        }
    } catch (error) {
        console.error("Stripe Callback Error:", error);
        return res.redirect('http://localhost:5173/my-tickets?payment=error');
    }
};

// ==============================
// GET MY INVOICES
// ==============================
exports.getMyInvoices = async (req, res) => {
    try {
        const invoices = await Invoice
            .find({ userId: req.user.id })
            .populate("eventId", "title startDate location")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ==============================
// GET ALL INVOICES (ADMIN)
// ==============================
exports.getAdminInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate("userId", "name email")
            .populate("eventId", "title startDate location")
            .sort({ createdAt: -1 });

        const formattedInvoices = invoices.map(inv => ({
            _id: inv._id,
            user: inv.userId,
            event: inv.eventId,
            eventName: inv.eventName,
            quantity: inv.quantity,
            totalPrice: inv.totalPrice,
            paymentMethod: inv.paymentMethod,
            status: inv.status === 'success' ? 'Paid' : 'Pending',
            checkedIn: inv.checkedIn,
            createdAt: inv.createdAt
        }));

        return res.status(200).json({
            success: true,
            count: formattedInvoices.length,
            data: formattedInvoices
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ==============================
// ADMIN: CHECK-IN BY QR CODE
// ==============================
exports.checkInTicket = async (req, res) => {
    try {
        const { ticketId } = req.body; // Expected format: TICKET_{invoiceId}

        if (!ticketId) {
            return res.status(400).json({ success: false, message: "Mã QR trống" });
        }

        // Bước 1: Trích xuất invoiceId (bỏ prefix TICKET_)
        const invoiceId = ticketId.replace('TICKET_', '');

        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return res.status(400).json({ success: false, message: "Vé không hợp lệ" });
        }

        // Bước 2: Tìm hóa đơn
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({ success: false, message: "Vé không hợp lệ" });
        }

        // (Bổ sung: Kiểm tra trạng thái thanh toán nếu cần, nhưng user yêu cầu thứ tự cụ thể)
        // Tuy nhiên, logic user yêu cầu:
        // Step 1: find invoice -> Step 2: if not exist -> "Vé không hợp lệ"
        // Step 3: if invoice.checkedIn === true -> return "Vé đã được sử dụng"
        // Step 4: update checkedIn = true

        if (invoice.checkedIn) {
            return res.status(400).json({ success: false, message: "Vé đã được sử dụng" });
        }

        // Cập nhật trạng thái check-in
        invoice.checkedIn = true;
        await invoice.save();

        return res.status(200).json({
            success: true,
            message: "Check-in thành công",
            ticket: {
                eventName: invoice.eventName,
                quantity: invoice.quantity,
                totalPrice: invoice.totalPrice
            }
        });
    } catch (error) {
        console.error("Check-in Error:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

module.exports = {
    ...exports
};
