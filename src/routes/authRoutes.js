const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register → create new account
router.post('/register', authController.register);

// POST /api/auth/login → authenticate and get JWT
router.post('/login', authController.login);

// POST /api/auth/forgot-password → request password reset token
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password → reset password with token
router.post('/reset-password', authController.resetPassword);

module.exports = router;