// Navigation setup with TypeScript
import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import InsightsScreen from '../screens/InsightsScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Loading screen component
const LoadingScreen: React.FC = () => {
  return (
    <View style={loadingStyles.container}>
      <View style={loadingStyles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      <Text style={loadingStyles.text}>Loading...</Text>
      </View>
    </View>
  );
};

// Loading screen styles
const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  loaderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  text: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b'
  }
});

// Main tab navigator - shown after login
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarActiveBackgroundColor: 'rgba(99, 102, 241, 0.1)',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, color }}>💰</Text>
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, color }}>📊</Text>
            </View>
          )
        }}
      />
    </Tab.Navigator>
  );
};

// Root navigator - handles auth and main app navigation
const AppNavigator: React.FC = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error('AuthContext not found');
  
  const { user, loading } = authContext;
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Navigate when loading completes
  useEffect(() => {
    if (!loading && navigationRef.current) {
      if (user) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  }, [loading, user]);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      <Stack.Navigator 
        initialRouteName="Loading"
        screenOptions={{ headerShown: false }}
      >
        {/* Loading screen */}
        <Stack.Screen name="Loading" component={LoadingScreen} />
        
        {/* Auth screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Main app screens */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={{
            headerShown: true,
            title: 'Add Expense',
            headerStyle: {
              backgroundColor: '#6366f1',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="EditExpense"
          component={EditExpenseScreen}
          options={{
            headerShown: true,
            title: 'Edit Expense',
            headerStyle: {
              backgroundColor: '#6366f1',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
            headerShadowVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

