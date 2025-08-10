import React, { useState } from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { Text, Card, Button, TextInput, Divider } from 'react-native-paper';
import { useApp } from '../../App';
import { colors, spacing, borderRadius } from '../styles/colors';

export default function BookPickupScreen({ navigation }) {
  const createOrder = useApp((s) => s.createOrder);
  const user = useApp((s) => s.user);

  const [name, setName] = useState(user?.name ?? '');
  const [pickupAddress, setPickupAddress] = useState('123 Main St');
  const [retailer, setRetailer] = useState('Target');
  const [notes, setNotes] = useState('');
  const price = 15;

  const handleCreateOrder = () => {
    if (!name.trim() || !pickupAddress.trim() || !retailer.trim()) return;
    
    const id = createOrder({
      customerName: name,
      pickupAddress,
      retailer,
      notes,
      price
    });
    navigation.navigate('OrderStatus', { orderId: id });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>Book a pickup</Text>
        <Text style={styles.subtitle}>We'll handle the return for you</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.inputContainer}>
            <Text variant="labelLarge" style={styles.label}>Your name</Text>
            <TextInput
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={styles.input}
              outlineColor={colors.cardboard}
              activeOutlineColor={colors.accentOrange}
              contentStyle={styles.inputContent}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text variant="labelLarge" style={styles.label}>Pickup address</Text>
            <TextInput
              mode="outlined"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              style={styles.input}
              outlineColor={colors.cardboard}
              activeOutlineColor={colors.accentOrange}
              contentStyle={styles.inputContent}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text variant="labelLarge" style={styles.label}>Retailer</Text>
            <TextInput
              mode="outlined"
              value={retailer}
              onChangeText={setRetailer}
              style={styles.input}
              outlineColor={colors.cardboard}
              activeOutlineColor={colors.accentOrange}
              contentStyle={styles.inputContent}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text variant="labelLarge" style={styles.label}>Notes</Text>
            <TextInput
              mode="outlined"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea]}
              outlineColor={colors.cardboard}
              activeOutlineColor={colors.accentOrange}
              contentStyle={styles.inputContent}
              placeholder="Special instructions, QR codes, etc."
            />
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.priceText}>
            Estimated price: ${price}
          </Text>

          <Button
            mode="contained"
            style={[styles.createButton, (!name.trim() || !pickupAddress.trim() || !retailer.trim()) && styles.disabledButton]}
            labelStyle={styles.createButtonText}
            disabled={!name.trim() || !pickupAddress.trim() || !retailer.trim()}
            onPress={handleCreateOrder}
          >
            Pay & Create Order (mock)
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'web' ? spacing.lg : 50,
    paddingBottom: spacing.xl,
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
  textArea: {
    minHeight: 80,
  },
  divider: {
    marginVertical: spacing.md,
    backgroundColor: colors.cardboard,
  },
  priceText: {
    color: colors.barcodeBlack,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: colors.accentOrange,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});