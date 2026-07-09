const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configure Nodemailer with strict local development configurations
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ FIXED: Set cross-site production properties for Render domains
const setTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  const isProduction = process.env.NODE_ENV === 'production' || true; // Set to true explicitly for cross-domain staging
  
  res.cookie('token', token, {
    httpOnly: true, 
    secure: true, // Must be true over HTTPS/Render
    sameSite: 'none', // Must be 'none' to travel across different domain handles
    maxAge: 86400000 
  });
};

// 1. REGISTER & SEND OTP
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    
    let user = await User.findOne({ email: cleanEmail });
    if (user && user.isVerified) return res.status(400).json({ message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.role = role;
      user.phone = phone;
      user.address = address;
      user.otpExpires = Date.now() + 10 * 60 * 1000; 
    } else {
      user = new User({ 
        name, 
        email: cleanEmail, 
        password: hashedPassword, 
        role, 
        phone,
        address,
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000 
      });
    }

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: cleanEmail,
      subject: "Your Community Connect Verification Code",
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail, otp: otp.trim() });

    if (!user) return res.status(400).json({ message: "Invalid OTP or user not found" });

    if (user.otpExpires && user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }

    user.isVerified = true;
    user.otp = undefined; 
    user.otpExpires = undefined;
    await user.save();

    setTokenCookie(res, user._id);

    res.status(200).json({ 
      user: { 
        id: user._id,
        name: user.name, 
        role: user.role, 
        email: user.email,
        phone: user.phone,
        address: user.address
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) return res.status(404).json({ message: "User account not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({ 
        isVerified: false, 
        message: "Account unverified. An OTP has been generated, redirecting to verification page..." 
      });
    }

    setTokenCookie(res, user._id);

    res.status(200).json({ 
      user: { 
        id: user._id,
        name: user.name, 
        role: user.role, 
        email: user.email,
        phone: user.phone,
        address: user.address
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. LOGOUT
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'none', // ✅ Update to none to match login parameters
    secure: true
  });
  res.status(200).json({ message: "Logged out successfully" });
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "User not found" });

    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during auth check" });
  }
};