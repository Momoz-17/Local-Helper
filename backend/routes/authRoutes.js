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

// --- Public Routes ---
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

// --- Protected Routes ---
// Moving logout under 'protect' ensures you can securely read the token before clearing it
router.post('/logout', protect, logout);

// Session recovery route for frontend initial mounting / refreshes
router.get('/me', protect, getMe);

module.exports = router;