const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', lostFoundController.getItems);
router.post('/', lostFoundController.createItem);
router.put('/:id/status', lostFoundController.updateStatus);
router.delete('/:id', lostFoundController.deleteItem);

module.exports = router;
