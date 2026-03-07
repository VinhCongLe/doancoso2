const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Route Chatbot AI (Gemini)
router.post('/chat', aiController.chat);

module.exports = router;
