const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', feedbackController.getFeedback);
router.get('/stats', feedbackController.getFeedbackStats);
router.post('/', feedbackController.createFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;
