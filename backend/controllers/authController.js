const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to set the secure cookie
const setTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  res.cookie('token', token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax', // Changed from strict to 'lax' to ensure cookie persists during redirects
    maxAge: 86400000 
  });
};

// 1. REGISTER & SEND OTP
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    
    let user = await User.findOne({ email });
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
        email, 
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
      from: `"Community Connect" <${process.env.EMAIL_USER}>`,
      to: email,
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
    const user = await User.findOne({ email, otp });

    if (!user) return res.status(400).json({ message: "Invalid OTP or user not found" });

    if (user.otpExpires && user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }

    user.isVerified = true;
    user.otp = undefined; 
    user.otpExpires = undefined;
    await user.save();

    setTokenCookie(res, user._id);

    // Added 'id' to the response to match frontend expectations
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
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) return res.status(400).json({ message: "User not found or unverified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

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
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// 5. GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    // req.user is already populated by your protect middleware
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