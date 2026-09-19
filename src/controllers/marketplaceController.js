const db = require('../config/db');

/**
 * GET /api/marketplace
 * List all marketplace listings. Supports ?category=&status=available&search=
 */
exports.getListings = async (req, res) => {
    try {
        const { category, status, search } = req.query;
        let query = 'SELECT m.*, u.name as seller_name FROM marketplace m JOIN users u ON m.user_id = u.id';
        const conditions = [];
        const params = [];

        if (category) { conditions.push('m.category = ?'); params.push(category); }
        if (status && status !== 'all') { conditions.push('m.status = ?'); params.push(status); }
        else if (!status) { conditions.push("m.status = 'available'"); } // Default: show only available (unless 'all' requested)
        if (search) {
            conditions.push('(m.title LIKE ? OR m.description LIKE ?)');
            const s = `%${search}%`;
            params.push(s, s);
        }

        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY m.created_at DESC';

        const [listings] = await db.execute(query, params);
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch listings', error: error.message });
    }
};

/**
 * POST /api/marketplace
 * Create a new listing.
 */
exports.createListing = async (req, res) => {
    try {
        const { title, description, price, category, contact } = req.body;

        if (!title || !price) {
            return res.status(400).json({ message: 'Title and price are required' });
        }

        await db.execute(
            'INSERT INTO marketplace (user_id, title, description, price, category, contact) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, title, description || '', price, category || 'Other', contact || '']
        );

        res.status(201).json({ message: 'Listing created' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create listing', error: error.message });
    }
};

/**
 * PUT /api/marketplace/:id
 * Update a listing (mark as sold, edit details). Only owner.
 */
exports.updateListing = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM marketplace WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Listing not found' });
        if (rows[0].user_id !== req.user.id && req.user.role !== 2) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, price, category, contact, status } = req.body;
        await db.execute(
            'UPDATE marketplace SET title=?, description=?, price=?, category=?, contact=?, status=? WHERE id=?',
            [title || rows[0].title, description || rows[0].description, price || rows[0].price,
             category || rows[0].category, contact || rows[0].contact, status || rows[0].status, req.params.id]
        );
        res.json({ message: 'Listing updated' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

/**
 * DELETE /api/marketplace/:id
 * Delete a listing. Only owner or admin.
 */
exports.deleteListing = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM marketplace WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Listing not found' });
        if (rows[0].user_id !== req.user.id && req.user.role !== 2) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await db.execute('DELETE FROM marketplace WHERE id = ?', [req.params.id]);
        res.json({ message: 'Listing deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
};
