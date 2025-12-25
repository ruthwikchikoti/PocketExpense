// Script to delete all users from the database
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/user.model');
const Expense = require('../models/expense.model');

// Connect to database and delete all users
const deleteAllUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pocket-expense';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get count of users before deletion
    const userCount = await User.countDocuments();
    console.log(`📊 Found ${userCount} user(s) in database`);

    if (userCount === 0) {
      console.log('ℹ️  No users to delete');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Get all user IDs
    const users = await User.find({}, '_id email');
    const userIds = users.map(user => user._id);
    
    console.log('\n📋 Users to be deleted:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user._id})`);
    });

    // Delete all expenses associated with these users
    const expenseResult = await Expense.deleteMany({ userId: { $in: userIds } });
    console.log(`\n🗑️  Deleted ${expenseResult.deletedCount} expense(s) associated with all users`);

    // Delete all users
    const userResult = await User.deleteMany({});
    console.log(`✅ Successfully deleted ${userResult.deletedCount} user(s)`);

    // Verify deletion
    const remainingUsers = await User.countDocuments();
    const remainingExpenses = await Expense.countDocuments();
    
    console.log('\n📊 Final status:');
    console.log(`   Users remaining: ${remainingUsers}`);
    console.log(`   Expenses remaining: ${remainingExpenses}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error deleting users:', error.message);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
deleteAllUsers();

