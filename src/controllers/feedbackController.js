const db = require('../config/db');

/**
 * GET /api/feedback
 * List feedback. Students see own feedback, admins see all.
 */
exports.getFeedback = async (req, res) => {
    try {
        const isAdmin = req.user.role === 2;
        const { category } = req.query;

        let query = 'SELECT f.*, u.name as author FROM feedback f JOIN users u ON f.user_id = u.id';
        const conditions = [];
        const params = [];

        if (!isAdmin) {
            conditions.push('f.user_id = ?');
            params.push(req.user.id);
        }

        if (category) {
            conditions.push('f.category = ?');
            params.push(category);
        }

        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY f.created_at DESC';

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
    }
};

/**
 * POST /api/feedback
 * Submit new feedback.
 */
exports.createFeedback = async (req, res) => {
    try {
        const { category, title, message, rating } = req.body;

        if (!category || !title || !message) {
            return res.status(400).json({ message: 'Category, title, and message are required' });
        }

        await db.execute(
            'INSERT INTO feedback (user_id, category, title, message, rating) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, category, title, message, rating || 0]
        );

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
    }
};

/**
 * DELETE /api/feedback/:id
 * Delete feedback. Admin only.
 */
exports.deleteFeedback = async (req, res) => {
    try {
        if (req.user.role !== 2) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        await db.execute('DELETE FROM feedback WHERE id = ?', [req.params.id]);
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
};

/**
 * GET /api/feedback/stats
 * Aggregated feedback stats for admin. Grouped by category with avg rating.
 */
exports.getFeedbackStats = async (req, res) => {
    try {
        if (req.user.role !== 2) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const [stats] = await db.execute(
            `SELECT category, COUNT(*) as count, ROUND(AVG(rating), 1) as avg_rating 
             FROM feedback GROUP BY category ORDER BY count DESC`
        );
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get stats', error: error.message });
    }
};
