// Offline expense sync functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { Expense, OfflineExpense } from '../types';

const OFFLINE_EXPENSES_KEY = 'offline_expenses';

// Save expense to offline queue when network is unavailable
export const saveOfflineExpense = async (expenseData: Omit<Expense, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<OfflineExpense> => {
  try {
    const offlineExpenses = await getOfflineExpenses();
    const expenseWithId: OfflineExpense = {
      ...expenseData,
      _id: `offline_${Date.now()}`,
      userId: '', // Will be set by backend
      isOffline: true
    };
    offlineExpenses.push(expenseWithId);
    await AsyncStorage.setItem(OFFLINE_EXPENSES_KEY, JSON.stringify(offlineExpenses));
    return expenseWithId;
  } catch (error) {
    console.error('Error saving offline expense:', error);
    throw error;
  }
};

// Get all offline expenses
export const getOfflineExpenses = async (): Promise<OfflineExpense[]> => {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

// Sync offline expenses to backend
export const syncOfflineExpenses = async (): Promise<{ synced: number; remaining: number }> => {
  try {
    const offlineExpenses = await getOfflineExpenses();
    if (offlineExpenses.length === 0) return { synced: 0, remaining: 0 };

    const syncedIds: string[] = [];
    
    // Try to sync each expense
    for (const expense of offlineExpenses) {
      try {
        const { isOffline, _id, userId, ...expenseData } = expense;
        await api.post('/expenses', expenseData);
        syncedIds.push(_id);
      } catch (error) {
        // If sync fails, keep it in queue
        console.error('Failed to sync expense:', error);
      }
    }

    // Remove synced expenses from queue
    const remaining = offlineExpenses.filter(exp => !syncedIds.includes(exp._id));
    await AsyncStorage.setItem(OFFLINE_EXPENSES_KEY, JSON.stringify(remaining));

    return { synced: syncedIds.length, remaining: remaining.length };
  } catch (error) {
    console.error('Error syncing offline expenses:', error);
    throw error;
  }
};

// Clear offline expenses queue
export const clearOfflineExpenses = async (): Promise<void> => {
  await AsyncStorage.removeItem(OFFLINE_EXPENSES_KEY);
};


