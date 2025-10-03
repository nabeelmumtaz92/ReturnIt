import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../../shared/api-client';
import authService from '../../shared/auth-service';

export default function PayoutManagementScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [requestingPayout, setRequestingPayout] = useState(false);

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    try {
      setLoading(true);
      const user = authService.getUser();
      
      if (!user) {
        Alert.alert('Error', 'Please log in to view payouts');
        navigation.navigate('Login');
        return;
      }

      // Fetch payout history
      const historyResponse = await apiClient.request(`/api/driver/payouts`);
      setPayoutHistory(historyResponse || []);

      // Fetch driver orders to calculate pending earnings
      const ordersResponse = await apiClient.request(`/api/driver/orders`);
      const orders = ordersResponse || [];
      
      // Calculate pending earnings (completed orders not yet paid out)
      const pendingOrders = orders.filter(order => 
        order.status === 'dropped_off' && 
        order.paymentStatus === 'completed' &&
        (order.driverPayoutStatus === 'pending' || !order.driverPayoutStatus)
      );
      
      const pending = pendingOrders.reduce((sum, order) => 
        sum + (order.driverBasePay || 3.00) + 
        (order.driverDistancePay || 0) + 
        (order.driverTimePay || 0) + 
        (order.driverSizeBonus || 0) + 
        (order.tip || 0), 0
      );
      
      setPendingEarnings(pending);
      setPendingOrdersCount(pendingOrders.length);
    } catch (error) {
      console.error('Error fetching payout data:', error);
      Alert.alert('Error', 'Failed to load payout information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayoutData();
  };

  const requestInstantPayout = async () => {
    if (pendingEarnings < 1.50) {
      Alert.alert(
        'Minimum Not Met',
        `Minimum payout is $1.50 (including $0.50 instant fee). You currently have $${pendingEarnings.toFixed(2)} pending.`
      );
      return;
    }

    const feeAmount = 0.50;
    const netAmount = pendingEarnings - feeAmount;

    Alert.alert(
      'Request Instant Payout',
      `Request instant payout of $${pendingEarnings.toFixed(2)}?\n\nFee: $${feeAmount.toFixed(2)}\nYou'll receive: $${netAmount.toFixed(2)}\n\nFunds typically arrive in 15-30 minutes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setRequestingPayout(true);
              
              const response = await apiClient.request('/api/driver/payout/instant', {
                method: 'POST',
                body: { feeAmount }
              });

              Alert.alert(
                'Payout Requested!',
                `Your instant payout of $${netAmount.toFixed(2)} has been processed. Funds will arrive in your account within 15-30 minutes.`,
                [{ text: 'OK', onPress: () => fetchPayoutData() }]
              );
            } catch (error) {
              console.error('Instant payout error:', error);
              Alert.alert(
                'Payout Failed',
                error.response?.data?.error || 'Failed to process instant payout. Please try again.'
              );
            } finally {
              setRequestingPayout(false);
            }
          }
        }
      ]
    );
  };

  const getPayoutTypeLabel = (type) => {
    switch (type) {
      case 'instant':
        return 'Instant Pay';
      case 'weekly':
        return 'Weekly Payout';
      default:
        return 'Payout';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Loading payout information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payout Management</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending Earnings Card */}
        <View style={styles.pendingCard}>
          <Text style={styles.pendingLabel}>Pending Earnings</Text>
          <Text style={styles.pendingAmount}>${pendingEarnings.toFixed(2)}</Text>
          <Text style={styles.pendingJobs}>{pendingOrdersCount} completed deliveries</Text>
          
          <TouchableOpacity
            style={[
              styles.instantPayButton,
              (pendingEarnings < 1.50 || requestingPayout) && styles.disabledButton
            ]}
            onPress={requestInstantPayout}
            disabled={pendingEarnings < 1.50 || requestingPayout}
          >
            {requestingPayout ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.instantPayButtonText}>⚡ Request Instant Pay</Text>
                <Text style={styles.instantPayFee}>$0.50 fee • Arrives in 15-30 min</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.weeklyPayInfo}>
            <Text style={styles.weeklyPayText}>
              💰 Or wait for free weekly payout on Sunday
            </Text>
          </View>
        </View>

        {/* Payout History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Payout History</Text>
          
          {payoutHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No payout history yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Complete deliveries to start earning!
              </Text>
            </View>
          ) : (
            payoutHistory.map((payout) => (
              <View key={payout.id} style={styles.payoutCard}>
                <View style={styles.payoutHeader}>
                  <Text style={styles.payoutType}>
                    {getPayoutTypeLabel(payout.payoutType)}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(payout.status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.payoutDetails}>
                  <View style={styles.payoutRow}>
                    <Text style={styles.payoutLabel}>Gross Amount:</Text>
                    <Text style={styles.payoutValue}>
                      ${payout.totalAmount?.toFixed(2) || '0.00'}
                    </Text>
                  </View>
                  
                  {payout.feeAmount > 0 && (
                    <View style={styles.payoutRow}>
                      <Text style={styles.payoutLabel}>Fee:</Text>
                      <Text style={styles.payoutValue}>
                        -${payout.feeAmount?.toFixed(2) || '0.00'}
                      </Text>
                    </View>
                  )}
                  
                  <View style={[styles.payoutRow, styles.payoutRowTotal]}>
                    <Text style={styles.payoutLabelBold}>Net Amount:</Text>
                    <Text style={styles.payoutAmountBold}>
                      ${payout.netAmount?.toFixed(2) || '0.00'}
                    </Text>
                  </View>
                </View>

                <View style={styles.payoutFooter}>
                  <Text style={styles.payoutDate}>
                    {formatDate(payout.createdAt || new Date())}
                  </Text>
                  {payout.orderIds && (
                    <Text style={styles.payoutOrders}>
                      {payout.orderIds.length} deliveries
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Stripe Connect Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💳 Payout Information</Text>
          <Text style={styles.infoText}>
            • Instant Pay: $0.50 fee, arrives in 15-30 minutes{'\n'}
            • Weekly Payout: Free, every Sunday{'\n'}
            • Minimum payout: $1.50{'\n'}
            • Powered by Stripe Connect
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F7F4',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollContainer: {
    padding: 16,
  },
  pendingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pendingLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  pendingAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 4,
  },
  pendingJobs: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  instantPayButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  instantPayButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  instantPayFee: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  weeklyPayInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  weeklyPayText: {
    fontSize: 14,
    color: '#6B7280',
  },
  historySection: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  payoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  payoutType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  payoutDetails: {
    marginBottom: 12,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  payoutRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 6,
    paddingTop: 12,
  },
  payoutLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  payoutValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  payoutLabelBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  payoutAmountBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  payoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  payoutDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  payoutOrders: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
});
