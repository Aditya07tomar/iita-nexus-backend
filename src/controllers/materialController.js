const db = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/materials
 * Fetch all study materials with uploader name.
 * Supports optional query filters: ?semester=3&subject=DSA&search=sorting
 */
exports.getAllMaterials = async (req, res) => {
    try {
        const { semester, subject, search, category } = req.query;

        let query = `
            SELECT m.*, u.name AS uploader_name 
            FROM study_materials m 
            JOIN users u ON m.uploaded_by = u.id
        `;
        const conditions = [];
        const params = [];

        if (semester) {
            conditions.push('m.semester = ?');
            params.push(semester);
        }

        if (subject) {
            conditions.push('m.subject = ?');
            params.push(subject);
        }

        if (search) {
            conditions.push('(m.title LIKE ? OR m.subject LIKE ? OR m.description LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (category) {
            conditions.push('m.category = ?');
            params.push(category);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY m.created_at DESC';

        const [materials] = await db.execute(query, params);
        res.json(materials);
    } catch (error) {
        console.error('Get Materials Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch materials', error: error.message });
    }
};

/**
 * GET /api/materials/:id
 * Fetch a single material by ID with uploader info.
 */
exports.getMaterialById = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT m.*, u.name AS uploader_name 
             FROM study_materials m 
             JOIN users u ON m.uploaded_by = u.id 
             WHERE m.id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Material not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch material', error: error.message });
    }
};

/**
 * POST /api/materials/upload
 * Upload a new study material. Requires authentication.
 * File is handled by multer middleware before this runs.
 */
exports.uploadMaterial = async (req, res) => {
    try {
        // Multer attaches the file info to req.file
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, description, semester, subject, category } = req.body;

        // Basic validation
        if (!title || !semester || !subject) {
            // Clean up the uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Title, semester, and subject are required' });
        }

        const userId = req.user.id;

        await db.execute(
            `INSERT INTO study_materials 
                (title, description, semester, subject, category, file_name, file_path, file_size, uploaded_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description || '',
                semester,
                subject,
                category || 'Notes',
                req.file.originalname,
                req.file.filename,
                req.file.size,
                userId
            ]
        );

        res.status(201).json({ message: 'Material uploaded successfully' });
    } catch (error) {
        // Clean up file if database insert fails
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        console.error('Upload Error:', error.message);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};

/**
 * DELETE /api/materials/:id
 * Delete a material. Only the uploader or an admin (role_id 2) can delete.
 */
exports.deleteMaterial = async (req, res) => {
    try {
        const materialId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Fetch the material to check ownership and get file path
        const [rows] = await db.execute('SELECT * FROM study_materials WHERE id = ?', [materialId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const material = rows[0];

        // Authorization: only uploader or admin can delete
        if (material.uploaded_by !== userId && userRole !== 2) {
            return res.status(403).json({ message: 'Not authorized to delete this material' });
        }

        // Delete the physical file from disk
        const filePath = path.join(__dirname, '../../uploads/study-materials', material.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete the database record
        await db.execute('DELETE FROM study_materials WHERE id = ?', [materialId]);

        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error.message);
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
};

/**
 * GET /api/materials/download/:id
 * Download a material file and increment the download count.
 */
exports.downloadMaterial = async (req, res) => {
    try {
        const materialId = req.params.id;

        const [rows] = await db.execute('SELECT * FROM study_materials WHERE id = ?', [materialId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const material = rows[0];
        const filePath = path.join(__dirname, '../../uploads/study-materials', material.file_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        // Increment download count
        await db.execute(
            'UPDATE study_materials SET download_count = download_count + 1 WHERE id = ?',
            [materialId]
        );

        // Send the file with original filename
        res.download(filePath, material.file_name);
    } catch (error) {
        console.error('Download Error:', error.message);
        res.status(500).json({ message: 'Download failed', error: error.message });
    }
};
