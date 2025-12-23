const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');

// Define the endpoints
router.get('/', placementController.getAllPlacements);
router.post('/add', placementController.createPlacement);

module.exports = router;