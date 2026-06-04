const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');

// GET /api/mess/weekly → fetch the full weekly mess menu
router.get('/weekly', messController.getMessMenu);

// PUT /api/mess/update → update a day's menu (admin use)
router.put('/update', messController.updateMessMenu);

module.exports = router;