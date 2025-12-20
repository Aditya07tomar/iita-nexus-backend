const express = require('express'); // 1. Import express
const cors = require('cors');       // 2. Import cors
const dotenv = require('dotenv');

dotenv.config();

const app = express(); // 3. INITIALIZE APP BEFORE USING IT (This fixes the error)

// 4. Now you can use app.use
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Your routes follow...
app.listen(process.env.PORT || 5050, () => {
    console.log(`Server running on port ${process.env.PORT || 5050}`);
});