import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import authService from '../../shared/auth-service';

export default function DriverDashboardScreen({ navigation }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    jobsCompleted: 0,
    activeJobs: 0,
    rating: 5.0
  });
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState(null);

  // Fetch real driver data
  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      
      // Fetch driver performance metrics
      const performanceResponse = await authService.apiRequest('/api/driver/performance', 'GET');
      if (performanceResponse) {
        setPerformance(performanceResponse);
        setStats(prevStats => ({
          ...prevStats,
          rating: performanceResponse.avgRating || 5.0,
          jobsCompleted: performanceResponse.weeklyDeliveries || 0
        }));
      }

      // Fetch driver earnings for today's earnings
      const earningsResponse = await authService.apiRequest('/api/driver/earnings', 'GET');
      if (earningsResponse && earningsResponse.daily) {
        const todayEarnings = earningsResponse.daily[earningsResponse.daily.length - 1] || 0;
        setStats(prevStats => ({
          ...prevStats,
          todayEarnings: todayEarnings
        }));
      }

      // Fetch active orders
      const ordersResponse = await authService.apiRequest('/api/driver/orders', 'GET');
      if (ordersResponse) {
        const activeOrders = ordersResponse.filter(order => 
          ['assigned', 'picked_up', 'in_transit'].includes(order.status)
        );
        setActiveJobs(activeOrders.map(order => ({
          id: order.trackingNumber || order.id,
          type: `Return to ${order.retailer}`,
          pickupAddress: `${order.pickupStreetAddress}, ${order.pickupCity}`,
          dropoffAddress: order.returnAddress || `${order.retailer} Store`,
          estimatedEarnings: order.driverEarnings || 15.00,
          timeEstimate: '25 min', // Could be calculated based on distance
          priority: order.priority || 'normal'
        })));
        
        setStats(prevStats => ({
          ...prevStats,
          activeJobs: activeOrders.length
        }));
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
      // Keep existing state on error to avoid crashes
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
  };

  const handleAcceptJob = (jobId) => {
    navigation.navigate('JobManagement', { jobId });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={styles.loadingText}>Loading driver data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ReturnIt Driver</Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('DriverProfile')}
          >
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Availability Toggle */}
        <View style={styles.availabilityContainer}>
          <View style={styles.availabilityRow}>
            <View>
              <Text style={styles.availabilityText}>Available for Jobs</Text>
              <Text style={styles.availabilitySubtext}>
                {isAvailable ? 'You are online and available' : 'You are offline'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: '#D1D5DB', true: '#FB923C' }}
              thumbColor={isAvailable ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${stats.todayEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.jobsCompleted}</Text>
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>⭐ {stats.rating}</Text>
            <Text style={styles.statLabel}>Driver Rating</Text>
          </View>
        </View>

        {/* Active Jobs Section */}
        {isAvailable && activeJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Jobs</Text>
            {activeJobs.map((job, index) => (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobType}>{job.type}</Text>
                  <View style={[
                    styles.priorityBadge,
                    job.priority === 'high' ? styles.priorityHigh : styles.priorityNormal
                  ]}>
                    <Text style={styles.priorityText}>
                      {job.priority === 'high' ? 'HIGH' : 'NORMAL'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.jobId}>#{job.id}</Text>
                
                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Pickup:</Text>
                  <Text style={styles.addressText}>{job.pickupAddress}</Text>
                </View>
                
                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Drop-off:</Text>
                  <Text style={styles.addressText}>{job.dropoffAddress}</Text>
                </View>
                
                <View style={styles.jobFooter}>
                  <View style={styles.jobEarnings}>
                    <Text style={styles.earningsAmount}>${job.estimatedEarnings}</Text>
                    <Text style={styles.earningsLabel}>Estimated</Text>
                  </View>
                  
                  <Text style={styles.timeEstimate}>{job.timeEstimate}</Text>
                  
                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => handleAcceptJob(job.id)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('JobManagement')}
            >
              <Text style={styles.actionButtonText}>🚚 My Jobs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Earnings')}
            >
              <Text style={styles.actionButtonText}>💰 Earnings</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('RouteOptimization')}
            >
              <Text style={styles.actionButtonText}>📍 Routes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('DriverSupport')}
            >
              <Text style={styles.actionButtonText}>🆘 Support</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#92400E',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FB923C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonText: {
    fontSize: 20,
    color: 'white',
  },
  availabilityContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
  },
  availabilitySubtext: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#78716C',
    textAlign: 'center',
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
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityHigh: {
    backgroundColor: '#DC2626',
  },
  priorityNormal: {
    backgroundColor: '#10B981',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  jobId: {
    fontSize: 12,
    color: '#78716C',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: '#78716C',
    width: 60,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  jobEarnings: {
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  earningsLabel: {
    fontSize: 10,
    color: '#78716C',
  },
  timeEstimate: {
    fontSize: 14,
    color: '#78716C',
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#FB923C',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
});