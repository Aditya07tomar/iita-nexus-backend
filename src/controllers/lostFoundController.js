const db = require('../config/db');

/**
 * GET /api/lost-found
 * List all lost & found items. Supports ?type=lost|found and ?status=open
 */
exports.getItems = async (req, res) => {
    try {
        const { type, status, search } = req.query;
        let query = 'SELECT lf.*, u.name as posted_by FROM lost_found lf JOIN users u ON lf.user_id = u.id';
        const conditions = [];
        const params = [];

        if (type) { conditions.push('lf.type = ?'); params.push(type); }
        if (status) { conditions.push('lf.status = ?'); params.push(status); }
        if (search) {
            conditions.push('(lf.title LIKE ? OR lf.description LIKE ?)');
            const s = `%${search}%`;
            params.push(s, s);
        }

        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY lf.created_at DESC';

        const [items] = await db.execute(query, params);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch items', error: error.message });
    }
};

/**
 * POST /api/lost-found
 * Report a lost or found item.
 */
exports.createItem = async (req, res) => {
    try {
        const { type, title, description, location, contact } = req.body;

        if (!type || !title) {
            return res.status(400).json({ message: 'Type and title are required' });
        }

        await db.execute(
            'INSERT INTO lost_found (user_id, type, title, description, location, contact) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, type, title, description || '', location || '', contact || '']
        );

        res.status(201).json({ message: 'Item reported successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create item', error: error.message });
    }
};

/**
 * PUT /api/lost-found/:id/status
 * Update item status (claim/close). Only owner or admin.
 */
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const [rows] = await db.execute('SELECT * FROM lost_found WHERE id = ?', [req.params.id]);

        if (rows.length === 0) return res.status(404).json({ message: 'Item not found' });
        if (rows[0].user_id !== req.user.id && req.user.role !== 2) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await db.execute('UPDATE lost_found SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

/**
 * DELETE /api/lost-found/:id
 * Delete an item. Only owner or admin.
 */
exports.deleteItem = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM lost_found WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Item not found' });
        if (rows[0].user_id !== req.user.id && req.user.role !== 2) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await db.execute('DELETE FROM lost_found WHERE id = ?', [req.params.id]);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
};
