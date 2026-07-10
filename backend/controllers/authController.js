const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../utils/mailer');

// Basic RFC-5322-ish email format check - catches typo domains like
// "gmail.con" before they ever hit the database.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Helper function to set the secure cookie
const setTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    // Frontend and backend live on different onrender.com subdomains,
    // which browsers treat as cross-site. Cross-site cookies REQUIRE
    // sameSite: 'none' + secure: true, or they are never sent back.
    secure: isProd ? true : false,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 86400000 
  });
};

// 1. REGISTER & SEND OTP
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

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

    // Dispatches OTP directly to user inbox
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: cleanEmail,
      subject: "Your Community Connect Verification Code",
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Failed to send verification email. Please try again in a moment.", error: err.message });
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
    res.status(500).json({ message: "Server error during verification.", error: err.message });
  }
};

// 3. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Explicit validation check separates users not found from those who are unverified
    if (!user) return res.status(404).json({ message: "User account not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Triggers custom 403 response catch block on the frontend to redirect seamlessly
    if (!user.isVerified) {
      // Previously this claimed "An OTP has been generated" without actually
      // sending one - the user was redirected to the OTP screen with no
      // email ever dispatched. Generate + send a fresh OTP here for real.
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000;
      await user.save();

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: cleanEmail,
          subject: "Your Community Connect Verification Code",
          text: `Your OTP is: ${otp}. It expires in 10 minutes.`
        });
      } catch (mailErr) {
        console.error("Login OTP resend failed:", mailErr);
        return res.status(500).json({ message: "Account is unverified and we couldn't send a new OTP right now. Please try again shortly." });
      }

      return res.status(403).json({ 
        isVerified: false, 
        message: "Account unverified. A new OTP has been sent to your email, redirecting to verification page..." 
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
    res.status(500).json({ message: "Server error during login.", error: err.message });
  }
};

// 4. LOGOUT
exports.logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    // Must match the attributes used when the cookie was set,
    // otherwise the browser won't recognize it as the same cookie to clear.
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd ? true : false
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// 5. GET CURRENT USER
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