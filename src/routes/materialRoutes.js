const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

// Public routes — anyone can browse and download
// GET /api/materials         → list all (with optional ?semester, ?subject, ?search)
// GET /api/materials/:id     → get single material details
// GET /api/materials/download/:id → download file & increment count
router.get('/', materialController.getAllMaterials);
router.get('/download/:id', materialController.downloadMaterial);
router.get('/:id', materialController.getMaterialById);

// Protected routes — login required
// POST   /api/materials/upload → upload a new material (uses multer for file)
// DELETE /api/materials/:id    → delete material (uploader or admin only)
router.post('/upload', protect, upload.single('file'), materialController.uploadMaterial);
router.delete('/:id', protect, materialController.deleteMaterial);

module.exports = router;
