const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

/**
 * Middleware: Optionally extract user from token.
 * Unlike 'protect', this does NOT block unauthenticated requests.
 */
const extractUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            const token = authHeader.split(' ')[1];
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            req.user = null;
        }
    }
    next();
};

// POST /api/ai/chat → send a question to CampusFlow AI
router.post('/chat', extractUser, aiController.chat);

// Chat history routes (all require login)
// GET    /api/ai/history     → list all chat history (?search=term)
// GET    /api/ai/history/:id → get single chat entry
// DELETE /api/ai/history/:id → delete single chat entry
// DELETE /api/ai/history     → clear all chat history
router.get('/history', protect, aiController.getHistory);
router.delete('/history', protect, aiController.clearHistory);
router.get('/history/:id', protect, aiController.getHistoryById);
router.delete('/history/:id', protect, aiController.deleteHistoryEntry);

module.exports = router;