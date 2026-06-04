const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db');

/**
 * CampusFlow AI Service
 * Uses Google Gemini to answer campus-related questions.
 * Fetches today's mess menu from the database for context.
 */
exports.askCampusBrain = async (userQuestion) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment variables");
        }

        // Fetch the entire weekly mess menu for contextual answers
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];

        let contextString = "The mess menu is currently unavailable.";
        try {
            const [menuData] = await db.execute('SELECT * FROM mess_menu');
            if (menuData.length > 0) {
                // Format the full weekly menu into a readable string for the AI
                const fullMenu = menuData.map(m => 
                    `${m.day_of_week} -> Breakfast: ${m.breakfast} | Lunch: ${m.lunch} | Dinner: ${m.dinner}`
                ).join('\n');
                
                contextString = `Today is ${today}.\nWeekly Mess Menu:\n${fullMenu}`;
            }
        } catch (dbError) {
            console.warn("Could not fetch mess data for AI context:", dbError.message);
            // Continue without context — AI can still answer general questions
        }

        // Initialize Gemini with the current model
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Build the campus-aware prompt
        const prompt = `You are CampusFlow AI, the official assistant for a university campus management platform.
You help students with mess menus, bus schedules, placement information, and general campus queries.
Keep answers concise, helpful, and friendly.

Campus Context: ${contextString}

Student Question: ${userQuestion}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("AI Service Error:", error.message);
        throw error;
    }
};