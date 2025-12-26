const express = require('express');
const router = express.Router();
const Expense = require('../models/expense.model');
const Budget = require('../models/budget.model');
const authenticate = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Create new expense
router.post('/', async (req, res) => {
  try {
    const { amount, category, paymentMethod, description, date } = req.body;

    // Validate required fields
    if (!amount || !category || !paymentMethod) {
      return res.status(400).json({ message: 'Amount, category, and payment method are required' });
    }

    const expenseDate = date ? new Date(date) : new Date();
    
    // Check budget for the month
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();
    const budget = await Budget.findOne({ userId: req.user._id, month, year });

    let budgetWarning = null;
    if (budget) {
      // Calculate current spending including this new expense
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      
      const existingExpenses = await Expense.find({
        userId: req.user._id,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const currentSpending = existingExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const newTotal = currentSpending + amount;
      const remaining = budget.amount - newTotal;
      const isOverBudget = newTotal > budget.amount;
      const percentageUsed = (newTotal / budget.amount) * 100;

      // Show warning at different thresholds
      if (isOverBudget) {
        budgetWarning = {
          message: `⚠️ Budget exceeded! You've spent ₹${newTotal.toFixed(2)} of ₹${budget.amount.toFixed(2)} (${percentageUsed.toFixed(1)}%)\n\nYou are ₹${Math.abs(remaining).toFixed(2)} over your budget limit.`,
          isOverBudget: true,
          remaining: remaining
        };
      } else if (remaining < budget.amount * 0.05) {
        // Warn when less than 5% remaining
        budgetWarning = {
          message: `⚠️ Budget almost exhausted! Only ₹${remaining.toFixed(2)} remaining (${(100 - percentageUsed).toFixed(1)}% left)`,
          isOverBudget: false,
          remaining: remaining
        };
      } else if (remaining < budget.amount * 0.1) {
        // Warn when less than 10% remaining
        budgetWarning = {
          message: `⚠️ Budget running low! Only ₹${remaining.toFixed(2)} remaining (${(100 - percentageUsed).toFixed(1)}% left)`,
          isOverBudget: false,
          remaining: remaining
        };
      } else if (percentageUsed >= 0.75) {
        // Warn when 75% or more used
        budgetWarning = {
          message: `💡 Budget alert: You've used ${percentageUsed.toFixed(1)}% of your budget. ₹${remaining.toFixed(2)} remaining.`,
          isOverBudget: false,
          remaining: remaining
        };
      }
    }

    // Create expense linked to authenticated user
    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      category,
      paymentMethod,
      description,
      date: expenseDate
    });

    res.status(201).json({ 
      message: 'Expense added successfully', 
      expense,
      budgetWarning 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all expenses for logged-in user
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const query = { userId: req.user._id };

    // Filter by date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Fetch expenses sorted by createdAt (newest first) to ensure recently added expenses appear at top
    const expenses = await Expense.find(query).sort({ createdAt: -1 });
    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expense by ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id // Ensure user owns this expense
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { amount, category, paymentMethod, description, date } = req.body;

    // Find and update expense (only if user owns it)
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount, category, paymentMethod, description, date },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id // Ensure user owns this expense
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get daily expenses summary
router.get('/stats/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Set to start and end of day
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get all expenses for the day
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // Calculate total
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({ date: startOfDay, total, count: expenses.length, expenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly expenses summary
router.get('/stats/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetDate = year && month ? new Date(year, month - 1) : new Date();
    
    // Get start and end of month
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // Get all expenses for the month
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Calculate total
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      month: targetDate.getMonth() + 1,
      year: targetDate.getFullYear(),
      total,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category-wise breakdown
router.get('/stats/categories', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    // Filter by date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get all expenses in date range
    const expenses = await Expense.find(query);

    // Group by category and calculate totals
    const categoryBreakdown = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = { category: exp.category, total: 0, count: 0 };
      }
      acc[exp.category].total += exp.amount;
      acc[exp.category].count += 1;
      return acc;
    }, {});

    res.json({ breakdown: Object.values(categoryBreakdown) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get spending insights (compare current month with previous month)
router.get('/stats/insights', async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get current month expenses
    const currentExpenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: currentMonth }
    });

    // Get previous month expenses
    const previousExpenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: previousMonth, $lte: endOfPreviousMonth }
    });

    // Calculate totals
    const currentTotal = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const previousTotal = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate percentage change
    const percentageChange = previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;

    // Category-wise comparison
    const categoryInsights = {};
    const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

    categories.forEach(category => {
      const currentCatTotal = currentExpenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      const previousCatTotal = previousExpenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.amount, 0);

      if (currentCatTotal > 0 || previousCatTotal > 0) {
        const catPercentageChange = previousCatTotal > 0
          ? ((currentCatTotal - previousCatTotal) / previousCatTotal) * 100
          : 0;

        categoryInsights[category] = {
          category,
          current: currentCatTotal,
          previous: previousCatTotal,
          change: catPercentageChange
        };
      }
    });

    res.json({
      currentMonth: {
        total: currentTotal,
        count: currentExpenses.length
      },
      previousMonth: {
        total: previousTotal,
        count: previousExpenses.length
      },
      overallChange: percentageChange,
      categoryInsights: Object.values(categoryInsights)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

