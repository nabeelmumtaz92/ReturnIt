import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Input from '../components/Input';
import Button from '../components/Button';
import ApiService from '../services/api';
import { COLORS, SPACING, FONTS } from '../constants/theme';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.login(email, password);
      ApiService.setToken(response.token);
      onLoginSuccess(response.user);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.register(email, password, name, phone);
      ApiService.setToken(response.token);
      onLoginSuccess(response.user);
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>📦 ReturnIt Driver</Text>
          <Text style={styles.subtitle}>
            {isRegister ? 'Create Driver Account' : 'Driver Login'}
          </Text>
        </View>

        <View style={styles.form}>
          {isRegister && (
            <>
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
              />
              <Input
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="(636) 254-4821"
                keyboardType="phone-pad"
              />
            </>
          )}
          
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="driver@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            title={isRegister ? 'Create Account' : 'Sign In'}
            onPress={isRegister ? handleRegister : handleLogin}
            loading={loading}
            style={styles.submitButton}
          />

          <Button
            title={isRegister ? 'Already have an account? Sign In' : 'New driver? Create Account'}
            onPress={() => setIsRegister(!isRegister)}
            variant="outline"
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💰 Driver Benefits</Text>
          <Text style={styles.infoText}>• Earn 70% on every delivery</Text>
          <Text style={styles.infoText}>• Instant payouts available</Text>
          <Text style={styles.infoText}>• Flexible schedule</Text>
          <Text style={styles.infoText}>• Weekly earnings reports</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: FONTS.size.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.size.lg,
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  submitButton: {
    marginBottom: SPACING.md,
  },
  infoBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: FONTS.size.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
});
