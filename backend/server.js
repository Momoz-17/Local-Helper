const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// --- 1. Middleware Configuration ---
app.use(cors({
  // Direct production URL fallback ensuring cross-origin cookies work smoothly on Render
  origin: process.env.FRONTEND_URL || 'https://finance-tracker-frontend-7d2q.onrender.com', 
  credentials: true 
}));

// Increased limit slightly for potential image base64 strings in profiles
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy header — Crucial for reading cookies securely when deployed on Render behind a reverse proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// --- 2. Route Definitions ---
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// --- 3. Database Connection ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    // Exit process with failure if DB connection fails
    process.exit(1);
  }
};

connectDB();

// --- 4. Health Check & Base Routes ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

app.get('/', (req, res) => {
  res.send("Community Connect API is running...");
});

// --- 5. Global Error Handling Middleware ---
// This prevents the server from leaking technical stack traces to the user
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// --- 6. Server Initialization ---
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections (e.g. secret keys missing)
process.on('unhandledRejection', (err, promise) => {
  console.log(`Logged Error: ${err}`);
  server.close(() => process.exit(1));
});