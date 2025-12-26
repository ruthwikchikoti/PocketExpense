// Main app component - wraps app with context providers
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { BudgetProvider } from './context/BudgetContext';
import { NotificationProvider } from './context/NotificationContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <BudgetProvider>
          <NotificationProvider>
            <AppNavigator />
          </NotificationProvider>
        </BudgetProvider>
      </ExpenseProvider>
    </AuthProvider>
  );
}
