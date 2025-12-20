const db = require('../config/db');

exports.getWeeklyMenu = async (req, res) => {
    try {
        // Fetch all days ordered by a standard week sequence
        const [menu] = await db.execute(`
            SELECT * FROM mess_menu 
            ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
        `);
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch weekly menu", error: error.message });
    }
};