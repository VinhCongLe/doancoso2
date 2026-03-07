const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Tuyến đường xử lý giữ vé (Mới)
router.post('/reserve', verifyToken, paymentController.reserveTickets);

// Tuyến đường xử lý thanh toán Stripe
router.post('/stripe/create-checkout', verifyToken, paymentController.createStripeCheckout);

// Tuyến đường Stripe trả kết quả về (Không cần verifyToken vì Stripe gọi sau khi redirect)
router.get('/stripe/success', paymentController.stripeSuccess);

// Tuyến đường lấy lịch sử hóa đơn của user
router.get('/my-invoices', verifyToken, paymentController.getMyInvoices);

// Tuyến đường lấy TOÀN BỘ hóa đơn (Admin)
router.get('/admin/invoices', verifyToken, isAdmin, paymentController.getAdminInvoices);

// Tuyến đường Check-in (Mới)
router.post('/checkin', verifyToken, isAdmin, paymentController.checkInTicket);

module.exports = router;
