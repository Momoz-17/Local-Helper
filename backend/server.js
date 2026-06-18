const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// --- 1. Middleware Configuration ---
app.use(cors({
  // Allows both your live Render frontend and local Vite dev environment simultaneously
  origin: [
    'https://finance-tracker-frontend-7d2q.onrender.com', 
    'http://localhost:5173'
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with buffer limits
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy header — Required for secure cross-origin cookie tracking behind Render's load balancers
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// --- 2. Route Definitions ---
// Update these paths if your main transaction routes use different filenames
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// --- 3. Database Connection ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

connectDB();

// --- 4. Health Check & Base Routes ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

app.get('/', (req, res) => {
  res.send("Finance Tracker API is running...");
});

// --- 5. Global Error Handling Middleware ---
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

process.on('unhandledRejection', (err, promise) => {
  console.log(`Logged Error: ${err}`);
  server.close(() => process.exit(1));
});