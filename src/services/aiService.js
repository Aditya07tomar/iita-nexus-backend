const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db');

exports.askCampusBrain = async (userQuestion) => {
    try {
        // DEBUG 1: Check if API Key is loading
        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ ERROR: GEMINI_API_KEY is missing from .env file!");
            throw new Error("API Key configuration missing");
        }

        // 1. Fetch context
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        
        const [menuData] = await db.execute('SELECT * FROM mess_menu WHERE day_of_week = ?', [today]);
        const contextString = menuData.length > 0 
            ? menuData.map(m => `${m.meal_type}: ${m.items}`).join(", ") 
            : "Menu not updated.";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel(
    { model: "gemini-2.0-flash-lite" }, 
    { apiVersion: 'v1' } // This forces the SDK to use /v1/ instead of /v1beta/
);

        // 3. Generate content
        const prompt = `User asked: ${userQuestion}. Context: ${contextString}`;
        
        console.log("🤖 Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        return response.text();

    } catch (error) {
        // DEBUG 2: Log the REAL error to your terminal
        console.error("🔥 DETAILED AI ERROR:", error.message);
        throw new Error(`AI Service Failed: ${error.message}`);
    }
};