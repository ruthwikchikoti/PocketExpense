// Script to delete a user by email
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/user.model');
const Expense = require('../models/expense.model');

// Get email from command line argument or use default
const EMAIL_TO_DELETE = process.argv[2] || 'test@gmail.com';

// Connect to database and delete user
const deleteUser = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pocket-expense';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: EMAIL_TO_DELETE.toLowerCase().trim() });
    
    if (!user) {
      console.log(`❌ User with email "${EMAIL_TO_DELETE}" not found`);
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`📋 Found user: ${user.name} (${user.email})`);
    console.log(`   User ID: ${user._id}`);

    // Delete all expenses associated with this user
    const expenseResult = await Expense.deleteMany({ userId: user._id });
    console.log(`🗑️  Deleted ${expenseResult.deletedCount} expense(s) associated with this user`);

    // Delete the user
    await User.findByIdAndDelete(user._id);
    console.log(`✅ Successfully deleted user: ${user.email}`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
deleteUser();

