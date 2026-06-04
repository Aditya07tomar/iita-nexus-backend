const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(protect);

// GET /api/notifications → list notifications (?unread=true for unread only)
router.get('/', notificationController.getNotifications);

// GET /api/notifications/count → unread badge count
router.get('/count', notificationController.getUnreadCount);

// PUT /api/notifications/read-all → mark all as read
router.put('/read-all', notificationController.markAllAsRead);

// PUT /api/notifications/:id/read → mark one as read
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
