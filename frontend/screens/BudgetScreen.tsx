// Budget screen - set and view monthly budget
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BudgetContext } from '../context/BudgetContext';
import { ExpenseContext } from '../context/ExpenseContext';
import { RootStackParamList } from '../types';

type BudgetScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Budget'>;

interface Props {
  navigation: BudgetScreenNavigationProp;
}

const BudgetScreen: React.FC<Props> = ({ navigation }) => {
  const budgetContext = useContext(BudgetContext);
  const expenseContext = useContext(ExpenseContext);
  
  if (!budgetContext) throw new Error('BudgetContext not found');
  if (!expenseContext) throw new Error('ExpenseContext not found');
  
  const { currentBudget, loading, setBudget, refreshBudget } = budgetContext;
  const [amount, setAmount] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    refreshBudget();
  }, []);

  useEffect(() => {
    if (currentBudget?.budget) {
      setAmount(currentBudget.budget.amount.toString());
    }
  }, [currentBudget]);

  const handleSetBudget = async (): Promise<void> => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    setSaving(true);
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    const result = await setBudget(month, year, parseFloat(amount));
    setSaving(false);

    if (result.success) {
      Alert.alert('Success', 'Budget set successfully!');
      await refreshBudget();
    } else {
      Alert.alert('Error', result.message || 'Failed to set budget');
    }
  };

  const formatAmount = (value: number): string => {
    return `₹${value.toFixed(2)}`;
  };

  const getProgressPercentage = (): number => {
    if (!currentBudget?.budget || currentBudget.currentSpending === 0) return 0;
    return Math.min((currentBudget.currentSpending / currentBudget.budget.amount) * 100, 100);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Budget</Text>
        <Text style={styles.subtitle}>Set your spending limit for this month</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <>
          {/* Current Budget Status */}
          {currentBudget?.budget && (
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>Current Month Budget</Text>
                <Text style={styles.statusAmount}>{formatAmount(currentBudget.budget.amount)}</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${getProgressPercentage()}%`,
                        backgroundColor: currentBudget.isOverBudget ? '#ef4444' : '#10b981'
                      }
                    ]} 
                  />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>Spent</Text>
                  <Text style={[
                    styles.progressValue,
                    currentBudget.isOverBudget && styles.overBudgetText
                  ]}>
                    {formatAmount(currentBudget.currentSpending)}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={[
                    styles.statValue,
                    currentBudget.remaining < 0 && styles.overBudgetText
                  ]}>
                    {formatAmount(currentBudget.remaining)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Status</Text>
                  <Text style={[
                    styles.statValue,
                    currentBudget.isOverBudget ? styles.overBudgetText : styles.underBudgetText
                  ]}>
                    {currentBudget.isOverBudget ? '⚠️ Over Budget' : '✅ On Track'}
                  </Text>
                </View>
              </View>

              {currentBudget.isOverBudget && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    ⚠️ You've exceeded your budget by {formatAmount(Math.abs(currentBudget.remaining))}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Set Budget Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {currentBudget?.budget ? 'Update Budget' : 'Set Monthly Budget'}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Budget Amount (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter monthly budget"
                placeholderTextColor="#94a3b8"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleSetBudget}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {currentBudget?.budget ? 'Update Budget' : 'Set Budget'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Budget Tips</Text>
            <Text style={styles.infoText}>
              • Set a realistic monthly budget based on your income{'\n'}
              • Track your expenses regularly{'\n'}
              • You'll receive notifications when approaching or exceeding your budget{'\n'}
              • Budget resets each month automatically
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  statusAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  overBudgetText: {
    color: '#ef4444',
  },
  underBudgetText: {
    color: '#10b981',
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  warningText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});

export default BudgetScreen;

