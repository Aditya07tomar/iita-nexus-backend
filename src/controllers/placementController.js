const db = require('../config/db');

// Ensure 'exports.getAllPlacements' is exactly like this
exports.getAllPlacements = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM placements ORDER BY deadline ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving data", error: error.message });
    }
};

// Ensure 'exports.createPlacement' is exactly like this
exports.createPlacement = async (req, res) => {
    const { company_name, role, salary, deadline, location } = req.body;
    try {
        await db.execute(
            'INSERT INTO placements (company_name, role, salary, deadline, location) VALUES (?, ?, ?, ?, ?)',
            [company_name, role, salary, deadline, location]
        );
        res.status(201).json({ message: "Placement added" });
    } catch (error) {
        res.status(500).json({ message: "Failed to create", error: error.message });
    }
};