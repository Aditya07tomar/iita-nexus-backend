const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * POST /api/auth/register
 * Create a new user account with hashed password.
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password, roll_no, role_id } = req.body;

        // 1. Check if user already exists
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Hash the password (Don't store plain text!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insert into Database
        await db.execute(
            'INSERT INTO users (name, email, password, roll_no, role_id) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, roll_no, role_id || 1] // Default to role 1 (Student)
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token.
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find User
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const user = users[0];

        // 2. Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 3. Create JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role_id }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/auth/forgot-password
 * Generate a password reset token and return it.
 * In production, this would send an email. For now, returns the token directly.
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // 1. Check if user exists
        const [users] = await db.execute('SELECT id, name FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Don't reveal whether user exists (security best practice)
            return res.json({ message: "If this email is registered, a reset link has been sent." });
        }

        const userId = users[0].id;

        // 2. Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // 3. Set expiry to 15 minutes from now
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // 4. Invalidate any existing tokens for this user
        await db.execute(
            'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0',
            [userId]
        );

        // 5. Store the new token
        await db.execute(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, resetToken, expiresAt]
        );

        // In production: send email with reset link
        // For dev/demo: return the token directly
        res.json({
            message: "If this email is registered, a reset link has been sent.",
            // DEV ONLY — remove in production
            resetToken,
            resetLink: `/reset-password?token=${resetToken}`
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/auth/reset-password
 * Reset password using a valid reset token.
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // 1. Find the token in the database
        const [tokens] = await db.execute(
            'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0',
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const resetRecord = tokens[0];

        // 2. Check if token has expired
        if (new Date() > new Date(resetRecord.expires_at)) {
            await db.execute('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [resetRecord.id]);
            return res.status(400).json({ message: "Reset token has expired. Please request a new one." });
        }

        // 3. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update the user's password
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetRecord.user_id]);

        // 5. Mark the token as used
        await db.execute('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [resetRecord.id]);

        res.json({ message: "Password has been reset successfully. You can now login." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};