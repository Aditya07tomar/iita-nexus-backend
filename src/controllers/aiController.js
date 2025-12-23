const aiService = require('../services/aiService');

exports.chat = async (req, res) => {
    try {
        // Accept both common keys to prevent frontend mismatches
        const question = req.body.question || req.body.message; 
        
        if (!question) {
            return res.status(400).json({ message: "Please provide a question for Nexus AI." });
        }

        const answer = await aiService.askCampusBrain(question);
        res.json({ answer });
    } catch (error) {
        res.status(500).json({ message: "AI Brain failed to respond", error: error.message });
    }
};