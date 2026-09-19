-- ══════════════════════════════════════════
-- CampusFlow — MySQL Database Schema
-- Run this file to set up all required tables.
-- Usage: mysql -u root -p campusflow < schema.sql
-- ══════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS campusflow;
USE campusflow;

-- ──── Roles Table ────
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Seed default roles
INSERT IGNORE INTO roles (id, name) VALUES
    (1, 'student'),
    (2, 'admin');

-- ──── Users Table ────
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50),
    role_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ──── Mess Menu Table ────
CREATE TABLE IF NOT EXISTS mess_menu (
    id INT PRIMARY KEY AUTO_INCREMENT,
    day_of_week VARCHAR(20) NOT NULL UNIQUE,
    breakfast TEXT,
    lunch TEXT,
    dinner TEXT
);

-- Seed weekly mess menu with sample data
INSERT IGNORE INTO mess_menu (day_of_week, breakfast, lunch, dinner) VALUES
    ('Monday',    'Poha, Tea, Banana',           'Dal Fry, Rice, Roti, Salad',           'Paneer Butter Masala, Rice, Roti'),
    ('Tuesday',   'Idli Sambar, Coffee',          'Rajma, Rice, Roti, Raita',             'Chole, Rice, Roti, Gulab Jamun'),
    ('Wednesday', 'Aloo Paratha, Curd, Tea',      'Kadhi Pakora, Rice, Roti',             'Mix Veg, Dal, Rice, Roti'),
    ('Thursday',  'Bread Omelette, Juice',        'Sambar, Rice, Roti, Papad',            'Mushroom Curry, Rice, Roti'),
    ('Friday',    'Upma, Chutney, Tea',           'Aloo Gobi, Rice, Roti, Pickle',        'Dal Makhani, Rice, Roti, Ice Cream'),
    ('Saturday',  'Puri Bhaji, Tea',              'Biryani, Raita, Salad',                'Palak Paneer, Rice, Roti'),
    ('Sunday',    'Chole Bhature, Lassi',         'Pulao, Dal, Roti, Sweet',              'Butter Chicken / Paneer Tikka, Rice, Naan');

-- ──── Placements Table ────
CREATE TABLE IF NOT EXISTS placements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary VARCHAR(50),
    deadline DATE,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed sample placement drives
INSERT IGNORE INTO placements (company_name, role, salary, deadline, location, status) VALUES
    ('Microsoft',  'Software Engineer',        '₹45 LPA',       '2026-10-15', 'Hyderabad',  'Open'),
    ('Microsoft',  'Azure Cloud Intern',        '₹1,00,000/mo',  '2026-10-01', 'Noida',      'Open'),
    ('Microsoft',  'Data Scientist',            '₹38 LPA',       '2026-10-20', 'Bangalore',  'Open'),
    ('Microsoft',  'PM Intern (Explore)',        '₹90,000/mo',    '2026-09-25', 'Hyderabad',  'Open'),
    ('Google',     'SDE Intern',                 '₹80,000/mo',    '2026-10-10', 'Bangalore',  'Open'),
    ('Google',     'Software Engineer L3',       '₹32 LPA',       '2026-10-18', 'Bangalore',  'Open'),
    ('Amazon',     'SDE-1',                      '₹22 LPA',       '2026-06-20', 'Bangalore',  'Closed'),
    ('Meta',       'Production Engineer',        '₹40 LPA',       '2026-10-25', 'Remote',     'Open'),
    ('Apple',      'Hardware Intern',             '₹70,000/mo',    '2026-10-30', 'Hyderabad',  'Open'),
    ('Flipkart',   'Backend Developer',          '₹20 LPA',       '2026-10-05', 'Bangalore',  'Open'),
    ('Adobe',      'MTS - Computer Scientist',   '₹25 LPA',       '2026-09-10', 'Noida',      'Closed'),
    ('Atlassian',  'SDE-1',                      '₹35 LPA',       '2026-10-22', 'Bangalore',  'Open');

-- ──── Bus Schedule Table ────
CREATE TABLE IF NOT EXISTS bus_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_name VARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME,
    bus_number VARCHAR(20)
);

