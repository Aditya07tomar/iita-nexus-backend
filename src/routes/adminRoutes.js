const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require: login + role_id 2 (admin)
router.use(protect);
router.use(authorize(2));

// ── Analytics ──
router.get('/analytics', adminController.getAnalytics);

// ── Users ──
router.get('/users', adminController.getUsers);

// ── Placements ──
router.post('/placements', adminController.createPlacement);
router.put('/placements/:id', adminController.updatePlacement);
router.delete('/placements/:id', adminController.deletePlacement);

// ── Announcements ──
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// ── Mess Menu ──
router.put('/mess/:id', adminController.updateMessMenu);

// ── Material Moderation ──
router.delete('/materials/:id', adminController.deleteMaterial);

module.exports = router;
