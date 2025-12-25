// API configuration and constants
import { ExpenseCategory, PaymentMethod } from '../types';

export const API_URL = 'http://localhost:5000/api';

// For Android emulator, use: 'http://10.0.2.2:5000/api'
// For iOS simulator, use: 'http://localhost:5000/api'
// For physical device, use your computer's IP: 'http://192.168.x.x:5000/api'

export const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other'
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Card',
  'UPI',
  'Online',
  'Other'
];


