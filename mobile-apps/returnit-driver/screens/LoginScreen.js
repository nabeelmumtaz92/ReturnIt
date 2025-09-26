import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import authService from '../../shared/auth-service';
import ErrorHandler from '../../shared/error-handler';

export default function LoginScreen({ navigation, onAuthSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(formData.email, formData.password);
      
      if (response.user) {
        // Check if user is a driver
        if (!response.user.isDriver) {
          Alert.alert('Access Denied', 'This app is for ReturnIt drivers only. Please use the customer app.');
          await authService.logout();
          return;
        }
        
        Alert.alert('Success', 'Welcome to ReturnIt Driver!');
        onAuthSuccess && onAuthSuccess(response.user);
      }
    } catch (error) {
      const appError = ErrorHandler.handleAPIError(error);
      Alert.alert('Login Failed', appError.userFriendly);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ReturnIt Driver</Text>
          <Text style={styles.headerSubtitle}>Professional Driver Portal</Text>
        </View>

        {/* Driver Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>🚗 Driver Access Required</Text>
          <Text style={styles.infoText}>
            This app is exclusively for authorized ReturnIt drivers. Please sign in with your driver credentials.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Sign In to Your Driver Account</Text>

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="Enter your driver email"
            keyboardType="email-address"
            autoCapitalize="none"
            testID="input-email"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            placeholder="Enter your password"
            secureTextEntry
            testID="input-password"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            testID="button-submit"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* OAuth Options */}
          <Text style={styles.orText}>Or continue with</Text>
          
          <TouchableOpacity style={styles.oauthButton} testID="button-google">
            <Text style={styles.oauthButtonText}>🔍 Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.oauthButton} testID="button-apple">
            <Text style={styles.oauthButtonText}>🍎 Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Driver Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Driver Features</Text>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💼</Text>
            <Text style={styles.featureText}>Manage job assignments and earnings</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🗺️</Text>
            <Text style={styles.featureText}>Optimized route planning and GPS tracking</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Instant payouts and incentive tracking</Text>
          </View>
        </View>

        {/* Demo Info */}
        <View style={styles.demoInfo}>
          <Text style={styles.demoText}>
            Demo Driver: Use "driver@returnit.com" with password "driver123" for testing
          </Text>
        </View>

        {/* Support */}
        <View style={styles.supportContainer}>
          <Text style={styles.supportText}>
            Need driver access? Contact support at support@returnit.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F0',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoContainer: {
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  oauthButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  oauthButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  featuresContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  demoInfo: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  demoText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  supportContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});