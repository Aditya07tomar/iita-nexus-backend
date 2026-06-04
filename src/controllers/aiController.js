const aiService = require('../services/aiService');
const db = require('../config/db');

/**
 * POST /api/ai/chat
 * Handles AI chat requests from the frontend.
 * Saves conversation to chat_history if user is authenticated.
 */
exports.chat = async (req, res) => {
    try {
        // Accept both 'question' and 'message' keys for flexibility
        const question = req.body.question || req.body.message;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({ message: "Please provide a question." });
        }

        const answer = await aiService.askCampusBrain(question);

        // Save to chat history if a valid user token was provided
        const userId = req.user?.id || null;
        if (userId) {
            try {
                await db.execute(
                    'INSERT INTO chat_history (user_id, question, answer) VALUES (?, ?, ?)',
                    [userId, question, answer]
                );
            } catch (saveError) {
                // Don't fail the request if saving history fails
                console.warn("Could not save chat history:", saveError.message);
            }
        }

        res.json({ answer });
    } catch (error) {
        console.error("AI Chat Error:", error.message);
        res.status(500).json({
            message: "AI could not process your request",
            error: error.message
        });
    }
};

/**
 * GET /api/ai/history
 * Fetch all chat history for the logged-in user.
 * Supports optional ?search= query parameter.
 */
exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search } = req.query;

        let query = 'SELECT * FROM chat_history WHERE user_id = ?';
        const params = [userId];

        if (search) {
            query += ' AND (question LIKE ? OR answer LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY created_at DESC LIMIT 100';

        const [history] = await db.execute(query, params);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch history', error: error.message });
    }
};

/**
 * GET /api/ai/history/:id
 * Fetch a single chat entry by ID.
 */
exports.getHistoryById = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM chat_history WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Chat entry not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch entry', error: error.message });
    }
};

/**
 * DELETE /api/ai/history/:id
 * Delete a single chat entry.
 */
exports.deleteHistoryEntry = async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM chat_history WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Chat entry deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete', error: error.message });
    }
};

/**
 * DELETE /api/ai/history
 * Clear all chat history for the logged-in user.
 */
exports.clearHistory = async (req, res) => {
    try {
        await db.execute('DELETE FROM chat_history WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Chat history cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to clear history', error: error.message });
    }
};