const db = require('../config/db');

exports.getAllPlacements = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM placements ORDER BY deadline ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching placements", error: error.message });
    }
};