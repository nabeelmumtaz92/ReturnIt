import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Button from '../components/Button';
import ApiService from '../services/api';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { PAYOUT_SPLIT } from '../constants/config';

export default function JobDetailsScreen({ job, onAccept, onBack }) {
  const [accepting, setAccepting] = useState(false);

  const calculateDriverPayout = (amount) => {
    return (amount * PAYOUT_SPLIT.DRIVER).toFixed(2);
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await ApiService.acceptJob(job.id);
      onAccept(job);
    } catch (error) {
      Alert.alert('Error', 'Failed to accept job');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button 
          title="← Back" 
          onPress={onBack} 
          variant="outline"
          style={styles.backButton}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsTitle}>Your Earnings</Text>
          <Text style={styles.earningsAmount}>${calculateDriverPayout(job.price || 12)}</Text>
          <Text style={styles.earningsSubtext}>70% of ${job.price || 12}</Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>📦 Package Details</Text>
          <DetailRow label="Boxes/Bags" value={`${job.packageCount || 1} item(s)`} />
          <DetailRow label="Customer" value={job.customerName || 'Customer'} />
          <DetailRow label="Phone" value={job.customerPhone || '(555) 123-4567'} />
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>📍 Pickup Location</Text>
          <Text style={styles.addressText}>{job.pickupAddress || '123 Main St, St. Louis, MO 63101'}</Text>
          <Text style={styles.instructionsText}>{job.pickupInstructions || 'Ring doorbell'}</Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>🏬 Drop-off Location</Text>
          <Text style={styles.addressText}>{job.storeName || 'Target'}</Text>
          <Text style={styles.addressText}>{job.storeAddress || '456 Store Ave, St. Louis, MO 63102'}</Text>
        </View>

        {job.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.cardTitle}>📝 Special Notes</Text>
            <Text style={styles.notesText}>{job.notes}</Text>
          </View>
        )}

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>✓ What You'll Need</Text>
          <Text style={styles.requirementText}>• Verify package condition</Text>
          <Text style={styles.requirementText}>• Take photos at pickup & dropoff</Text>
          <Text style={styles.requirementText}>• Get store receipt signature</Text>
          <Text style={styles.requirementText}>• Complete within 2 hours</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Accept Job & Start"
          onPress={handleAccept}
          loading={accepting}
        />
      </View>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  scrollContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  earningsCard: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  earningsTitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  earningsAmount: {
    fontSize: FONTS.size.xxl * 1.5,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  earningsSubtext: {
    fontSize: FONTS.size.sm,
    color: COLORS.surface,
    opacity: 0.9,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.size.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  addressText: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  instructionsText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  notesCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notesText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
  },
  requirementsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  requirementsTitle: {
    fontSize: FONTS.size.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  requirementText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  footer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
