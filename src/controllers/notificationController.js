const db = require('../config/db');

/**
 * GET /api/notifications
 * Fetch all notifications for the logged-in user.
 * Supports ?unread=true to filter unread only.
 */
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { unread } = req.query;

        let query = 'SELECT * FROM notifications WHERE user_id = ?';
        const params = [userId];

        if (unread === 'true') {
            query += ' AND read_status = 0';
        }

        query += ' ORDER BY created_at DESC LIMIT 50';

        const [notifications] = await db.execute(query, params);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read.
 */
exports.markAsRead = async (req, res) => {
    try {
        await db.execute(
            'UPDATE notifications SET read_status = 1 WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update', error: error.message });
    }
};

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the logged-in user.
 */
exports.markAllAsRead = async (req, res) => {
    try {
        await db.execute(
            'UPDATE notifications SET read_status = 1 WHERE user_id = ? AND read_status = 0',
            [req.user.id]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update', error: error.message });
    }
};

/**
 * GET /api/notifications/count
 * Get unread notification count for the badge.
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = 0',
            [req.user.id]
        );
        res.json({ count: rows[0].count });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get count', error: error.message });
    }
};

/**
 * Helper: Create a notification for a user (called from other controllers).
 * Not an API endpoint — used internally.
 */
exports.createNotification = async (userId, title, message) => {
    try {
        await db.execute(
            'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
            [userId, title, message]
        );
    } catch (error) {
        console.warn('Failed to create notification:', error.message);
    }
};

/**
 * Helper: Broadcast notification to all users (e.g., new placement posted).
 */
exports.broadcastNotification = async (title, message) => {
    try {
        const [users] = await db.execute('SELECT id FROM users');
        const promises = users.map(u =>
            db.execute(
                'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                [u.id, title, message]
            )
        );
        await Promise.all(promises);
    } catch (error) {
        console.warn('Failed to broadcast notification:', error.message);
    }
};
