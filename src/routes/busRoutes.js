const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');

// GET /api/bus/next → fetch next upcoming buses
router.get('/next', busController.getNextBuses);

module.exports = router;
