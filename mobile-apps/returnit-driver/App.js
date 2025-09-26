import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';

// Import screens
import DriverDashboardScreen from './screens/DriverDashboardScreen';
import JobManagementScreen from './screens/JobManagementScreen';
import EarningsScreen from './screens/EarningsScreen';
import RouteOptimizationScreen from './screens/RouteOptimizationScreen';
import DriverProfileScreen from './screens/DriverProfileScreen';
import DriverSupportScreen from './screens/DriverSupportScreen';

const Stack = createStackNavigator();

export default function App() {
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