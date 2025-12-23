const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db');

exports.askCampusBrain = async (userQuestion) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing in Render environment variables");
        }

        // 1. Get today's context from Mess Menu
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        
        const [menuData] = await db.execute('SELECT * FROM mess_menu WHERE day_of_week = ?', [today]);
        const contextString = menuData.length > 0 
            ? menuData.map(m => `Day: ${m.day_of_week}, Breakfast: ${m.breakfast}, Lunch: ${m.lunch}, Dinner: ${m.dinner}`).join(" | ") 
            : "The mess menu for today has not been updated yet.";

        // 2. Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 3. Craft the Prompt
        const prompt = `You are Nexus AI, the official assistant for IITA (Indian Institute of Technology & Advanced Studies). 
        Use the following database context to answer the student's question accurately. 
        Context: ${contextString}. 
        User Question: ${userQuestion}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("AI Service Error:", error.message);
        throw error;
    }
};