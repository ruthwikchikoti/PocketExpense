const mongoose = require('mongoose');

// Budget schema - stores monthly budget limits for users
const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Index to ensure one budget per user per month/year
budgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);

