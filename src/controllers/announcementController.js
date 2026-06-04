const db = require('../config/db');

// @desc Get all announcements (Filtered by tag)
exports.getAnnouncements = async (req, res) => {
    try {
        const { tag } = req.query;
        let query = 'SELECT a.*, u.name as author FROM announcements a JOIN users u ON a.created_by = u.id';
        let params = [];

        if (tag) {
            query += ' WHERE a.tag = ?';
            params.push(tag);
        }

        query += ' ORDER BY a.created_at DESC';
        
        const [notices] = await db.execute(query, params);
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notices", error: error.message });
    }
};

// @desc Create new announcement (Admin Only)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, tag } = req.body;
        const userId = req.user.id; // From our 'protect' middleware

        await db.execute(
            'INSERT INTO announcements (title, content, tag, created_by) VALUES (?, ?, ?, ?)',
            [title, content, tag, userId]
        );

        res.status(201).json({ message: "Announcement posted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to post", error: error.message });
    }
};