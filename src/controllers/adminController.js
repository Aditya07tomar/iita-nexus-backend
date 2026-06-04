const db = require('../config/db');
const { broadcastNotification } = require('./notificationController');

// ══════════════════════════════════════════
// ADMIN CONTROLLER
// All functions here require role_id === 2 (admin)
// ══════════════════════════════════════════

// ──── ANALYTICS ────

/**
 * GET /api/admin/analytics
 * Dashboard analytics for admin panel.
 */
exports.getAnalytics = async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.execute('SELECT COUNT(*) as totalUsers FROM users');
        const [[{ totalMaterials }]] = await db.execute('SELECT COUNT(*) as totalMaterials FROM study_materials');
        const [[{ totalDownloads }]] = await db.execute('SELECT COALESCE(SUM(download_count), 0) as totalDownloads FROM study_materials');
        const [[{ totalChats }]] = await db.execute('SELECT COUNT(*) as totalChats FROM chat_history');
        const [[{ totalPlacements }]] = await db.execute('SELECT COUNT(*) as totalPlacements FROM placements');
        const [[{ totalAnnouncements }]] = await db.execute('SELECT COUNT(*) as totalAnnouncements FROM announcements');

        // Most downloaded material
        const [topMaterials] = await db.execute(
            'SELECT title, download_count FROM study_materials ORDER BY download_count DESC LIMIT 5'
        );

        // Recent users (last 7 days)
        const [[{ recentUsers }]] = await db.execute(
            'SELECT COUNT(*) as recentUsers FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );

        res.json({
            totalUsers,
            totalMaterials,
            totalDownloads,
            totalChats,
            totalPlacements,
            totalAnnouncements,
            topMaterials,
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Analytics error', error: error.message });
    }
};

// ──── PLACEMENT MANAGEMENT ────

/**
 * PUT /api/admin/placements/:id
 * Edit a placement drive.
 */
exports.updatePlacement = async (req, res) => {
    try {
        const { company_name, role, salary, deadline, location, status } = req.body;
        await db.execute(
            'UPDATE placements SET company_name=?, role=?, salary=?, deadline=?, location=?, status=? WHERE id=?',
            [company_name, role, salary, deadline, location, status, req.params.id]
        );
        res.json({ message: 'Placement updated' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

/**
 * DELETE /api/admin/placements/:id
 * Delete a placement drive.
 */
exports.deletePlacement = async (req, res) => {
    try {
        await db.execute('DELETE FROM placements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Placement deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
};

/**
 * POST /api/admin/placements
 * Create a new placement drive and notify all users.
 */
exports.createPlacement = async (req, res) => {
    try {
        const { company_name, role, salary, deadline, location } = req.body;
        await db.execute(
            'INSERT INTO placements (company_name, role, salary, deadline, location) VALUES (?, ?, ?, ?, ?)',
            [company_name, role, salary, deadline, location]
        );

        // Broadcast notification to all users
        await broadcastNotification(
            '🎯 New Placement Drive',
            `${company_name} is hiring for ${role}. Deadline: ${deadline}`
        );

        res.status(201).json({ message: 'Placement created and users notified' });
    } catch (error) {
        res.status(500).json({ message: 'Create failed', error: error.message });
    }
};

// ──── ANNOUNCEMENT MANAGEMENT ────

/**
 * PUT /api/admin/announcements/:id
 * Edit an announcement.
 */
exports.updateAnnouncement = async (req, res) => {
    try {
        const { title, content, tag } = req.body;
        await db.execute(
            'UPDATE announcements SET title=?, content=?, tag=? WHERE id=?',
            [title, content, tag, req.params.id]
        );
        res.json({ message: 'Announcement updated' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

/**
 * DELETE /api/admin/announcements/:id
 * Delete an announcement.
 */
exports.deleteAnnouncement = async (req, res) => {
    try {
        await db.execute('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
};

/**
 * POST /api/admin/announcements
 * Create an announcement and notify all users.
 */
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, tag } = req.body;
        await db.execute(
            'INSERT INTO announcements (title, content, tag, created_by) VALUES (?, ?, ?, ?)',
            [title, content, tag, req.user.id]
        );

        await broadcastNotification('📢 New Announcement', title);

        res.status(201).json({ message: 'Announcement posted and users notified' });
    } catch (error) {
        res.status(500).json({ message: 'Create failed', error: error.message });
    }
};

// ──── MESS MANAGEMENT ────

/**
 * PUT /api/admin/mess/:id
 * Update a day's mess menu.
 */
exports.updateMessMenu = async (req, res) => {
    try {
        const { breakfast, lunch, dinner } = req.body;
        await db.execute(
            'UPDATE mess_menu SET breakfast=?, lunch=?, dinner=? WHERE id=?',
            [breakfast, lunch, dinner, req.params.id]
        );
        res.json({ message: 'Menu updated' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

// ──── MATERIAL MODERATION ────

/**
 * DELETE /api/admin/materials/:id
 * Admin can delete any material.
 */
exports.deleteMaterial = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');

        const [rows] = await db.execute('SELECT * FROM study_materials WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Delete physical file
        const filePath = path.join(__dirname, '../../uploads/study-materials', rows[0].file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await db.execute('DELETE FROM study_materials WHERE id = ?', [req.params.id]);
        res.json({ message: 'Material removed' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
};

// ──── USER MANAGEMENT ────

/**
 * GET /api/admin/users
 * List all users.
 */
exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, roll_no, role_id, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};
