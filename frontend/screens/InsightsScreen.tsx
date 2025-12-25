// Insights screen - shows spending analysis and category breakdown
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ExpenseContext } from '../context/ExpenseContext';
import { Insights, CategoryBreakdown } from '../types';

const InsightsScreen: React.FC = () => {
  const navigation = useNavigation();
  const expenseContext = useContext(ExpenseContext);
  if (!expenseContext) throw new Error('ExpenseContext not found');
  
  const { getStats } = expenseContext;
  const [insights, setInsights] = useState<Insights | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'insights' | 'categories'>('insights');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus (after adding/updating expenses)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Small delay to ensure backend has processed any updates
      setTimeout(() => {
        loadData();
      }, 100);
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    
    // Load insights (month comparison)
    const insightsResult = await getStats('insights');
    if (insightsResult.success && insightsResult.data) {
      setInsights(insightsResult.data as Insights);
    }

    // Load category breakdown
    const categoryResult = await getStats('categories');
    if (categoryResult.success && categoryResult.data) {
      setCategoryBreakdown(categoryResult.data as CategoryBreakdown);
    }

    setLoading(false);
  };

  const formatAmount = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getCategoryEmoji = (category: string): string => {
    const emojis: { [key: string]: string } = {
      'Food': '🍽️',
      'Transport': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills': '💡',
      'Health': '🏥',
      'Education': '📚',
      'Other': '📦'
    };
    return emojis[category] || '📦';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <Text style={styles.headerSubtitle}>Analyze your spending patterns</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'insights' && styles.activeTab]}
          onPress={() => setViewMode('insights')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabIcon, viewMode === 'insights' && styles.activeTabIcon]}>📈</Text>
          <Text style={[styles.tabText, viewMode === 'insights' && styles.activeTabText]}>
            Trends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'categories' && styles.activeTab]}
          onPress={() => setViewMode('categories')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabIcon, viewMode === 'categories' && styles.activeTabIcon]}>📊</Text>
          <Text style={[styles.tabText, viewMode === 'categories' && styles.activeTabText]}>
            Categories
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

      {viewMode === 'insights' && insights && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Comparison</Text>
          
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <Text style={styles.metricIconText}>📅</Text>
                </View>
                <Text style={styles.metricLabel}>This Month</Text>
                <Text style={styles.metricValue}>
              {formatAmount(insights.currentMonth.total)}
            </Text>
                <Text style={styles.metricSubtext}>
              {insights.currentMonth.count} expenses
            </Text>
          </View>

              <View style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <Text style={styles.metricIconText}>📆</Text>
                </View>
                <Text style={styles.metricLabel}>Last Month</Text>
                <Text style={styles.metricValue}>
              {formatAmount(insights.previousMonth.total)}
            </Text>
                <Text style={styles.metricSubtext}>
              {insights.previousMonth.count} expenses
            </Text>
          </View>

              <View style={[styles.metricCard, styles.changeCard]}>
                <View style={[styles.metricIcon, { backgroundColor: insights.overallChange >= 0 ? '#fee2e2' : '#dcfce7' }]}>
                  <Text style={styles.metricIconText}>
                    {insights.overallChange >= 0 ? '📈' : '📉'}
                  </Text>
                </View>
                <Text style={styles.metricLabel}>Change</Text>
            <Text style={[
                  styles.metricValue,
                  { color: insights.overallChange >= 0 ? '#dc2626' : '#16a34a' }
            ]}>
              {formatPercentage(insights.overallChange)}
            </Text>
                <Text style={styles.metricSubtext}>
                  {insights.overallChange >= 0 ? 'Increase' : 'Decrease'}
                </Text>
              </View>
          </View>

          {insights.categoryInsights && insights.categoryInsights.length > 0 && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Category Trends</Text>
              {insights.categoryInsights.map((item, index) => (
                <View key={index} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.category)}</Text>
                    <Text style={styles.categoryName}>{item.category}</Text>
                      </View>
                      <View style={[
                        styles.changeIndicator,
                        { backgroundColor: item.change >= 0 ? '#fee2e2' : '#dcfce7' }
                      ]}>
                    <Text style={[
                      styles.categoryChange,
                          { color: item.change >= 0 ? '#dc2626' : '#16a34a' }
                    ]}>
                      {formatPercentage(item.change)}
                    </Text>
                  </View>
                    </View>
                    <View style={styles.categoryAmounts}>
                      <View style={styles.amountItem}>
                        <Text style={styles.amountLabel}>Current</Text>
                        <Text style={styles.amountValue}>{formatAmount(item.current)}</Text>
                      </View>
                      <View style={styles.amountDivider} />
                      <View style={styles.amountItem}>
                        <Text style={styles.amountLabel}>Previous</Text>
                        <Text style={styles.amountValue}>{formatAmount(item.previous)}</Text>
                      </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {viewMode === 'categories' && categoryBreakdown && (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
          {categoryBreakdown.breakdown && categoryBreakdown.breakdown.length > 0 ? (
            categoryBreakdown.breakdown.map((item, index) => (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.category)}</Text>
                  <Text style={styles.categoryName}>{item.category}</Text>
                    </View>
                  <Text style={styles.categoryAmount}>
                    {formatAmount(item.total)}
                  </Text>
                </View>
                  <View style={styles.categoryStats}>
                <Text style={styles.categoryCount}>
                  {item.count} {item.count === 1 ? 'expense' : 'expenses'}
                </Text>
                    <Text style={styles.categoryAverage}>
                      Avg: {formatAmount(item.total / item.count)}
                    </Text>
                  </View>
              </View>
            ))
          ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No category data available</Text>
                <Text style={styles.emptySubtext}>Add some expenses to see insights</Text>
              </View>
          )}
        </View>
      )}
    </ScrollView>
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
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    fontWeight: '400',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  activeTabIcon: {
    color: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  changeCard: {
    minWidth: '90%',
    marginTop: 8,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconText: {
    fontSize: 20,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  categoryCard: {
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6366f1',
  },
  changeIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryChange: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountItem: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  amountDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryAverage: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default InsightsScreen;

