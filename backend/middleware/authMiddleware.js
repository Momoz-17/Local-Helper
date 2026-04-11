// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify the user is logged in
const protect = async (req, res, next) => {
  // 1. Grab the token from cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token found" });
  }

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user and attach to the request object
    // CRITICAL FIX: We must check if the user actually exists in the DB
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Token failed or expired" });
  }
};

// Verify the user has a specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user object exists and if their role is in the allowed list
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role (${req.user?.role || 'unknown'}) is not authorized` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };