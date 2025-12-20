const aiService = require('../services/aiService');

exports.chat = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ message: "Please ask a question" });

        const answer = await aiService.askCampusBrain(question);
        res.json({ answer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};