// Edit expense screen - update existing expense
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExpenseContext } from '../context/ExpenseContext';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/config';
import { Expense, ExpenseCategory, PaymentMethod, RootStackParamList } from '../types';

type EditExpenseScreenRouteProp = RouteProp<RootStackParamList, 'EditExpense'>;
type EditExpenseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditExpense'>;

// Custom Dropdown Component
interface CustomDropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select an option"
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownWrapper}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownLabel}>{label}</Text>
        <View style={styles.dropdownContent}>
          <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
            {value || placeholder}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent} 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    item === value && styles.modalOptionSelected
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.modalOptionText,
                    item === value && styles.modalOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {item === value && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const EditExpenseScreen: React.FC = () => {
  const route = useRoute<EditExpenseScreenRouteProp>();
  const navigation = useNavigation<EditExpenseScreenNavigationProp>();
  const { expense } = route.params;
  
  const expenseContext = useContext(ExpenseContext);
  if (!expenseContext) throw new Error('ExpenseContext not found');
  
  const { updateExpense, deleteExpense } = expenseContext;
  const [amount, setAmount] = useState<string>(expense.amount.toString());
  const [category, setCategory] = useState<ExpenseCategory>(expense.category as ExpenseCategory);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(expense.paymentMethod as PaymentMethod);
  const [description, setDescription] = useState<string>(expense.description || '');
  const [date, setDate] = useState<string>(expense.date.split('T')[0]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpdate = async (): Promise<void> => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    const result = await updateExpense(expense._id, {
      amount: amountNum,
      category,
      paymentMethod,
      description,
      date
    });
    setLoading(false);

    if (result.success) {
      // Navigate back immediately, then show success message
      navigation.goBack();
      
      // Show success message after a brief delay (for better UX)
      setTimeout(() => {
        Alert.alert(
          'Success',
          'Expense updated successfully'
        );
      }, 100);
    } else {
      Alert.alert('Error', result.message || 'Failed to update expense');
    }
  };

  const handleDelete = async (): Promise<void> => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteExpense(expense._id);
            if (result.success) {
              navigation.goBack();
            } else {
              Alert.alert('Error', result.message || 'Failed to delete expense');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✏️</Text>
        </View>
      <Text style={styles.title}>Edit Expense</Text>
        <Text style={styles.subtitle}>Modify your expense details</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
      <Text style={styles.label}>Amount *</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>₹</Text>
      <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
              maxLength={10}
            />
      </View>
      </View>

        <CustomDropdown
          label="Category *"
          value={category}
          options={CATEGORIES}
          onSelect={(value) => setCategory(value as ExpenseCategory)}
          placeholder="Select a category"
        />

        <CustomDropdown
          label="Payment Method *"
          value={paymentMethod}
          options={PAYMENT_METHODS}
          onSelect={(value) => setPaymentMethod(value as PaymentMethod)}
          placeholder="Select payment method"
        />

        <View style={styles.inputGroup}>
      <Text style={styles.label}>Description</Text>
          <View style={styles.inputWrapper}>
      <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Add a note (optional)"
              placeholderTextColor="#94a3b8"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
              textAlignVertical="top"
      />
          </View>
        </View>

        <View style={styles.inputGroup}>
      <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateInputWrapper}
            onPress={() => {
              // For now, keep the text input but make it more user-friendly
              // In a real app, you could integrate a proper date picker
            }}
            activeOpacity={0.8}
          >
            <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
        value={date}
        onChangeText={setDate}
                editable={true}
      />
            </View>
            <View style={styles.dateIconContainer}>
              <Text style={styles.dateIcon}>📅</Text>
            </View>
          </TouchableOpacity>
        </View>

      <TouchableOpacity
          style={[styles.updateButton, loading && styles.buttonDisabled]}
        onPress={handleUpdate}
        disabled={loading}
          activeOpacity={0.8}
      >
          <View style={styles.buttonContent}>
        {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
        ) : (
              <>
                <Text style={styles.updateButtonText}>Update Expense</Text>
                <Text style={styles.buttonIcon}>💾</Text>
              </>
        )}
          </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
          activeOpacity={0.8}
      >
          <View style={styles.deleteButtonContent}>
        <Text style={styles.deleteButtonText}>Delete Expense</Text>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </View>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '400',
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
    zIndex: 1,
  },
  amountInput: {
    backgroundColor: '#ffffff',
    padding: 16,
    paddingLeft: 40,
    borderRadius: 12,
    fontSize: 18,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownWrapper: {
    marginBottom: 24,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#94a3b8',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionSelected: {
    backgroundColor: '#f0f9ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  dateInputWrapper: {
    position: 'relative',
  },
  dateIconContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    marginTop: 16,
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonIcon: {
    color: '#ffffff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  deleteIcon: {
    fontSize: 16,
  },
});

export default EditExpenseScreen;