-- Seed sample bus schedule
INSERT IGNORE INTO bus_schedule (route_name, departure_time, arrival_time, bus_number) VALUES
    ('Campus → City Center',    '08:00:00', '08:45:00', 'CF-01'),
    ('Campus → Railway Station','09:30:00', '10:15:00', 'CF-02'),
    ('Campus → City Center',    '12:00:00', '12:45:00', 'CF-01'),
    ('Campus → Airport',        '14:00:00', '15:00:00', 'CF-03'),
    ('Campus → City Center',    '17:00:00', '17:45:00', 'CF-01'),
    ('Campus → Railway Station','18:30:00', '19:15:00', 'CF-02'),
    ('Campus → City Center',    '20:00:00', '20:45:00', 'CF-01');

-- ──── Announcements Table ────
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    tag VARCHAR(50),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ──── Chat History Table (for AI conversations) ────
CREATE TABLE IF NOT EXISTS chat_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ──── Study Materials Table ────
CREATE TABLE IF NOT EXISTS study_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    semester INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'Notes',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT DEFAULT 0,
    uploaded_by INT NOT NULL,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ──── Password Reset Tokens Table ────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ──── Notifications Table ────
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read_status TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ──── Bus Locations Table (Live Tracking) ────
CREATE TABLE IF NOT EXISTS bus_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bus_id INT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES bus_schedule(id) ON DELETE CASCADE
);

-- ──── Bookmarks Table (Placement Tracker + Resource Bookmarks) ────
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    item_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Saved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (user_id, item_type, item_id)
);

