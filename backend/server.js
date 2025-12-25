const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allow frontend to access API
app.use(express.json()); // Parse JSON request bodies

// Database connection with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pocket-expense';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n💡 To fix this:');
    console.log('   1. Start MongoDB: sudo systemctl start mongod (or mongodb)');
    console.log('   2. Or use MongoDB Atlas (cloud): Update MONGODB_URI in .env');
    console.log('   3. Or install MongoDB: https://www.mongodb.com/try/download/community\n');
    // Don't exit - let the server start anyway for development
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/expenses', require('./routes/expense.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PocketExpense+ API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

