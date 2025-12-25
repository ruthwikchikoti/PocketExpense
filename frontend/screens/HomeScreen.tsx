// Home screen - displays list of expenses
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ExpenseContext } from '../context/ExpenseContext';
import { AuthContext } from '../context/AuthContext';
import { Expense, RootStackParamList } from '../types';

type TabParamList = {
  Home: undefined;
  Insights: undefined;
};

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const expenseContext = useContext(ExpenseContext);
  const authContext = useContext(AuthContext);
  
  if (!expenseContext) throw new Error('ExpenseContext not found');
  if (!authContext) throw new Error('AuthContext not found');
  
  const { expenses, loading, loadExpenses, deleteExpense } = expenseContext;
  const { user } = authContext;
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  // Reload expenses when screen comes into focus (after adding new expense)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Small delay to ensure backend has processed any new expenses
      setTimeout(() => {
      loadExpenses();
      }, 100);
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const handleDelete = async (id: string): Promise<void> => {
    const result = await deleteExpense(id);
    if (result.success) {
      loadExpenses();
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Food': '#fef3c7',        // Yellow background for food
      'Transport': '#dbeafe',   // Blue background for transport
      'Shopping': '#e9d5ff',    // Purple background for shopping
      'Entertainment': '#fed7aa', // Orange background for entertainment
      'Bills': '#d1fae5',       // Green background for bills
      'Health': '#cffafe',      // Cyan background for health
      'Education': '#fef08a',   // Yellow background for education
      'Other': '#f3f4f6'        // Gray background for other
    };
    return colors[category] || '#f3f4f6';
  };

  const getCategoryEmoji = (category: string): string => {
    const emojis: { [key: string]: string } = {
      'Food': '🍔',
      'Transport': '🚕',
      'Shopping': '🛒',
      'Entertainment': '🎮',
      'Bills': '⚡',
      'Health': '💊',
      'Education': '📖',
      'Other': '📋'
    };
    return emojis[category] || '📋';
  };

  if (loading && expenses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.headerTitle}>{user?.name}!</Text>
          </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddExpense')}
            activeOpacity={0.8}
        >
            <Text style={styles.addButtonIcon}>+</Text>
        </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <View style={styles.expenseCount}>
            <Text style={styles.expenseCountText}>{expenses.length}</Text>
          </View>
        </View>

      {expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>📊</Text>
            </View>
          <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>Start tracking your spending by adding your first expense</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddExpense')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Add Your First Expense</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item._id}
          refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6366f1']}
                tintColor="#6366f1"
              />
          }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.expenseCard}
              onPress={() => navigation.navigate('EditExpense', { expense: item })}
                  activeOpacity={0.7}
            >
              <View style={styles.expenseHeader}>
                    <View style={styles.categoryContainer}>
                      <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.category) }]}>
                        <Text style={styles.categoryIconText}>{getCategoryEmoji(item.category)}</Text>
                      </View>
                      <View>
                <Text style={styles.expenseCategory}>{item.category}</Text>
                        <Text style={styles.expenseMethod}>{item.paymentMethod}</Text>
                      </View>
                    </View>
                <Text style={styles.expenseAmount}>{formatAmount(item.amount)}</Text>
              </View>
              {item.description && (
                <Text style={styles.expenseDescription}>{item.description}</Text>
              )}
              <View style={styles.expenseFooter}>
                <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#e0e7ff',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonIcon: {
    fontSize: 24,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  expenseCount: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expenseCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  expenseCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 16,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  expenseMethod: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;

