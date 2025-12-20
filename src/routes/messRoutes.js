const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');
const { protect } = require('../middleware/authMiddleware');

// Route: GET /api/mess/today
// We use 'protect' so only logged-in students can see the menu
router.get('/today', protect, messController.getTodayMenu);

module.exports = router;