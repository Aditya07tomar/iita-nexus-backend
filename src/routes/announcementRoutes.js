const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Anyone logged in can view
router.get('/', protect, getAnnouncements);

// ONLY ADMINS (Role 2) can post
router.post('/', protect, authorize(2), createAnnouncement);

module.exports = router;