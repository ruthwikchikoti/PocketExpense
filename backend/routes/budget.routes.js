const express = require('express');
const router = express.Router();
const Budget = require('../models/budget.model');
const Expense = require('../models/expense.model');
const authenticate = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Create or update monthly budget
router.post('/', async (req, res) => {
  try {
    const { month, year, amount } = req.body;

    // Validate required fields
    if (!month || !year || amount === undefined) {
      return res.status(400).json({ message: 'Month, year, and amount are required' });
    }

    // Validate month range
    if (month < 1 || month > 12) {
      return res.status(400).json({ message: 'Month must be between 1 and 12' });
    }

    // Validate amount
    if (amount < 0) {
      return res.status(400).json({ message: 'Budget amount must be positive' });
    }

    // Find or create budget for the month/year
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, month, year },
      { amount },
      { new: true, upsert: true, runValidators: true }
    );

    // Calculate current spending for the month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const currentSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = budget.amount - currentSpending;
    const isOverBudget = currentSpending > budget.amount;

    res.status(201).json({
      message: 'Budget set successfully',
      budget: {
        ...budget.toObject(),
        currentSpending,
        remaining,
        isOverBudget
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Budget already exists for this month. Use PUT to update.' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get budget for a specific month
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const budget = await Budget.findOne({
      userId: req.user._id,
      month: targetMonth,
      year: targetYear
    });

    if (!budget) {
      return res.json({
        budget: null,
        currentSpending: 0,
        remaining: 0,
        isOverBudget: false
      });
    }

    // Calculate current spending for the month
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const currentSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = budget.amount - currentSpending;
    const isOverBudget = currentSpending > budget.amount;

    res.json({
      budget,
      currentSpending,
      remaining,
      isOverBudget
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update budget
router.put('/:id', async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || amount < 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Calculate current spending
    const startOfMonth = new Date(budget.year, budget.month - 1, 1);
    const endOfMonth = new Date(budget.year, budget.month, 0, 23, 59, 59);
    
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const currentSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = budget.amount - currentSpending;
    const isOverBudget = currentSpending > budget.amount;

    res.json({
      message: 'Budget updated successfully',
      budget: {
        ...budget.toObject(),
        currentSpending,
        remaining,
        isOverBudget
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all budgets for user
router.get('/all', async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id })
      .sort({ year: -1, month: -1 });

    res.json({ budgets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

