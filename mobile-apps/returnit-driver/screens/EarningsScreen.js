import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function EarningsScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
  const earningsData = {
    today: {
      total: 127.50,
      jobs: 8,
      tips: 15.25,
      fees: 8.50
    },
    week: {
      total: 892.75,
      jobs: 54,
      tips: 89.50,
      fees: 45.25
    },
    month: {
      total: 3567.25,
      jobs: 210,
      tips: 345.75,
      fees: 185.50
    }
  };

  const paymentHistory = [
    {
      id: 'PAY-001',
      date: '2024-01-15',
      type: 'Instant Pay',
      amount: 127.50,
      status: 'Completed',
      jobCount: 8
    },
    {
      id: 'PAY-002',
      date: '2024-01-14',
      type: 'Daily Earnings',
      amount: 89.25,
      status: 'Completed',
      jobCount: 6
    },
    {
      id: 'PAY-003',
      date: '2024-01-13',
      type: 'Weekly Payout',
      amount: 756.80,
      status: 'Pending',
      jobCount: 45
    },
    {
      id: 'PAY-004',
      date: '2024-01-12',
      type: 'Daily Earnings',
      amount: 134.75,
      status: 'Completed',
      jobCount: 9
    }
  ];

  const incentives = [
    {
      id: 'INC-001',
      title: 'Peak Hours Bonus',
      description: 'Extra $2 per delivery during 5-7 PM',
      status: 'Active',
      earned: 16.00
    },
    {
      id: 'INC-002',
      title: 'Weekend Warrior',
      description: '20% bonus for 15+ jobs on weekends',
      status: 'In Progress',
      progress: '8/15',
      potential: 45.50
    },
    {
      id: 'INC-003',
      title: 'Multi-Stop Master',
      description: 'Extra $5 for routes with 3+ stops',
      status: 'Available',
      earned: 25.00
    }
  ];

  const currentData = earningsData[selectedPeriod];

  const handleInstantPay = () => {
    Alert.alert(
      'Instant Pay',
      `Request instant payout of $${currentData.total.toFixed(2)}? A $0.50 fee will be applied.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => Alert.alert('Success', 'Instant pay requested! Funds will arrive in 15 minutes.')
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#10B981';
      case 'Pending':
        return '#F59E0B';
      case 'Failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderPaymentItem = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentType}>{item.type}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.paymentId}>#{item.id}</Text>
      <Text style={styles.jobCount}>{item.jobCount} jobs completed</Text>
      
      <View style={styles.paymentFooter}>
        <Text style={styles.paymentDate}>{item.date}</Text>
        <Text style={styles.paymentAmount}>${item.amount.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Earnings</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['today', 'week', 'month'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Earnings Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.totalEarnings}>
            <Text style={styles.totalAmount}>${currentData.total.toFixed(2)}</Text>
            <Text style={styles.totalLabel}>Total Earnings</Text>
          </View>
          
          <View style={styles.earningsBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownAmount}>${(currentData.total - currentData.tips - currentData.fees).toFixed(2)}</Text>
              <Text style={styles.breakdownLabel}>Base Pay</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownAmount}>${currentData.tips.toFixed(2)}</Text>
              <Text style={styles.breakdownLabel}>Tips</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownAmount}>${currentData.fees.toFixed(2)}</Text>
              <Text style={styles.breakdownLabel}>Bonuses</Text>
            </View>
          </View>
          
          <Text style={styles.jobsSummary}>{currentData.jobs} jobs completed</Text>
        </View>

        {/* Instant Pay */}
        {selectedPeriod === 'today' && currentData.total > 0 && (
          <View style={styles.instantPayContainer}>
            <View style={styles.instantPayInfo}>
              <Text style={styles.instantPayTitle}>💡 Instant Pay Available</Text>
              <Text style={styles.instantPaySubtext}>Get your earnings now for a $0.50 fee</Text>
            </View>
            <TouchableOpacity style={styles.instantPayButton} onPress={handleInstantPay}>
              <Text style={styles.instantPayButtonText}>Cash Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Incentives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Incentives</Text>
          {incentives.map((incentive) => (
            <View key={incentive.id} style={styles.incentiveCard}>
              <View style={styles.incentiveHeader}>
                <Text style={styles.incentiveTitle}>{incentive.title}</Text>
                <View style={[
                  styles.incentiveStatus,
                  incentive.status === 'Active' ? styles.incentiveActive : 
                  incentive.status === 'In Progress' ? styles.incentiveProgress : styles.incentiveAvailable
                ]}>
                  <Text style={styles.incentiveStatusText}>{incentive.status}</Text>
                </View>
              </View>
              
              <Text style={styles.incentiveDescription}>{incentive.description}</Text>
              
              {incentive.earned && (
                <Text style={styles.incentiveEarned}>Earned: ${incentive.earned.toFixed(2)}</Text>
              )}
              
              {incentive.progress && (
                <Text style={styles.incentiveProgress}>Progress: {incentive.progress}</Text>
              )}
              
              {incentive.potential && (
                <Text style={styles.incentivePotential}>Potential: ${incentive.potential.toFixed(2)}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <FlatList
            data={paymentHistory}
            renderItem={renderPaymentItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
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
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#92400E',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#FB923C',
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
  },
  totalEarnings: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 16,
    color: '#78716C',
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#78716C',
  },
  jobsSummary: {
    fontSize: 14,
    color: '#78716C',
  },
  instantPayContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  instantPayInfo: {
    flex: 1,
  },
  instantPayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  instantPaySubtext: {
    fontSize: 14,
    color: '#78716C',
  },
  instantPayButton: {
    backgroundColor: '#FB923C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  instantPayButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
  },
  incentiveCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  incentiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incentiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    flex: 1,
  },
  incentiveStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  incentiveActive: {
    backgroundColor: '#10B981',
  },
  incentiveProgress: {
    backgroundColor: '#F59E0B',
  },
  incentiveAvailable: {
    backgroundColor: '#6B7280',
  },
  incentiveStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  incentiveDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  incentiveEarned: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  incentivePotential: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  paymentId: {
    fontSize: 12,
    color: '#78716C',
    marginBottom: 4,
  },
  jobCount: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDate: {
    fontSize: 14,
    color: '#78716C',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
});