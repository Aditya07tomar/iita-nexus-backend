const jwt = require('jsonwebtoken');

/**
 * Middleware: Protect routes by verifying JWT tokens.
 * Extracts user data from the token and attaches it to req.user.
 */
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user info (id, role) to the request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token expired or invalid' });
    }
};

/**
 * Middleware: Role-Based Access Control (RBAC).
 * Restricts route access to specific roles.
 * Usage: authorize(2) → only role_id 2 (admin) can access.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role ${req.user?.role} is not authorized for this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };