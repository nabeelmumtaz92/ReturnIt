import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Button from '../components/Button';
import ApiService from '../services/api';
import { COLORS, SPACING, FONTS } from '../constants/theme';

export default function PayoutScreen({ availableBalance, onBack }) {
  const [processing, setProcessing] = useState(false);

  const handlePayout = async (type) => {
    const fee = type === 'instant' ? 1.50 : 0;
    const amount = availableBalance - fee;

    Alert.alert(
      'Confirm Payout',
      `${type === 'instant' ? 'Instant' : 'Standard'} payout of $${amount.toFixed(2)}${fee > 0 ? ` (after $${fee} fee)` : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setProcessing(true);
            try {
              await ApiService.requestPayout(amount, type);
              Alert.alert(
                'Success!',
                `Your ${type} payout of $${amount.toFixed(2)} is being processed.`,
                [{ text: 'OK', onPress: onBack }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to process payout');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
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
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>${availableBalance.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Choose Payout Method</Text>

        {/* Instant Payout */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Text style={styles.payoutTitle}>⚡ Instant Payout</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>30 seconds</Text>
            </View>
          </View>
          
          <Text style={styles.payoutDescription}>
            Get your money immediately via Stripe
          </Text>
          
          <View style={styles.payoutDetails}>
            <DetailRow label="Amount" value={`$${availableBalance.toFixed(2)}`} />
            <DetailRow label="Fee" value="$1.50" error />
            <DetailRow label="You Receive" value={`$${(availableBalance - 1.50).toFixed(2)}`} bold />
          </View>

          <Button
            title="Cash Out Instantly"
            onPress={() => handlePayout('instant')}
            loading={processing}
            disabled={availableBalance < 1.50}
          />
        </View>

        {/* Standard Payout */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Text style={styles.payoutTitle}>🏦 Standard Payout</Text>
            <View style={[styles.badge, styles.badgeFree]}>
              <Text style={styles.badgeTextFree}>FREE</Text>
            </View>
          </View>
          
          <Text style={styles.payoutDescription}>
            Free transfer to your bank account
          </Text>
          
          <View style={styles.payoutDetails}>
            <DetailRow label="Amount" value={`$${availableBalance.toFixed(2)}`} />
            <DetailRow label="Fee" value="$0.00" />
            <DetailRow label="You Receive" value={`$${availableBalance.toFixed(2)}`} bold />
            <DetailRow label="Timeline" value="2-3 business days" info />
          </View>

          <Button
            title="Cash Out (Free)"
            onPress={() => handlePayout('standard')}
            variant="secondary"
            loading={processing}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Payout Information</Text>
          <Text style={styles.infoText}>• Instant payouts arrive in ~30 seconds</Text>
          <Text style={styles.infoText}>• Standard payouts are always free</Text>
          <Text style={styles.infoText}>• Minimum payout: $1.50</Text>
          <Text style={styles.infoText}>• All payouts via Stripe Connect</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value, bold, error, info }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, info && styles.detailInfo]}>{label}</Text>
      <Text style={[
        styles.detailValue,
        bold && styles.detailValueBold,
        error && styles.detailValueError,
        info && styles.detailInfo,
      ]}>
        {value}
      </Text>
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
  },
  balanceCard: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  balanceLabel: {
    fontSize: FONTS.size.sm,
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONTS.size.xxl * 1.5,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  sectionTitle: {
    fontSize: FONTS.size.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  payoutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  payoutTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: FONTS.size.xs,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  badgeFree: {
    backgroundColor: COLORS.success,
  },
  badgeTextFree: {
    fontSize: FONTS.size.xs,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  payoutDescription: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  payoutDetails: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
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
  },
  detailValueBold: {
    fontWeight: 'bold',
    fontSize: FONTS.size.md,
  },
  detailValueError: {
    color: COLORS.error,
  },
  detailInfo: {
    fontSize: FONTS.size.xs,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: FONTS.size.sm,
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
