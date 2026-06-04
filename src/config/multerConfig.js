const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/study-materials');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types for study materials
const ALLOWED_EXTENSIONS = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.zip'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

let upload;

try {
    const multer = require('multer');

    // Configure where and how files are stored on disk
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            // Create unique filename: timestamp-originalname (prevents collisions)
            const uniqueName = `${Date.now()}-${file.originalname}`;
            cb(null, uniqueName);
        }
    });

    // Validate file type before accepting the upload
    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if (ALLOWED_EXTENSIONS.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
        }
    };

    // Export configured multer instance
    upload = multer({
        storage,
        fileFilter,
        limits: { fileSize: MAX_FILE_SIZE }
    });
} catch (e) {
    // Multer not installed — provide a stub that returns a helpful error
    console.warn('⚠️  multer is not installed. File uploads will be unavailable.');
    console.warn('   Run: npm install multer');

    // Stub middleware that rejects upload requests gracefully
    const stubMiddleware = (req, res, next) => {
        return res.status(503).json({
            message: 'File upload service unavailable. Server dependency "multer" is not installed.'
        });
    };
    upload = { single: () => stubMiddleware, array: () => stubMiddleware };
}

module.exports = upload;

