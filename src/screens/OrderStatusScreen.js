import React from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { useApp } from '../../App';
import { colors, spacing, borderRadius } from '../styles/colors';
import dayjs from 'dayjs';

export default function OrderStatusScreen({ navigation, route }) {
  const { orderId } = route.params || {};
  const orders = useApp((s) => s.orders);
  const updateOrder = useApp((s) => s.updateOrder);
  
  const order = orderId ? orders[orderId] : undefined;

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>Order not found</Text>
        </View>
        <Button 
          mode="contained"
          style={styles.backButton}
          labelStyle={styles.backButtonText}
          onPress={() => navigation.navigate('BookPickup')}
        >
          Back to booking
        </Button>
      </View>
    );
  }

  const steps = ['created', 'assigned', 'picked_up', 'dropped_off', 'refunded'];
  const currentIndex = steps.indexOf(order.status);

  const formatDate = (date) => {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dayjs(dateObj).format('MMM D, h:mma');
  };

  const handleAdvanceStatus = () => {
    if (currentIndex < steps.length - 1) {
      updateOrder(order.id, { status: steps[currentIndex + 1] });
    }
  };

  const getChipStyle = (stepIndex) => ({
    backgroundColor: stepIndex <= currentIndex ? colors.accentOrange : colors.cardboard + '66',
    borderColor: stepIndex <= currentIndex ? colors.accentOrange : colors.cardboard,
  });

  const getChipTextStyle = (stepIndex) => ({
    color: stepIndex <= currentIndex ? '#FFFFFF' : colors.tapeBrown,
    fontWeight: stepIndex <= currentIndex ? '600' : '500',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>Order #{order.id}</Text>
        <Text style={styles.subtitle}>Created {formatDate(order.createdAt)}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.retailerName}>
            {order.retailer}
          </Text>
          <Text style={styles.address}>
            {order.pickupAddress}
          </Text>

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.statusLabel}>Status</Text>
          
          <View style={styles.chipContainer}>
            {steps.map((step, idx) => (
              <Chip
                key={step}
                style={[styles.chip, getChipStyle(idx)]}
                textStyle={getChipTextStyle(idx)}
                mode="flat"
              >
                {step.replace('_', ' ')}
              </Chip>
            ))}
          </View>

          {currentIndex < steps.length - 1 && (
            <Button
              mode="outlined"
              style={styles.advanceButton}
              labelStyle={styles.advanceButtonText}
              onPress={handleAdvanceStatus}
            >
              Advance (demo)
            </Button>
          )}

          <Button
            mode="contained"
            style={styles.doneButton}
            labelStyle={styles.doneButtonText}
            onPress={() => navigation.navigate('Welcome')}
          >
            Done
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
    fontSize: 28,
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
  retailerName: {
    color: colors.barcodeBlack,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  address: {
    color: colors.tapeBrown,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
    backgroundColor: colors.cardboard,
  },
  statusLabel: {
    color: colors.barcodeBlack,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  advanceButton: {
    backgroundColor: colors.cardboard,
    borderColor: colors.tapeBrown,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  advanceButtonText: {
    color: colors.barcodeBlack,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: colors.accentOrange,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: colors.accentOrange,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.lg,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});