const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');

// GET /api/placements → fetch all placement drives
router.get('/', placementController.getAllPlacements);

// POST /api/placements/add → create a new placement (admin use)
router.post('/add', placementController.createPlacement);

module.exports = router;