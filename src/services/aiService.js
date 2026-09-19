const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db');

/**
 * CampusFlow AI Service
 * Uses Google Gemini to answer campus-related questions.
 * Fetches all campus data from the database for comprehensive context.
 */

/**
 * Safely query the database and return rows, or an empty array on failure.
 */
const safeQuery = async (query, label) => {
    try {
        const [rows] = await db.execute(query);
        return rows;
    } catch (err) {
        console.warn(`Could not fetch ${label} for AI context:`, err.message);
        return [];
    }
};

exports.askCampusBrain = async (userQuestion) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment variables");
        }

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();
        const today = days[now.getDay()];
        const todayDate = now.toISOString().split('T')[0];

        // ── Fetch all campus data in parallel ──
        const [menuData, placements, events, announcements, busSchedule, lostFound] = await Promise.all([
            safeQuery('SELECT * FROM mess_menu', 'mess menu'),
            safeQuery("SELECT company_name, role, salary, deadline, location, status FROM placements ORDER BY deadline ASC", 'placements'),
            safeQuery("SELECT title, description, event_date, location, organizer, category FROM events WHERE event_date >= NOW() ORDER BY event_date ASC LIMIT 10", 'events'),
            safeQuery("SELECT title, content, tag, created_at FROM announcements ORDER BY created_at DESC LIMIT 10", 'announcements'),
            safeQuery("SELECT route_name, departure_time, arrival_time, bus_number FROM bus_schedule ORDER BY departure_time ASC", 'bus schedule'),
            safeQuery("SELECT title, type, description, location, status FROM lost_found WHERE status = 'open' ORDER BY created_at DESC LIMIT 10", 'lost & found'),
        ]);

        // ── Build context sections ──
        const contextParts = [`Today is ${today}, ${todayDate}.`];

        // Mess Menu
        if (menuData.length > 0) {
            const fullMenu = menuData.map(m =>
                `${m.day_of_week} -> Breakfast: ${m.breakfast} | Lunch: ${m.lunch} | Dinner: ${m.dinner}`
            ).join('\n');
            contextParts.push(`Weekly Mess Menu:\n${fullMenu}`);
        } else {
            contextParts.push('Mess menu data is currently unavailable.');
        }

        // Placements
        if (placements.length > 0) {
            const placementInfo = placements.map(p =>
                `${p.company_name} — ${p.role} | ${p.salary || 'Salary TBD'} | ${p.location || 'Location TBD'} | Deadline: ${p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'} | Status: ${p.status}`
            ).join('\n');
            contextParts.push(`Active Placement Drives:\n${placementInfo}`);
        }

        // Events
        if (events.length > 0) {
            const eventInfo = events.map(e =>
                `${e.title} — ${new Date(e.event_date).toLocaleString()} | ${e.location || 'TBD'} | Organizer: ${e.organizer || 'N/A'} | Category: ${e.category || 'general'}`
            ).join('\n');
            contextParts.push(`Upcoming Campus Events:\n${eventInfo}`);
        }

        // Announcements
        if (announcements.length > 0) {
            const announcementInfo = announcements.map(a =>
                `[${a.tag || 'general'}] ${a.title}: ${a.content}`
            ).join('\n');
            contextParts.push(`Recent Announcements:\n${announcementInfo}`);
        }

        // Bus Schedule
        if (busSchedule.length > 0) {
            const busInfo = busSchedule.map(b =>
                `${b.route_name} | Bus ${b.bus_number} | Departs: ${b.departure_time} | Arrives: ${b.arrival_time || 'N/A'}`
            ).join('\n');
            contextParts.push(`Bus Schedule:\n${busInfo}`);
        }

        // Lost & Found
        if (lostFound.length > 0) {
            const lfInfo = lostFound.map(l =>
                `[${l.type.toUpperCase()}] ${l.title} — ${l.description || 'No description'} | Location: ${l.location || 'N/A'}`
            ).join('\n');
            contextParts.push(`Open Lost & Found Items:\n${lfInfo}`);
        }

        const contextString = contextParts.join('\n\n');

        // Initialize Gemini with the current model
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Build the campus-aware prompt
        const prompt = `You are CampusFlow AI, the official intelligent assistant for a university campus management platform called CampusFlow.
You have access to real-time campus data including mess menus, bus schedules, placement drives, campus events, announcements, and lost & found items.
Use the provided campus data to give accurate, data-backed answers. If the data doesn't cover a question, say so honestly.
Keep answers concise, helpful, and friendly. Format responses clearly with bullet points or short paragraphs when appropriate.

=== CAMPUS DATA ===
${contextString}
=== END CAMPUS DATA ===

Student Question: ${userQuestion}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("AI Service Error:", error.message);
        throw error;
    }
};