const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
// Multer is optional — only needed for file upload routes
let multer;
try { multer = require('multer'); } catch (e) { multer = null; }

// Load environment variables FIRST, before any module reads process.env
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const placementRoutes = require('./routes/placementRoutes');
const messRoutes = require('./routes/messRoutes');
const aiRoutes = require('./routes/aiRoutes');
const busRoutes = require('./routes/busRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const materialRoutes = require('./routes/materialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const eventRoutes = require('./routes/eventRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');

const app = express();

// ──── CORS Configuration ────
// Allow localhost during development, Vercel in production
const allowedOrigins = [
    'http://localhost:5174',
    'http://localhost:3000',
    'https://iita-nexus-frontend.vercel.app',
    'https://campusflowiiita.vercel.app' // Added your current frontend URL
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    // Added OPTIONS method for preflight requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Serve uploaded files as static assets (for download links)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ──── Health Check ────
app.get('/', (req, res) => {
    res.json({ message: 'CampusFlow API is active and running.' });
});

// ──── Route Mounting ────
app.use('/api/auth', authRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// ──── Global Error Handler ────
app.use((err, req, res, next) => {
    // Handle multer file-size / file-type errors
    if (multer && err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 50 MB.' });
        }
        return res.status(400).json({ message: err.message });
    }

    // Handle custom file validation errors from multerConfig
    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({ message: err.message });
    }

    console.error('Server Error:', err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// ──── Start Server ────
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`>>> CampusFlow Server running on port ${PORT}`);
    console.log(`>>> Allowed origins: ${allowedOrigins.join(', ')}`);
});
