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
    ('Google',     'SDE Intern',         '₹80,000/month', '2026-07-15', 'Bangalore', 'Open'),
    ('Microsoft',  'Software Engineer',  '₹18 LPA',       '2026-07-01', 'Hyderabad', 'Open'),
    ('Amazon',     'SDE-1',              '₹22 LPA',       '2026-06-20', 'Bangalore', 'Closed');

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

