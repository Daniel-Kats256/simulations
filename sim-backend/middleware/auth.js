const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

// Middleware to verify the JWT and attach the user to the request
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user info to request object
    req.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to restrict access by user roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient rights' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
