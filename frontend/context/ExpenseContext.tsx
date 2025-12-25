// Expense context with TypeScript
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import api from '../utils/api';
import { saveOfflineExpense, syncOfflineExpenses, getOfflineExpenses } from '../utils/offlineSync';
import { Expense, OfflineExpense, ExpenseStats, CategoryBreakdown, Insights } from '../types';

interface ExpenseContextType {
  expenses: Expense[];
  offlineExpenses: OfflineExpense[];
  loading: boolean;
  loadExpenses: () => Promise<void>;
  addExpense: (expenseData: Omit<Expense, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; expense?: Expense | OfflineExpense; offline?: boolean; message?: string }>;
  updateExpense: (id: string, expenseData: Partial<Expense>) => Promise<{ success: boolean; expense?: Expense; message?: string }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; message?: string }>;
  getStats: (type: 'daily' | 'monthly' | 'categories' | 'insights', params?: Record<string, any>) => Promise<{ success: boolean; data?: any; message?: string }>;
}

export const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

interface ExpenseProviderProps {
  children: ReactNode;
}

// Expense context provider - manages expense data and operations
export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const { user } = useContext(AuthContext)!;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [offlineExpenses, setOfflineExpenses] = useState<OfflineExpense[]>([]);

  // Load expenses when user is logged in
  useEffect(() => {
    if (user) {
      loadExpenses();
      loadOfflineExpenses();
      syncOfflineExpenses(); // Try to sync offline expenses
    }
  }, [user]);

  // Load offline expenses from AsyncStorage
  const loadOfflineExpenses = async (): Promise<void> => {
    const offline = await getOfflineExpenses();
    setOfflineExpenses(offline);
  };

  // Fetch all expenses from backend
  const loadExpenses = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get<{ expenses: Expense[] }>('/expenses');
      const expensesData = response.data.expenses || [];
      
      // Sort by createdAt to ensure newest first (in case backend doesn't sort correctly)
      const sortedExpenses = [...expensesData].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        return dateB - dateA; // Newest first
      });
      
      setExpenses(sortedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new expense (with offline support)
  const addExpense = async (expenseData: Omit<Expense, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; expense?: Expense | OfflineExpense; offline?: boolean; message?: string }> => {
    try {
      // Try to add to backend first
      const response = await api.post<{ expense: Expense }>('/expenses', expenseData);
      const newExpense = response.data.expense;
      
      // Validate the response has correct data
      if (!newExpense || !newExpense._id) {
        throw new Error('Invalid expense data received from server');
      }
      
      // Add the new expense to the list (at the top - newest first)
      setExpenses(prev => {
        // Check if expense already exists (avoid duplicates)
        const exists = prev.some(exp => exp._id === newExpense._id);
        if (exists) {
          return prev;
        }
        // Add new expense at the beginning (newest first)
        const updated = [newExpense, ...prev];
        // Sort by createdAt to ensure correct order (newest first)
        const sorted = updated.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0).getTime();
          const dateB = new Date(b.createdAt || b.date || 0).getTime();
          return dateB - dateA; // Newest first
        });
        return sorted;
      });
      
      return { success: true, expense: newExpense };
    } catch (error: any) {
      // If offline, save to local storage
      if (!error.response) {
        const offlineExpense = await saveOfflineExpense(expenseData);
        setOfflineExpenses(prev => [...prev, offlineExpense]);
        return { success: true, expense: offlineExpense, offline: true };
      }
      return { success: false, message: error.response?.data?.message || 'Failed to add expense' };
    }
  };

  // Update existing expense
  const updateExpense = async (id: string, expenseData: Partial<Expense>): Promise<{ success: boolean; expense?: Expense; message?: string }> => {
    try {
      const response = await api.put<{ expense: Expense }>(`/expenses/${id}`, expenseData);
      const updatedExpense = response.data.expense;
      setExpenses(prev => prev.map(exp => exp._id === id ? updatedExpense : exp));
      return { success: true, expense: updatedExpense };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to update expense' };
    }
  };

  // Delete expense
  const deleteExpense = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(exp => exp._id !== id));
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete expense' };
    }
  };

  // Get statistics
  const getStats = async (type: 'daily' | 'monthly' | 'categories' | 'insights', params: Record<string, any> = {}): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await api.get(`/expenses/stats/${type}`, { params });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to load statistics' };
    }
  };

  return (
    <ExpenseContext.Provider value={{
      expenses,
      offlineExpenses,
      loading,
      loadExpenses,
      addExpense,
      updateExpense,
      deleteExpense,
      getStats
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