-- ──── Feedback Table ────
CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    rating INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ──── Lost & Found Table ────
CREATE TABLE IF NOT EXISTS lost_found (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('lost', 'found') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    contact VARCHAR(100),
    status ENUM('open', 'claimed', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ──── Campus Events Table ────
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(200),
    organizer VARCHAR(100),
    category VARCHAR(50),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ──── Marketplace Listings Table ────
CREATE TABLE IF NOT EXISTS marketplace (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    category VARCHAR(50),
    contact VARCHAR(100),
    status ENUM('available', 'sold') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ──── Indexes for Performance ────
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_placements_deadline ON placements(deadline);
CREATE INDEX idx_bus_departure ON bus_schedule(departure_time);
CREATE INDEX idx_chat_user ON chat_history(user_id);
CREATE INDEX idx_materials_semester ON study_materials(semester);
CREATE INDEX idx_materials_subject ON study_materials(subject);
CREATE INDEX idx_materials_category ON study_materials(category);
CREATE INDEX idx_materials_uploader ON study_materials(uploaded_by);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_status);
CREATE INDEX idx_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_lost_found_status ON lost_found(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_marketplace_status ON marketplace(status);

-- ══════════════════════════════════════════════════
-- ── SEED DATA: Demo Users, Announcements, Events,
--    Feedback, Lost & Found, Marketplace
-- ══════════════════════════════════════════════════

-- Seed demo users (password is 'password123' hashed with bcrypt)
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT IGNORE INTO users (id, name, email, password, roll_no, role_id) VALUES
    (1, 'Admin CampusFlow',  'admin@iiita.ac.in',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN001', 2),
    (2, 'Aditya Tomar',      'aditya@iiita.ac.in',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'IIT2022001', 1),
    (3, 'Priya Sharma',      'priya@iiita.ac.in',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'IIT2022015', 1),
    (4, 'Rahul Verma',       'rahul@iiita.ac.in',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'IIT2023042', 1),
    (5, 'Sneha Patel',       'sneha@iiita.ac.in',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'IIT2023078', 1);

-- ── Seed Announcements ──
INSERT IGNORE INTO announcements (id, title, content, tag, created_by) VALUES
    (1, 'Microsoft On-Campus Drive — Oct 2026',
        'Microsoft is visiting campus on October 15th for Software Engineer and Azure Cloud Intern roles. Eligible branches: CSE, IT, ECE. Minimum CGPA 7.5 required. Register on the placement portal by Oct 10.',
        'Placement', 1),
    (2, 'Microsoft Learn Student Ambassador Program',
        'Applications are open for the Microsoft Learn Student Ambassador (MLSA) program! Become a certified ambassador, get Azure credits, free Microsoft certifications, and exclusive swag. Apply at studentambassadors.microsoft.com before October 5.',
        'Opportunity', 1),
    (3, 'Azure Workshop — Hands-On Cloud Computing',
        'A 3-hour workshop on Microsoft Azure fundamentals will be held in LHC-301 on September 28th. Topics include App Services, Azure Functions, and CosmosDB. Bring your laptops. Free Azure credits for all attendees!',
        'Workshop', 1),
    (4, 'Mid-Semester Exam Schedule Released',
        'The mid-semester examination schedule for Semester V and VII has been uploaded on the academics portal. Exams start from October 1st. Please check the detailed timetable and report any conflicts to the academic section by Sep 25.',
        'Academic', 1),
    (5, 'Hackathon: Microsoft Imagine Cup Campus Round',
        'The campus selection round for Microsoft Imagine Cup 2026 will be held on October 8th. Teams of 3-4 can register. Themes: AI for Accessibility, Sustainable Tech, Health Innovation. Winners get mentorship from Microsoft engineers and travel to regionals.',
        'Event', 1),
    (6, 'Campus WiFi Maintenance — Sept 22',
        'The campus WiFi network will undergo scheduled maintenance on September 22 from 2:00 AM to 6:00 AM. Internet services may be intermittent during this period. Plan your downloads accordingly.',
        'Infrastructure', 1);

-- ── Seed Events ──
INSERT IGNORE INTO events (id, title, description, event_date, location, organizer, category, created_by) VALUES
    (1, 'Microsoft Azure Cloud Workshop',
        'Hands-on session covering Azure App Services, Functions, CosmosDB, and CI/CD pipelines. Bring your laptop. Free Azure credits for participants.',
        '2026-09-28 10:00:00', 'LHC-301', 'Microsoft Student Club', 'workshop', 1),
    (2, 'Microsoft Imagine Cup — Campus Round',
        'Campus qualifying round for the global Microsoft Imagine Cup. Build innovative solutions using Microsoft technologies. Top 3 teams advance to regionals.',
        '2026-10-08 09:00:00', 'CC-Auditorium', 'Placement Cell & Microsoft', 'hackathon', 1),
    (3, 'DSA Marathon: Cracking Microsoft Interviews',
        'A 6-hour intensive problem-solving session focused on Microsoft interview patterns — arrays, trees, graphs, and dynamic programming. Bring your competitive spirit!',
        '2026-10-02 14:00:00', 'LHC-201', 'Coding Club IIITA', 'workshop', 1),
    (4, 'Guest Lecture: Building at Scale with .NET',
        'A senior engineer from Microsoft IDC Hyderabad shares how .NET powers Xbox, Teams, and Azure. Open Q&A session at the end.',
        '2026-10-12 16:00:00', 'CC-Seminar Hall', 'CSE Department', 'seminar', 1),
    (5, 'Technocracy 2026 — Annual Tech Fest',
        'IIITA''s flagship tech fest featuring hackathons, coding contests, robotics challenges, gaming tournaments, and industry talks. This year''s title sponsor: Microsoft.',
        '2026-11-01 09:00:00', 'Main Campus', 'Student Council', 'fest', 1),
    (6, 'GitHub + VS Code Power User Workshop',
        'Master GitHub Actions, Copilot, VS Code extensions, and dev containers. Hosted by Microsoft Learn Student Ambassadors.',
        '2026-10-18 11:00:00', 'LHC-105', 'MLSA IIITA Chapter', 'workshop', 1),
    (7, 'Resume Building & Mock Interview Day',
        'Placement cell is organizing a mock interview session with alumni from Microsoft, Google, and Amazon. Slots are limited — register on the portal.',
        '2026-10-05 10:00:00', 'Placement Cell Office', 'Placement Cell', 'career', 1);

-- ── Seed Feedback ──
INSERT IGNORE INTO feedback (id, user_id, category, title, message, rating) VALUES
    (1, 2, 'Mess', 'Sunday dinner is great', 'The Butter Chicken on Sundays is consistently good. Appreciate the mess committee for keeping the quality up.', 5),
    (2, 3, 'Infrastructure', 'WiFi issues in Hostel Block C', 'The WiFi signal is extremely weak on the 3rd floor of Block C. We''ve reported it multiple times but no action has been taken.', 2),
    (3, 4, 'Academics', 'DSA lab timings conflict', 'The Tuesday DSA lab from 2-5 PM conflicts with the Microsoft workshop timings. Can the lab be shifted to Thursday?', 3),
    (4, 5, 'Placement', 'More Microsoft roles needed', 'Microsoft only visited for SDE and Cloud roles. Can the placement cell also invite them for PM and Data Science positions?', 4),
    (5, 2, 'Campus Life', 'Need more coding spaces', 'The library closes at 10 PM but many of us prepare for Microsoft and Google interviews late at night. A 24/7 coding lab would be a game-changer.', 4),
    (6, 3, 'Mess', 'Breakfast quality has dropped', 'The Poha on Mondays has been undercooked for the last 3 weeks. Please look into it.', 2),
    (7, 4, 'Infrastructure', 'Projector broken in LHC-201', 'The projector in LHC-201 hasn''t been working since last week. The upcoming DSA Marathon event needs it.', 1);

-- ── Seed Lost & Found ──
INSERT IGNORE INTO lost_found (id, user_id, type, title, description, location, contact, status) VALUES
    (1, 2, 'lost',  'Microsoft Surface Pen — Black',       'Lost my Surface Pen (black, slim) somewhere between LHC and the library. Has my name scratched on the clip.', 'LHC to Library Path', 'aditya@iiita.ac.in', 'open'),
    (2, 3, 'found', 'Blue Backpack with Laptop',            'Found a blue Wildcraft backpack near the CC canteen. Contains a Dell laptop and some notebooks.', 'CC Canteen', 'priya@iiita.ac.in', 'open'),
    (3, 4, 'lost',  'Wired Earphones — JBL',               'Lost my JBL wired earphones in LHC-301 after the Azure Workshop rehearsal.', 'LHC-301', 'rahul@iiita.ac.in', 'open'),
    (4, 5, 'found', 'Student ID Card — Amit Kumar',         'Found a student ID card (IIT2021087 — Amit Kumar) near the sports ground.', 'Sports Ground', 'sneha@iiita.ac.in', 'open'),
    (5, 2, 'lost',  'Calculator — Casio FX-991EX',          'Left my Casio scientific calculator in the exam hall after the Maths midsem.', 'Exam Hall 2', 'aditya@iiita.ac.in', 'claimed'),
    (6, 3, 'found', 'Water Bottle — Grey Milton',           'Found a grey Milton water bottle in LHC-105 after the GitHub workshop.', 'LHC-105', 'priya@iiita.ac.in', 'closed');

-- ── Seed Marketplace ──
INSERT IGNORE INTO marketplace (id, user_id, title, description, price, category, contact, status) VALUES
    (1, 2, 'Microsoft Surface Pro 8 — Barely Used',       'Selling my Surface Pro 8 (i5, 8GB, 256GB) with Type Cover. Used for 6 months, perfect for notes and coding. Comes with original charger.', 55000.00, 'electronics', 'aditya@iiita.ac.in', 'available'),
    (2, 3, 'Cracking the Coding Interview — 6th Edition', 'The must-have book for Microsoft/Google interviews. Slightly highlighted, otherwise in great condition.', 350.00, 'books', 'priya@iiita.ac.in', 'available'),
    (3, 4, 'Xbox Controller — Carbon Black',              'Original Microsoft Xbox wireless controller. Works with PC via Bluetooth. Selling because I switched to PlayStation.', 3500.00, 'electronics', 'rahul@iiita.ac.in', 'available'),
    (4, 5, 'CLRS — Introduction to Algorithms',           'The legendary CLRS textbook. 3rd Edition, hardcover. Essential for DSA prep. Minor wear on cover.', 500.00, 'books', 'sneha@iiita.ac.in', 'available'),
    (5, 2, 'Logitech MX Master 3S Mouse',                 'Premium wireless mouse, great for coding. Used for 4 months only. Selling because I got a Microsoft Arc Mouse as a gift.', 5500.00, 'electronics', 'aditya@iiita.ac.in', 'available'),
    (6, 3, 'Study Table with Lamp',                       'Wooden study table with attached LED lamp. Perfect condition, selling because I''m moving hostels.', 1500.00, 'furniture', 'priya@iiita.ac.in', 'sold'),
    (7, 4, 'Microsoft 365 Family — 1 Year License',       'Unused Microsoft 365 Family license code (up to 6 users). Includes Word, Excel, PowerPoint, 1TB OneDrive. Got it as a gift but I use the student plan.', 3000.00, 'other', 'rahul@iiita.ac.in', 'available');

-- ── Seed Notifications ──
INSERT IGNORE INTO notifications (id, user_id, title, message, read_status) VALUES
    (1, 2, '🎯 New Placement Drive', 'Microsoft is hiring Software Engineers — Deadline: Oct 15. Apply now!', 0),
    (2, 2, '📢 New Announcement',    'Azure Workshop scheduled for Sept 28 in LHC-301. Don''t miss it!', 0),
    (3, 3, '🎯 New Placement Drive', 'Microsoft Azure Cloud Intern positions open — Deadline: Oct 1.', 0),
    (4, 4, '🎯 New Placement Drive', 'Google SDE Intern — Deadline: Oct 10. Check the placement portal.', 0),
    (5, 5, '📢 New Announcement',    'Microsoft Imagine Cup campus round on Oct 8. Register your team!', 0);
