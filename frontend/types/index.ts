// Type definitions for the app

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  category: string;
  paymentMethod: string;
  description?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfflineExpense extends Expense {
  isOffline: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ExpenseStats {
  total: number;
  count: number;
  expenses: Expense[];
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface Insights {
  currentMonth: ExpenseStats;
  previousMonth: ExpenseStats;
  overallChange: number;
  categoryInsights: CategoryInsight[];
}

export interface CategoryInsight {
  category: string;
  current: number;
  previous: number;
  change: number;
}

export interface Budget {
  _id: string;
  userId: string;
  month: number;
  year: number;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetWithStats {
  budget: Budget | null;
  currentSpending: number;
  remaining: number;
  isOverBudget: boolean;
}

export interface BudgetWarning {
  message: string;
  isOverBudget: boolean;
  remaining: number;
}

export type ExpenseCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Bills' 
  | 'Entertainment' 
  | 'Health' 
  | 'Education' 
  | 'Other';

export type PaymentMethod = 
  | 'Cash' 
  | 'Card' 
  | 'UPI' 
  | 'Online' 
  | 'Other';

// Navigation types
export type RootStackParamList = {
  Loading: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  AddExpense: undefined;
  EditExpense: { expense: Expense };
  Budget: undefined;
  Notifications: undefined;
};

