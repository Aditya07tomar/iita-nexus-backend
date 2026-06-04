const db = require('../config/db');

// Ensure this function name matches what you use in the Router
exports.getMessMenu = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM mess_menu');
        res.json(rows);
    } catch (error) {
        console.error("Mess Menu Error:", error.message);
        res.status(500).json({ message: "Error retrieving menu", error: error.message });
    }
};

exports.updateMessMenu = async (req, res) => {
    const { id, day_of_week, breakfast, lunch, dinner } = req.body;
    try {
        await db.execute(
            'UPDATE mess_menu SET day_of_week=?, breakfast=?, lunch=?, dinner=? WHERE id=?',
            [day_of_week, breakfast, lunch, dinner, id]
        );
        res.json({ message: "Menu updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};