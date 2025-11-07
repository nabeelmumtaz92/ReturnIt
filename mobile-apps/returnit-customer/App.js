import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Import screens
import LoginScreen from './screens/LoginScreen';
import SocialLoginScreen from './screens/SocialLoginScreen';
import WelcomeOnboardingScreen from './screens/WelcomeOnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import BookReturnScreen from './screens/BookReturnScreen';
import PhotoVerificationScreen from './screens/PhotoVerificationScreen';
import PaymentCheckoutScreen from './screens/PaymentCheckoutScreen';
import PayPalCheckoutScreen from './screens/PayPalCheckoutScreen';
import TrackPackageScreen from './screens/TrackPackageScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SupportScreen from './screens/SupportScreen';
import CustomerReviewScreen from './screens/CustomerReviewScreen';

// Import auth and API services
import authService from './services/auth-service';
import apiClient from './services/api-client';

const Stack = createStackNavigator();

// Loading Screen Component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text style={styles.loadingText}>Loading ReturnIt...</Text>
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
          console.log('Auth event:', event, user?.email);
          setIsAuthenticated(authService.isAuthenticated());
        });

        // Initialize authentication service and wait for completion
        await authService.initialize();
        
        // Check authentication status after initialization
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        console.log('App initialized, authenticated:', authenticated);
      } catch (error) {
        console.error('App initialization error:', error);
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

  // Authentication gating - show login if not authenticated
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
          <Stack.Screen name="SocialLogin" component={SocialLoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Main app navigation for authenticated users
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // We'll use custom headers in each screen
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="BookReturn" component={BookReturnScreen} />
        <Stack.Screen name="PhotoVerification" component={PhotoVerificationScreen} />
        <Stack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
        <Stack.Screen name="PayPalCheckout" component={PayPalCheckoutScreen} />
        <Stack.Screen name="TrackPackage" component={TrackPackageScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="CustomerReview" component={CustomerReviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F3',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '500',
  },
});