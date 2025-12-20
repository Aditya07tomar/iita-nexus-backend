const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. Import Routes
const authRoutes = require('./routes/authRoutes');
const messRoutes = require('./routes/messRoutes');
const aiRoutes = require('./routes/aiRoutes'); // Make sure these files exist!
const announcementRoutes = require('./routes/announcementRoutes');

dotenv.config();
const app = express();

// 2. Global Middleware (MUST come before Routes)
app.use(cors());
app.use(express.json()); 

// 3. Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/announcements', announcementRoutes);

// 4. Basic Test Route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to IITA Nexus API" });
});

module.exports = app;