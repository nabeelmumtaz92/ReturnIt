import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';

// Import screens
import DriverDashboardScreen from './screens/DriverDashboardScreen';
import JobManagementScreen from './screens/JobManagementScreen';
import EarningsScreen from './screens/EarningsScreen';
import RouteOptimizationScreen from './screens/RouteOptimizationScreen';
import DriverProfileScreen from './screens/DriverProfileScreen';
import DriverSupportScreen from './screens/DriverSupportScreen';

// Import auth and API services
import authService from '../shared/auth-service';
import apiClient from '../shared/api-client';

const Stack = createStackNavigator();

// Loading Screen Component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2E8B57" />
      <Text style={styles.loadingText}>Loading ReturnIt Driver...</Text>
    </View>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize authentication service
      await authService.initialize();
      
      // Check authentication status and verify driver access
      const authenticated = authService.isAuthenticated();
      const isDriver = authService.isDriver();
      
      setIsAuthenticated(authenticated && isDriver);

      // Add auth state listener
      const unsubscribe = authService.addAuthListener((event, user) => {
        console.log('Auth event:', event, user?.email, user?.isDriver);
        setIsAuthenticated(authService.isAuthenticated() && authService.isDriver());
      });

      // Store unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Driver app initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DriverDashboard"
        screenOptions={{
          headerShown: false, // We'll use custom headers in each screen
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
        <Stack.Screen name="JobManagement" component={JobManagementScreen} />
        <Stack.Screen name="Earnings" component={EarningsScreen} />
        <Stack.Screen name="RouteOptimization" component={RouteOptimizationScreen} />
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        <Stack.Screen name="DriverSupport" component={DriverSupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8F0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '500',
  },
});