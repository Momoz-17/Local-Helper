const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, // Prevents "User@gmail.com" and "user@gmail.com" being different
    trim: true 
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'provider'], required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date }
}, { 
  timestamps: true // Useful for sorting users by "newest member"
});

module.exports = mongoose.model('User', UserSchema);