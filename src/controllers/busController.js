const db = require('../config/db');

exports.getNextBuses = async (req, res) => {
    try {
        // Query to find the 3 nearest upcoming buses based on the current time
        const query = `
            SELECT * FROM bus_schedule 
            WHERE departure_time > CURTIME() 
            ORDER BY departure_time ASC 
            LIMIT 3
        `;
        
        const [buses] = await db.execute(query);
        res.json(buses);
    } catch (error) {
        res.status(500).json({ message: "Transit tracking failed", error: error.message });
    }
};