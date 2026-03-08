const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Event = require('../models/Event');
const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');

// ==============================
// CREATE STRIPE CHECKOUT SESSION
// (Không cần giữ vé trước - trừ vé sau khi thanh toán thành công)
// ==============================
exports.createStripeCheckout = async (req, res) => {
    try {
        const { eventId, quantity } = req.body;
        const userId = req.user.id;
        const q = parseInt(quantity);

        if (!eventId || !q || q < 1) {
            return res.status(400).json({
                success: false,
                message: "eventId và quantity là bắt buộc"
            });
        }

        const targetEvent = await Event.findById(eventId);
        if (!targetEvent) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sự kiện" });
        }

        // Kiểm tra vé còn đủ không (chỉ kiểm tra, chưa trừ)
        if (targetEvent.availableTickets < q) {
            return res.status(400).json({
                success: false,
                message: `Không đủ vé. Chỉ còn ${targetEvent.availableTickets} vé.`
            });
        }

        // VND là zero-decimal currency, unit_amount phải là số nguyên
        const unitAmount = Math.round(targetEvent.price);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: targetEvent.title,
                        description: targetEvent.description || 'Vé sự kiện',
                    },
                    unit_amount: unitAmount,
                },
                quantity: q,
            }],
            mode: 'payment',
            metadata: {
                userId: userId.toString(),
                eventId: eventId.toString(),
                quantity: q.toString(),
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
// Trừ vé + lưu Invoice tại đây sau khi thanh toán thành công
// ==============================
exports.stripeSuccess = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.redirect('http://localhost:5173/my-tickets?payment=error');

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const { userId, eventId, quantity } = session.metadata;
            const q = parseInt(quantity);

            // Kiểm tra hóa đơn đã tồn tại chưa (tránh xử lý trùng lặp)
            const existingInvoice = await Invoice.findOne({ stripeSessionId: session_id });

            if (!existingInvoice) {
                // Atomic: trừ vé và kiểm tra đủ vé trong một bước
                const targetEvent = await Event.findOneAndUpdate(
                    { _id: eventId, availableTickets: { $gte: q } },
                    { $inc: { availableTickets: -q } },
                    { new: true }
                );

                if (!targetEvent) {
                    console.error(`Stripe Success: Không đủ vé cho sự kiện ${eventId}`);
                    return res.redirect('http://localhost:5173/my-tickets?payment=failed');
                }

                const newInvoice = new Invoice({
                    userId,
                    eventId,
                    eventName: targetEvent.title,
                    quantity: q,
                    totalPrice: session.amount_total,
                    paymentMethod: 'Stripe',
                    stripeSessionId: session_id,
                    status: 'success'
                });
                await newInvoice.save();
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

        const invoiceId = ticketId.replace('TICKET_', '');

        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return res.status(400).json({ success: false, message: "Vé không hợp lệ" });
        }

        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({ success: false, message: "Vé không hợp lệ" });
        }

        if (invoice.checkedIn) {
            return res.status(400).json({ success: false, message: "Vé đã được sử dụng" });
        }

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
