const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const placementRoutes = require('./routes/placementRoutes');
const messRoutes = require('./routes/messRoutes');

// Load environment variables
dotenv.config();

const app = express();

// 1. CORS Configuration (Fixes the Preflight/Invalid Origin errors)
app.use(cors({
    origin: 'https://iita-nexus-frontend.vercel.app', // No trailing slash
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware for parsing JSON (Ensures req.body is not undefined)
app.use(express.json());

// 3. Health Check (To verify the server is live on Render)
app.get('/', (req, res) => {
    res.send('IITA Nexus API is active and running.');
});

// 4. Route Mounting (This matches your frontend api.post calls)
// If your frontend calls api.post('/auth/login'), use this:
app.use('/auth', authRoutes);

// If your frontend calls api.post('/api/placements'), use this:
app.use('/api', placementRoutes);
app.use('/mess', messRoutes);

// 5. Global Error Handler (Prevents the server from crashing on errors)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 6. Start Server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`>>> Nexus Server successfully deployed on port ${PORT}`);
    console.log(`>>> Whitelisted Origin: https://iita-nexus-frontend.vercel.app`);
});