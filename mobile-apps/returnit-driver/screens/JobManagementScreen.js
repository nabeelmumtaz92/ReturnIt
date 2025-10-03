import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../../shared/api-client';
import authService from '../../shared/auth-service';
import ErrorHandler from '../../shared/error-handler';

export default function JobManagementScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('active');
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      if (!authService.isAuthenticated() || !authService.isDriver()) {
        throw new Error('Driver authentication required');
      }

      // Load pending assignments (new comprehensive system)
      const driverAssignments = await apiClient.getDriverAssignments();
      const transformedPendingJobs = driverAssignments.map(assignment => ({
        id: assignment.order.id,
        assignmentId: assignment.id,
        type: `Return to ${assignment.order.retailer}`,
        customer: `${assignment.order.user?.firstName || ''} ${assignment.order.user?.lastName || ''}`.trim() || 'Customer',
        pickupAddress: `${assignment.order.pickupStreetAddress}, ${assignment.order.pickupCity}, ${assignment.order.pickupState} ${assignment.order.pickupZipCode}`,
        dropoffAddress: assignment.order.retailer,
        status: formatJobStatus(assignment.order.status),
        originalStatus: assignment.order.status,
        estimatedEarnings: assignment.order.driverTotalEarning || 0,
        timeEstimate: estimateTime(assignment.order),
        distance: estimateDistance(assignment.order),
        scheduledTime: assignment.order.scheduledPickupTime ? new Date(assignment.order.scheduledPickupTime).toLocaleTimeString() : 'TBD',
        priority: assignment.order.priority || 'normal',
        packageDetails: assignment.order.itemDescription || 'Package pickup',
        expiresAt: assignment.expiresAt ? new Date(assignment.expiresAt) : null,
        assignedAt: assignment.assignedAt ? new Date(assignment.assignedAt) : null,
        isPending: assignment.status === 'pending',
        isAccepted: assignment.status === 'accepted'
      }));

      // Load current active jobs (accepted assignments)
      const driverOrders = await apiClient.getDriverOrders();
      const transformedActiveJobs = driverOrders.map(order => ({
        id: order.id,
        type: `Return to ${order.retailer}`,
        customer: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Customer',
        pickupAddress: `${order.pickupStreetAddress}, ${order.pickupCity}, ${order.pickupState} ${order.pickupZipCode}`,
        dropoffAddress: order.retailer,
        status: formatJobStatus(order.status),
        originalStatus: order.status,
        estimatedEarnings: order.driverTotalEarning || 0,
        timeEstimate: estimateTime(order),
        distance: estimateDistance(order),
        scheduledTime: order.scheduledPickupTime ? new Date(order.scheduledPickupTime).toLocaleTimeString() : 'TBD',
        priority: order.priority || 'normal',
        packageDetails: order.itemDescription || 'Package pickup'
      }));

      // Combine pending assignments with active jobs
      const allActiveJobs = [...transformedPendingJobs, ...transformedActiveJobs];
      setActiveJobs(allActiveJobs);

      // Load available jobs if needed
      if (activeTab === 'available') {
        const available = await apiClient.getAvailableJobs();
        const transformedAvailable = available.map(order => ({
          id: order.id,
          type: `Return to ${order.retailer}`,
          pickupAddress: `${order.pickupStreetAddress}, ${order.pickupCity}, ${order.pickupState} ${order.pickupZipCode}`,
          dropoffAddress: order.retailer,
          estimatedEarnings: order.driverTotalEarning || 0,
          timeEstimate: estimateTime(order),
          distance: estimateDistance(order),
          priority: order.priority || 'normal'
        }));
        setAvailableJobs(transformedAvailable);
      }

    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      setError(appError.userFriendly);
      ErrorHandler.logError(appError, { screen: 'JobManagement' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const formatJobStatus = (status) => {
    const statusMap = {
      'created': 'Created',
      'assigned': 'Assigned',
      'accepted': 'Accepted', 
      'picked_up': 'Picked Up',
      'en_route_to_store': 'En Route',
      'dropped_off': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const estimateTime = (order) => {
    // Simple time estimation based on distance/complexity
    return '25-35 min';
  };

  const estimateDistance = (order) => {
    // Would calculate based on coordinates in real implementation
    return '2-5 miles';
  };

  const getCurrentLocation = async () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            });
          },
          (error) => {
            console.log('Location error:', error);
            resolve(null); // Continue without location if permission denied
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      } else {
        resolve(null);
      }
    });
  };

  const handleAcceptJob = async (job) => {
    try {
      const location = await getCurrentLocation();
      
      if (job.assignmentId) {
        // New assignment system - respond to assignment
        await apiClient.respondToAssignment(job.assignmentId, 'accept', location);
        Alert.alert('Assignment Accepted!', 'You have successfully accepted this assignment. Navigate to pickup location to begin.', [
          { text: 'OK', onPress: () => loadJobs() }
        ]);
      } else {
        // Fallback to legacy system
        await apiClient.acceptJob(job.id);
        Alert.alert('Job Accepted', 'You have successfully accepted this job!', [
          { text: 'OK', onPress: () => loadJobs() }
        ]);
      }
    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      Alert.alert('Error', appError.userFriendly);
    }
  };

  const handleDeclineJob = async (job) => {
    try {
      const location = await getCurrentLocation();
      
      if (job.assignmentId) {
        await apiClient.respondToAssignment(job.assignmentId, 'decline', location);
        Alert.alert('Assignment Declined', 'This assignment has been declined and will be offered to other drivers.', [
          { text: 'OK', onPress: () => loadJobs() }
        ]);
      }
    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      Alert.alert('Error', appError.userFriendly);
    }
  };

  const handleJobAction = async (job, action) => {
    switch (action) {
      case 'accept':
        await handleAcceptJob(job);
        break;
      case 'decline':
        await handleDeclineJob(job);
        break;
      case 'start':
        try {
          const location = await getCurrentLocation();
          await apiClient.updateOrderStatus(job.id, 'picked_up', location);
          
          // Open GPS navigation to pickup location
          const pickupURL = `https://maps.google.com/maps?q=${encodeURIComponent(job.pickupAddress)}`;
          Alert.alert('Navigate to Pickup', 'Opening GPS navigation to customer pickup location.', [
            { text: 'OK', onPress: () => {
              // In a real app, this would open the native maps app
              console.log('Opening navigation to:', pickupURL);
              navigation.navigate('RouteOptimization', { orderId: job.id, destination: job.pickupAddress });
              loadJobs(); // Refresh jobs after status update
            }}
          ]);
        } catch (err) {
          const appError = ErrorHandler.handleAPIError(err);
          Alert.alert('Error', appError.userFriendly);
        }
        break;
      case 'complete':
        // Navigate to package verification screen for photos and signature
        navigation.navigate('PackageVerification', {
          orderId: job.id,
          orderDetails: {
            customer: job.customer,
            pickupAddress: job.pickupAddress,
            dropoffAddress: job.dropoffAddress,
            status: job.status,
          }
        });
        break;
      case 'en_route':
        try {
          const location = await getCurrentLocation();
          await apiClient.updateOrderStatus(job.id, 'en_route_to_store', location);
          
          // Open GPS navigation to store
          const storeURL = `https://maps.google.com/maps?q=${encodeURIComponent(job.dropoffAddress)}`;
          Alert.alert('Navigate to Store', 'Opening GPS navigation to store location.', [
            { text: 'OK', onPress: () => {
              console.log('Opening navigation to:', storeURL);
              navigation.navigate('RouteOptimization', { orderId: job.id, destination: job.dropoffAddress });
              loadJobs(); // Refresh jobs after status update
            }}
          ]);
        } catch (err) {
          const appError = ErrorHandler.handleAPIError(err);
          Alert.alert('Error', appError.userFriendly);
        }
        break;
      case 'cancel':
        Alert.alert('Cancel Job', 'Why are you canceling this job?', [
          { text: 'Customer not available', onPress: () => cancelJob(job.id, 'customer_not_available') },
          { text: 'Store closed/unavailable', onPress: () => cancelJob(job.id, 'store_unavailable') },
          { text: 'Vehicle issue', onPress: () => cancelJob(job.id, 'vehicle_issue') },
          { text: 'Other reason', onPress: () => cancelJob(job.id, 'other') },
          { text: 'Cancel', style: 'cancel' }
        ]);
        break;
      case 'contact':
        Alert.alert('Contact Customer', 'Choose contact method:', [
          { text: 'Call', onPress: () => {} },
          { text: 'Message', onPress: () => {} },
          { text: 'Cancel', style: 'cancel' }
        ]);
        break;
    }
  };

  const cancelJob = async (jobId, reason) => {
    try {
      const location = await getCurrentLocation();
      await apiClient.cancelOrder(jobId, reason, location);
      Alert.alert('Job Cancelled', 'This job has been cancelled and will be reassigned to another driver.', [
        { text: 'OK', onPress: () => loadJobs() }
      ]);
    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      Alert.alert('Error', appError.userFriendly);
    }
  };

  const completeJob = (jobId) => {
    Alert.alert('Success', 'Job completed successfully! Earnings added to your account.');
  };

  const getJobActionType = (status) => {
    // Use actual backend status values, not display strings
    switch (status) {
      case 'assigned':
      case 'accepted':
        return 'start';
      case 'picked_up':
        return 'en_route';
      case 'en_route_to_store':
        return 'complete';
      default:
        return 'start';
    }
  };

  const getJobActionText = (status) => {
    // Use actual backend status values, not display strings
    switch (status) {
      case 'assigned':
      case 'accepted':
        return '🚗 Start Pickup';
      case 'picked_up':
        return '🏪 Go to Store';
      case 'en_route_to_store':
        return '✅ Complete Delivery';
      default:
        return '🚗 Start';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned':
        return '#F59E0B';
      case 'En Route':
        return '#3B82F6';
      case 'Picked Up':
        return '#8B5CF6';
      case 'Completed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const renderActiveJob = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobType}>{item.type}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.jobId}>#{item.id}</Text>
      <Text style={styles.customerName}>Customer: {item.customer}</Text>
      
      <View style={styles.addressSection}>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>📍 Pickup:</Text>
          <Text style={styles.addressText}>{item.pickupAddress}</Text>
        </View>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>🎯 Drop-off:</Text>
          <Text style={styles.addressText}>{item.dropoffAddress}</Text>
        </View>
      </View>
      
      <View style={styles.jobDetails}>
        <Text style={styles.packageDetails}>{item.packageDetails}</Text>
      </View>
      
      <View style={styles.jobStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${item.estimatedEarnings}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.timeEstimate}</Text>
          <Text style={styles.statLabel}>Est. Time</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.distance}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.scheduledTime}</Text>
          <Text style={styles.statLabel}>Scheduled</Text>
        </View>
      </View>
      
      {/* Assignment expiration warning */}
      {item.expiresAt && item.isPending && (
        <View style={styles.expirationWarning}>
          <Text style={styles.expirationText}>
            ⏰ Assignment expires: {item.expiresAt.toLocaleTimeString()}
          </Text>
        </View>
      )}
      
      <View style={styles.jobActions}>
        {item.isPending ? (
          // Pending assignment - show accept/decline buttons
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineAction]}
              onPress={() => handleJobAction(item, 'decline')}
            >
              <Text style={[styles.actionButtonText, styles.declineActionText]}>❌ Decline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptAction]}
              onPress={() => handleJobAction(item, 'accept')}
            >
              <Text style={[styles.actionButtonText, styles.acceptActionText]}>✅ Accept</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Active job - show status-appropriate actions
          <>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleJobAction(item, 'contact')}
            >
              <Text style={styles.actionButtonText}>📞 Contact</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleJobAction(item, 'cancel')}
            >
              <Text style={styles.actionButtonText}>❌ Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => handleJobAction(item, getJobActionType(item.originalStatus || item.status))}
            >
              <Text style={[styles.actionButtonText, styles.primaryActionText]}>
                {getJobActionText(item.originalStatus || item.status)}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderCompletedJob = ({ item }) => (
    <View style={styles.completedJobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobType}>{item.type}</Text>
        <Text style={styles.completedTime}>{item.completedAt}</Text>
      </View>
      
      <Text style={styles.jobId}>#{item.id}</Text>
      <Text style={styles.customerName}>Customer: {item.customer}</Text>
      
      <View style={styles.completedStats}>
        <View style={styles.statItem}>
          <Text style={styles.earningsValue}>${item.earnings}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.ratingValue}>⭐ {item.rating}/5</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>
      
      {item.feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>"{item.feedback}"</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Management</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active Jobs ({activeJobs.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed ({completedJobs.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Job List */}
      <FlatList
        data={activeTab === 'active' ? activeJobs : completedJobs}
        renderItem={activeTab === 'active' ? renderActiveJob : renderCompletedJob}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#FB923C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  activeTabText: {
    color: 'white',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  completedJobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    opacity: 0.9,
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
  completedTime: {
    fontSize: 12,
    color: '#78716C',
    fontWeight: '500',
  },
  jobId: {
    fontSize: 12,
    color: '#78716C',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 12,
  },
  addressSection: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  addressLabel: {
    fontSize: 12,
    color: '#78716C',
    width: 80,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    lineHeight: 16,
  },
  jobDetails: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  packageDetails: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
  },
  jobStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  completedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 2,
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#78716C',
  },
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8F7F4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  primaryAction: {
    backgroundColor: '#FB923C',
    borderColor: '#FB923C',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  primaryActionText: {
    color: 'white',
  },
  acceptAction: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  acceptActionText: {
    color: 'white',
  },
  declineAction: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  declineActionText: {
    color: 'white',
  },
  expirationWarning: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  expirationText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  feedbackContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FB923C',
  },
  feedbackText: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
  },
});