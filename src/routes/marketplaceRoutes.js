const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', marketplaceController.getListings);
router.post('/', marketplaceController.createListing);
router.put('/:id', marketplaceController.updateListing);
router.delete('/:id', marketplaceController.deleteListing);

module.exports = router;
