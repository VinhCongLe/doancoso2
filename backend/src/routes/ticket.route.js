const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Tuyến đường cho Khách hàng (User)
router.post('/', verifyToken, ticketController.bookTicket);
router.get('/my-tickets', verifyToken, ticketController.getMyTickets);

// Tuyến đường cho Quản trị viên (Admin)
router.get('/stats', verifyToken, isAdmin, ticketController.getStats);
router.get('/', verifyToken, isAdmin, ticketController.getAllTickets);
router.put('/:id/status', verifyToken, isAdmin, ticketController.updateTicketStatus);

module.exports = router;