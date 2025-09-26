import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RouteOptimizationScreen({ navigation, route }) {
  const { jobId } = route.params || {};
  
  const [selectedRoute, setSelectedRoute] = useState('optimal');
  
  const routes = {
    optimal: {
      name: 'Optimal Route',
      distance: '8.4 miles',
      time: '32 minutes',
      fuel: '$3.20',
      earnings: '$42.75',
      stops: 3,
      efficiency: 95,
      description: 'Fastest route with minimal traffic'
    },
    shortest: {
      name: 'Shortest Distance',
      distance: '7.2 miles',
      time: '38 minutes',
      fuel: '$2.85',
      earnings: '$42.75',
      stops: 3,
      efficiency: 88,
      description: 'Least distance but more traffic'
    },
    economic: {
      name: 'Most Economic',
      distance: '9.1 miles',
      time: '35 minutes',
      fuel: '$2.95',
      earnings: '$42.75',
      stops: 3,
      efficiency: 92,
      description: 'Best fuel efficiency'
    }
  };

  const currentJobs = [
    {
      id: 'RT123456789',
      type: 'Return to Best Buy',
      address: '123 Main St',
      customer: 'Sarah Johnson',
      timeWindow: '2:30 - 3:00 PM',
      earnings: 15.50,
      priority: 'high',
      status: 'next'
    },
    {
      id: 'RT123456788',
      type: 'Donation Pickup',
      address: '456 Oak Ave',
      customer: 'Mike Chen',
      timeWindow: '3:00 - 3:30 PM',
      earnings: 12.00,
      priority: 'normal',
      status: 'pending'
    },
    {
      id: 'RT123456787',
      type: 'Exchange at Target',
      address: '789 Pine St',
      customer: 'Lisa Wong',
      timeWindow: '3:30 - 4:00 PM',
      earnings: 15.25,
      priority: 'normal',
      status: 'pending'
    }
  ];

  const currentRoute = routes[selectedRoute];

  const handleStartNavigation = () => {
    Alert.alert(
      'Start Navigation',
      `Begin navigation to first stop using ${currentRoute.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            Alert.alert('Navigation Started', 'External navigation app will open.');
            // In a real app, this would open Google Maps or similar
          }
        }
      ]
    );
  };

  const handleOptimizeRoute = () => {
    Alert.alert('Route Optimized', 'Route has been optimized based on current traffic conditions.');
  };

  const getJobStatusColor = (status) => {
    switch (status) {
      case 'next':
        return '#FB923C';
      case 'pending':
        return '#6B7280';
      case 'completed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Route Optimization</Text>
        </View>

        {/* Route Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Options</Text>
          
          {Object.entries(routes).map(([key, route]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.routeCard,
                selectedRoute === key && styles.routeCardSelected
              ]}
              onPress={() => setSelectedRoute(key)}
            >
              <View style={styles.routeHeader}>
                <Text style={[
                  styles.routeName,
                  selectedRoute === key && styles.routeNameSelected
                ]}>
                  {route.name}
                </Text>
                <View style={styles.efficiencyBadge}>
                  <Text style={styles.efficiencyText}>{route.efficiency}%</Text>
                </View>
              </View>
              
              <Text style={styles.routeDescription}>{route.description}</Text>
              
              <View style={styles.routeStats}>
                <View style={styles.routeStat}>
                  <Text style={styles.routeStatValue}>{route.distance}</Text>
                  <Text style={styles.routeStatLabel}>Distance</Text>
                </View>
                <View style={styles.routeStat}>
                  <Text style={styles.routeStatValue}>{route.time}</Text>
                  <Text style={styles.routeStatLabel}>Time</Text>
                </View>
                <View style={styles.routeStat}>
                  <Text style={styles.routeStatValue}>{route.fuel}</Text>
                  <Text style={styles.routeStatLabel}>Fuel Cost</Text>
                </View>
                <View style={styles.routeStat}>
                  <Text style={styles.routeStatValue}>{route.stops}</Text>
                  <Text style={styles.routeStatLabel}>Stops</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Route Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Selected Route Summary</Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatCard}>
              <Text style={styles.summaryStatValue}>{currentRoute.earnings}</Text>
              <Text style={styles.summaryStatLabel}>Total Earnings</Text>
            </View>
            <View style={styles.summaryStatCard}>
              <Text style={styles.summaryStatValue}>{currentRoute.time}</Text>
              <Text style={styles.summaryStatLabel}>Est. Time</Text>
            </View>
            <View style={styles.summaryStatCard}>
              <Text style={styles.summaryStatValue}>{currentRoute.distance}</Text>
              <Text style={styles.summaryStatLabel}>Distance</Text>
            </View>
          </View>
        </View>

        {/* Job Sequence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Sequence</Text>
          
          {currentJobs.map((job, index) => (
            <View key={job.id} style={styles.jobSequenceCard}>
              <View style={styles.sequenceNumber}>
                <Text style={styles.sequenceNumberText}>{index + 1}</Text>
              </View>
              
              <View style={styles.jobSequenceContent}>
                <View style={styles.jobSequenceHeader}>
                  <Text style={styles.jobSequenceType}>{job.type}</Text>
                  <View style={[
                    styles.jobStatusBadge,
                    { backgroundColor: getJobStatusColor(job.status) }
                  ]}>
                    <Text style={styles.jobStatusText}>
                      {job.status === 'next' ? 'NEXT' : 'PENDING'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.jobSequenceAddress}>📍 {job.address}</Text>
                <Text style={styles.jobSequenceCustomer}>👤 {job.customer}</Text>
                <Text style={styles.jobSequenceTime}>⏰ {job.timeWindow}</Text>
                
                <View style={styles.jobSequenceFooter}>
                  <Text style={styles.jobSequenceEarnings}>${job.earnings}</Text>
                  {job.status === 'next' && (
                    <TouchableOpacity style={styles.viewDetailsButton}>
                      <Text style={styles.viewDetailsButtonText}>View Details</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleOptimizeRoute}
          >
            <Text style={styles.secondaryButtonText}>🔄 Re-optimize Route</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleStartNavigation}
          >
            <Text style={styles.primaryButtonText}>🗺️ Start Navigation</Text>
          </TouchableOpacity>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  routeCardSelected: {
    borderColor: '#FB923C',
    borderWidth: 2,
    backgroundColor: '#FFFBEB',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  routeNameSelected: {
    color: '#FB923C',
  },
  efficiencyBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  efficiencyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  routeDescription: {
    fontSize: 14,
    color: '#78716C',
    marginBottom: 12,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeStat: {
    alignItems: 'center',
  },
  routeStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  routeStatLabel: {
    fontSize: 10,
    color: '#78716C',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStatCard: {
    alignItems: 'center',
    flex: 1,
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#78716C',
    textAlign: 'center',
  },
  jobSequenceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sequenceNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FB923C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sequenceNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  jobSequenceContent: {
    flex: 1,
  },
  jobSequenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobSequenceType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    flex: 1,
  },
  jobStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jobStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  jobSequenceAddress: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  jobSequenceCustomer: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  jobSequenceTime: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  jobSequenceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobSequenceEarnings: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  viewDetailsButton: {
    backgroundColor: '#F8F7F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  viewDetailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  actionContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
});