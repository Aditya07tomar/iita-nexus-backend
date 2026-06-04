const db = require('../config/db');
const { broadcastNotification } = require('./notificationController');

/**
 * GET /api/events
 * List all events. Supports ?category=&upcoming=true
 */
exports.getEvents = async (req, res) => {
    try {
        const { category, upcoming } = req.query;
        let query = 'SELECT e.*, u.name as creator_name FROM events e LEFT JOIN users u ON e.created_by = u.id';
        const conditions = [];
        const params = [];

        if (category) { conditions.push('e.category = ?'); params.push(category); }
        if (upcoming === 'true') { conditions.push('e.event_date >= NOW()'); }

        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY e.event_date ASC';

        const [events] = await db.execute(query, params);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch events', error: error.message });
    }
};

/**
 * POST /api/events
 * Create a new event. Admin only (enforced via route middleware).
 */
exports.createEvent = async (req, res) => {
    try {
        const { title, description, event_date, location, organizer, category } = req.body;

        if (!title || !event_date) {
            return res.status(400).json({ message: 'Title and event date are required' });
        }

        await db.execute(
            'INSERT INTO events (title, description, event_date, location, organizer, category, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', event_date, location || '', organizer || '', category || 'general', req.user.id]
        );

        // Notify all users about new event
        await broadcastNotification('📅 New Event', `${title} — ${new Date(event_date).toLocaleDateString()}`);

        res.status(201).json({ message: 'Event created and users notified' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
};

/**
 * PUT /api/events/:id
 * Update an event. Admin only.
 */
exports.updateEvent = async (req, res) => {
    try {
        const { title, description, event_date, location, organizer, category } = req.body;
        await db.execute(
            'UPDATE events SET title=?, description=?, event_date=?, location=?, organizer=?, category=? WHERE id=?',
            [title, description, event_date, location, organizer, category, req.params.id]
        );
        res.json({ message: 'Event updated' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

/**
 * DELETE /api/events/:id
 * Delete an event. Admin only.
 */
exports.deleteEvent = async (req, res) => {
    try {
        await db.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
};
