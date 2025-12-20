const express = require('express'); // 1. Import express
const cors = require('cors');       // 2. Import cors
const dotenv = require('dotenv');

dotenv.config();

const app = express(); // 3. INITIALIZE APP BEFORE USING IT (This fixes the error)

// 4. Now you can use app.use
app.use(cors({
    // MUST include 'https://' and MUST NOT have a trailing slash '/'
    origin: 'https://iita-nexus-frontend.vercel.app', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Your routes follow...
app.listen(process.env.PORT || 5050, () => {
    console.log(`Server running on port ${process.env.PORT || 5050}`);
});