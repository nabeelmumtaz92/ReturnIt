import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import Button from '../components/Button';
import ApiService from '../services/api';
import { COLORS, SPACING, FONTS } from '../constants/theme';

export default function EarningsScreen({ onRequestPayout }) {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getEarnings(period);
      setEarnings(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load earnings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  // Mock data for demonstration
  const mockEarnings = {
    available: 145.80,
    pending: 32.50,
    totalThisWeek: 178.30,
    totalThisMonth: 642.15,
    completedJobs: 12,
    recentJobs: [
      { id: 1, date: '2024-10-20', amount: 8.40, store: 'Target' },
      { id: 2, date: '2024-10-20', amount: 12.60, store: 'Walmart' },
      { id: 3, date: '2024-10-19', amount: 8.40, store: 'Best Buy' },
      { id: 4, date: '2024-10-19', amount: 10.50, store: 'Target' },
      { id: 5, date: '2024-10-18', amount: 8.40, store: 'Walmart' },
    ],
  };

  const displayEarnings = earnings || mockEarnings;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Your Earnings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, period === 'today' && styles.periodButtonActive]}
            onPress={() => setPeriod('today')}
          >
            <Text style={[styles.periodButtonText, period === 'today' && styles.periodButtonTextActive]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodButtonText, period === 'week' && styles.periodButtonTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodButtonText, period === 'month' && styles.periodButtonTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Available Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available to Cash Out</Text>
          <Text style={styles.balanceAmount}>${displayEarnings.available.toFixed(2)}</Text>
          <Button
            title="💵 Cash Out Now"
            onPress={onRequestPayout}
            style={styles.cashOutButton}
          />
        </View>

        {/* Pending Earnings */}
        <View style={styles.pendingCard}>
          <Text style={styles.pendingLabel}>⏳ Pending (Processing)</Text>
          <Text style={styles.pendingAmount}>${displayEarnings.pending.toFixed(2)}</Text>
          <Text style={styles.pendingText}>Available in 24-48 hours</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>${displayEarnings.totalThisWeek.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>${displayEarnings.totalThisMonth.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Jobs Done</Text>
            <Text style={styles.statValue}>{displayEarnings.completedJobs}</Text>
          </View>
        </View>

        {/* Recent Jobs */}
        <Text style={styles.sectionTitle}>Recent Jobs</Text>
        {displayEarnings.recentJobs.map((job) => (
          <View key={job.id} style={styles.jobRow}>
            <View style={styles.jobInfo}>
              <Text style={styles.jobStore}>{job.store}</Text>
              <Text style={styles.jobDate}>{job.date}</Text>
            </View>
            <Text style={styles.jobAmount}>${job.amount.toFixed(2)}</Text>
          </View>
        ))}
      </ScrollView>
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
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContainer: {
    padding: SPACING.md,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
  },
  periodButton: {
    flex: 1,
    padding: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: COLORS.surface,
  },
  balanceCard: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
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
    marginBottom: SPACING.md,
  },
  cashOutButton: {
    backgroundColor: COLORS.surface,
  },
  pendingCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  pendingLabel: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  pendingAmount: {
    fontSize: FONTS.size.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  pendingText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.size.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: FONTS.size.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  jobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  jobInfo: {
    flex: 1,
  },
  jobStore: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  jobDate: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  jobAmount: {
    fontSize: FONTS.size.md,
    fontWeight: 'bold',
    color: COLORS.success,
  },
});
