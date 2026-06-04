const db = require('../config/db');

/**
 * GET /api/bookmarks
 * Fetch all bookmarks for the logged-in user. Supports ?item_type=placement
 */
exports.getBookmarks = async (req, res) => {
    try {
        const { item_type } = req.query;
        let query = 'SELECT * FROM bookmarks WHERE user_id = ?';
        const params = [req.user.id];

        if (item_type) {
            query += ' AND item_type = ?';
            params.push(item_type);
        }

        query += ' ORDER BY created_at DESC';
        const [bookmarks] = await db.execute(query, params);
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookmarks', error: error.message });
    }
};

/**
 * POST /api/bookmarks
 * Create a bookmark (placement, material, event, etc.).
 */
exports.createBookmark = async (req, res) => {
    try {
        const { item_type, item_id, status } = req.body;

        if (!item_type || !item_id) {
            return res.status(400).json({ message: 'item_type and item_id are required' });
        }

        await db.execute(
            'INSERT INTO bookmarks (user_id, item_type, item_id, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
            [req.user.id, item_type, item_id, status || 'Saved', status || 'Saved']
        );

        res.status(201).json({ message: 'Bookmark saved' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create bookmark', error: error.message });
    }
};

/**
 * PUT /api/bookmarks/:id
 * Update bookmark status (Interested → Applied → OA Cleared → etc.)
 */
exports.updateBookmark = async (req, res) => {
    try {
        const { status } = req.body;
        await db.execute(
            'UPDATE bookmarks SET status = ? WHERE id = ? AND user_id = ?',
            [status, req.params.id, req.user.id]
        );
        res.json({ message: 'Bookmark updated' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

/**
 * DELETE /api/bookmarks/:id
 * Remove a bookmark.
 */
exports.deleteBookmark = async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM bookmarks WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Bookmark removed' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
};
