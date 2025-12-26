// Budget context with TypeScript
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import api from '../utils/api';
import { Budget, BudgetWithStats } from '../types';

interface BudgetContextType {
  currentBudget: BudgetWithStats | null;
  loading: boolean;
  setBudget: (month: number, year: number, amount: number) => Promise<{ success: boolean; message?: string; budget?: BudgetWithStats }>;
  getBudget: (month?: number, year?: number) => Promise<{ success: boolean; data?: BudgetWithStats; message?: string }>;
  updateBudget: (id: string, amount: number) => Promise<{ success: boolean; message?: string }>;
  deleteBudget: (id: string) => Promise<{ success: boolean; message?: string }>;
  refreshBudget: () => Promise<void>;
}

export const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

interface BudgetProviderProps {
  children: ReactNode;
}

// Budget context provider - manages budget data and operations
export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const { user } = useContext(AuthContext)!;
  const [currentBudget, setCurrentBudget] = useState<BudgetWithStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load current month's budget when user is logged in
  useEffect(() => {
    if (user) {
      loadCurrentBudget();
    }
  }, [user]);

  // Load current month's budget
  const loadCurrentBudget = async (): Promise<void> => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      await getBudget(month, year);
    } catch (error) {
      console.error('Error loading current budget:', error);
    }
  };

  // Get budget for a specific month/year
  const getBudget = async (month?: number, year?: number): Promise<{ success: boolean; data?: BudgetWithStats; message?: string }> => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (month) params.month = month;
      if (year) params.year = year;

      const response = await api.get<BudgetWithStats>('/budget', { params });
      const budgetData = response.data;
      
      setCurrentBudget(budgetData);
      return { success: true, data: budgetData };
    } catch (error: any) {
      console.error('Error getting budget:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to load budget' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Set or update budget for a month/year
  const setBudget = async (month: number, year: number, amount: number): Promise<{ success: boolean; message?: string; budget?: BudgetWithStats }> => {
    try {
      setLoading(true);
      const response = await api.post<{ budget: BudgetWithStats }>('/budget', { month, year, amount });
      const budgetData = response.data.budget;
      
      setCurrentBudget(budgetData);
      return { success: true, budget: budgetData };
    } catch (error: any) {
      console.error('Error setting budget:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to set budget' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Update existing budget
  const updateBudget = async (id: string, amount: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put<{ budget: BudgetWithStats }>(`/budget/${id}`, { amount });
      const budgetData = response.data.budget;
      
      setCurrentBudget(budgetData);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update budget' 
      };
    }
  };

  // Delete budget
  const deleteBudget = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.delete(`/budget/${id}`);
      
      // If deleted budget was current, clear it
      if (currentBudget?.budget?._id === id) {
        setCurrentBudget(null);
      }
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete budget' 
      };
    }
  };

  // Refresh current budget
  const refreshBudget = async (): Promise<void> => {
    await loadCurrentBudget();
  };

  return (
    <BudgetContext.Provider value={{
      currentBudget,
      loading,
      setBudget,
      getBudget,
      updateBudget,
      deleteBudget,
      refreshBudget
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

