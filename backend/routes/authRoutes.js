const express = require('express');
const router = express.Router();
const { 
  register, 
  verifyOTP, 
  login, 
  logout, 
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/logout', logout);

// Private Route: Used by the frontend to restore session on page refresh
router.get('/me', protect, getMe);

module.exports = router;