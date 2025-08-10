import React, { useState } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { Text, Card, Button, TextInput } from 'react-native-paper';
import { useApp } from '../../App';
import { colors, spacing, borderRadius } from '../styles/colors';

export default function LoginScreen({ navigation }) {
  const signIn = useApp((s) => s.signIn);
  const [name, setName] = useState('');
  const [asDriver, setAsDriver] = useState(false);

  const handleLogin = () => {
    if (!name.trim()) return;
    
    if (asDriver) {
      Alert.alert(
        'Download Driver App',
        'Drivers should download the Returnly Driver mobile app to accept jobs and manage deliveries.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    signIn(name, asDriver);
    navigation.replace('BookPickup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.inputContainer}>
            <Text variant="labelLarge" style={styles.label}>Your name</Text>
            <TextInput
              mode="outlined"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              style={styles.input}
              outlineColor={colors.cardboard}
              activeOutlineColor={colors.accentOrange}
              contentStyle={styles.inputContent}
            />
          </View>

          <View style={styles.toggleContainer}>
            <Button
              mode={asDriver ? 'contained' : 'outlined'}
              style={[
                styles.toggleButton,
                asDriver ? styles.selectedToggle : styles.unselectedToggle
              ]}
              labelStyle={asDriver ? styles.selectedToggleText : styles.unselectedToggleText}
              onPress={() => setAsDriver(true)}
            >
              I'm a Driver
            </Button>
            <Button
              mode={!asDriver ? 'contained' : 'outlined'}
              style={[
                styles.toggleButton,
                !asDriver ? styles.selectedToggle : styles.unselectedToggle
              ]}
              labelStyle={!asDriver ? styles.selectedToggleText : styles.unselectedToggleText}
              onPress={() => setAsDriver(false)}
            >
              I'm a Customer
            </Button>
          </View>

          <Button
            mode="contained"
            style={[styles.continueButton, !name.trim() && styles.disabledButton]}
            labelStyle={styles.continueButtonText}
            disabled={!name.trim()}
            onPress={handleLogin}
          >
            Continue
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'web' ? spacing.lg : 50,
    backgroundColor: colors.offWhite,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.barcodeBlack,
    fontWeight: '800',
    fontSize: 32,
  },
  subtitle: {
    color: colors.tapeBrown,
    marginTop: spacing.sm,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardboard,
    elevation: 2,
    shadowColor: colors.cardboard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.barcodeBlack,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  inputContent: {
    color: colors.barcodeBlack,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  selectedToggle: {
    backgroundColor: colors.accentOrange,
  },
  unselectedToggle: {
    backgroundColor: colors.cardboard,
    borderColor: colors.tapeBrown,
  },
  selectedToggleText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  unselectedToggleText: {
    color: colors.barcodeBlack,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: colors.accentOrange,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});