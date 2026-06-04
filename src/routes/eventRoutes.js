const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Anyone logged in can view events
router.get('/', protect, eventController.getEvents);

// Only admins can create/update/delete events
router.post('/', protect, authorize(2), eventController.createEvent);
router.put('/:id', protect, authorize(2), eventController.updateEvent);
router.delete('/:id', protect, authorize(2), eventController.deleteEvent);

module.exports = router;
