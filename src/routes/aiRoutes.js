const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
// const { protect } = require('../middleware/authMiddleware'); // Uncomment if using JWT

// If you want the AI to be public for now, remove 'protect'
router.post('/chat', aiController.chat);

module.exports = router;