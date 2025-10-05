import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';

// Import screens
import LoginScreen from './screens/LoginScreen';
import WelcomeOnboardingScreen from './screens/WelcomeOnboardingScreen';
import DriverDashboardScreen from './screens/DriverDashboardScreen';
import LiveOrderMapScreen from './screens/LiveOrderMapScreen';
import JobManagementScreen from './screens/JobManagementScreen';
import EarningsScreen from './screens/EarningsScreen';
import PayoutManagementScreen from './screens/PayoutManagementScreen';
import RouteOptimizationScreen from './screens/RouteOptimizationScreen';
import DriverProfileScreen from './screens/DriverProfileScreen';
import RatingsAndFeedbackScreen from './screens/RatingsAndFeedbackScreen';
import DriverSupportScreen from './screens/DriverSupportScreen';
import PackageVerificationScreen from './screens/PackageVerificationScreen';
import CompleteDeliveryScreen from './screens/CompleteDeliveryScreen';

// Import auth and API services
import authService from './services/auth-service';
import apiClient from './services/api-client';

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
    let unsubscribe;

    const initializeApp = async () => {
      try {
        // Add auth state listener first
        unsubscribe = authService.addAuthListener((event, user) => {
          console.log('Auth event:', event, user?.email, user?.isDriver);
          const authenticated = authService.isAuthenticated();
          const isDriver = authService.isDriver();
          setIsAuthenticated(authenticated && isDriver);
        });

        // Initialize authentication service and wait for completion
        await authService.initialize();
        
        // Check authentication status and verify driver access after initialization
        const authenticated = authService.isAuthenticated();
        const isDriver = authService.isDriver();
        
        setIsAuthenticated(authenticated && isDriver);
        
        console.log('Driver app initialized, authenticated:', authenticated, 'isDriver:', isDriver);
      } catch (error) {
        console.error('Driver app initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Authentication gating - show login if not authenticated or not a driver
  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WelcomeOnboarding" component={WelcomeOnboardingScreen} />
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen 
                {...props} 
                onAuthSuccess={() => setIsAuthenticated(true)} 
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Main driver app navigation for authenticated drivers
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
        <Stack.Screen name="LiveOrderMap" component={LiveOrderMapScreen} />
        <Stack.Screen name="JobManagement" component={JobManagementScreen} />
        <Stack.Screen name="Earnings" component={EarningsScreen} />
        <Stack.Screen name="PayoutManagement" component={PayoutManagementScreen} />
        <Stack.Screen name="RouteOptimization" component={RouteOptimizationScreen} />
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        <Stack.Screen name="RatingsAndFeedback" component={RatingsAndFeedbackScreen} />
        <Stack.Screen name="DriverSupport" component={DriverSupportScreen} />
        <Stack.Screen name="PackageVerification" component={PackageVerificationScreen} />
        <Stack.Screen name="CompleteDelivery" component={CompleteDeliveryScreen} />
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