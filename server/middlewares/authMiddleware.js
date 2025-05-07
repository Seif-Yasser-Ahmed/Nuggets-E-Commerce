const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verify JWT token middleware
exports.verifyToken = (req, res, next) => {
    try {
        // Get token from the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Failed to authenticate token'
                });
            }

            // Add user info to request
            req.user = decoded;
            next();
        });
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Standard authentication for logged-in users
exports.authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};

// Alias for authenticate to maintain backwards compatibility
exports.authenticateToken = exports.authenticate;

// Restrict to admin users middleware
exports.isAdmin = async (req, res, next) => {
    try {
        // Verify if the user is admin
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin rights required'
            });
        }

        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        res.status(500).json({
            success: false,
            message: 'Admin authentication error'
        });
    }
};

// Combined middleware for admin authentication
exports.authenticateAdmin = [exports.authenticate, exports.isAdmin];

// Check if the user is the owner of the resource
exports.isOwner = async (req, res, next) => {
    try {
        const userId = req.params.id || req.params.userId;
        const currentUserId = req.user.id;

        if (userId !== currentUserId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only access your own resources'
            });
        }

        next();
    } catch (err) {
        console.error('Owner verification error:', err);
        res.status(500).json({
            success: false,
            message: 'Owner verification error'
        });
    }
};