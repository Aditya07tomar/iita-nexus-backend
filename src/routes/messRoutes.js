const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');

// Check line 8 - make sure the function name matches the controller exactly
router.get('/', messController.getMessMenu); 
router.put('/update', messController.updateMessMenu);

module.exports = router;