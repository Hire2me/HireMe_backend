const jwt = require('jsonwebtoken');
const Artisan = require('../models/artisan.model');
const dotenv = require('dotenv');
dotenv.config();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        message: 'Access token required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // FIX: Use decoded.id directly since tokens use "id" field
    const user = await Artisan.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // FIX: Use decoded.id instead of conditional check
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired'
      });
    }
    
    console.error('Authentication error:', error.message);
    return res.status(403).json({
      message: 'Invalid token'
    });
  }
};

// Optional: Keep if using session-based auth alongside JWT
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
};

module.exports = { authenticateToken, isAuthenticated };