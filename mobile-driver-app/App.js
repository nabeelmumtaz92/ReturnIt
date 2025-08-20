import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [todayEarnings, setTodayEarnings] = useState(127.45);
  const [weeklyEarnings, setWeeklyEarnings] = useState(847.22);
  const [completedJobs, setCompletedJobs] = useState(8);
  const [driverRating, setDriverRating] = useState(4.8);
  const [currentJobStatus, setCurrentJobStatus] = useState(null); // 'accepted', 'en_route', 'arrived', 'picked_up'
  const [packagePhotos, setPackagePhotos] = useState([]);

  // Sample job data - in production this would come from your API
  const [availableJobs] = useState([
    {
      id: '1',
      customer: 'Sarah Johnson',
      pickupAddress: '123 Oak Street, St. Louis, MO',
      dropoffLocation: 'UPS Store - Clayton',
      amount: 15.75,
      distance: '2.3 miles',
      estimatedTime: '15 min',
      priority: 'high'
    },
    {
      id: '2', 
      customer: 'Mike Chen',
      pickupAddress: '456 Pine Avenue, St. Louis, MO',
      dropoffLocation: 'FedEx - Downtown',
      amount: 12.50,
      distance: '1.8 miles',
      estimatedTime: '12 min',
      priority: 'medium'
    }
  ]);

  useEffect(() => {
    // Request location permissions
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed for navigation');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    })();

    // Request notification permissions
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F59E0B',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      // Send notification when going online
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'You\'re Online!',
          body: 'You can now receive job requests',
        },
        trigger: null,
      });
    }
  };

  const acceptJob = (job) => {
    const acceptedJob = { ...job, status: 'accepted' };
    setActiveJobs([...activeJobs, acceptedJob]);
    setCurrentJobStatus('accepted');
    Alert.alert('Job Accepted', `You accepted the pickup for ${job.customer}`);
    
    // Send notification
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Job Accepted - Navigate Now',
        body: `Pickup: ${job.pickupAddress}`,
      },
      trigger: null,
    });
  };

  const updateJobStatus = (jobId, newStatus) => {
    setActiveJobs(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    setCurrentJobStatus(newStatus);

    const statusMessages = {
      'en_route': 'Navigation started to pickup location',
      'arrived': 'You have arrived at pickup location',
      'picked_up': 'Package picked up successfully',
      'completed': 'Job completed! Payment processing...'
    };

    if (statusMessages[newStatus]) {
      Alert.alert('Status Updated', statusMessages[newStatus]);
      
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Job Status Updated',
          body: statusMessages[newStatus],
        },
        trigger: null,
      });
    }
  };

  const startNavigation = (job) => {
    // Open native maps app for navigation
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${encodeURIComponent(job.pickupAddress)}`,
      android: `google.navigation:q=${encodeURIComponent(job.pickupAddress)}`
    });
    
    Alert.alert(
      'Open Navigation',
      'This will open your maps app for turn-by-turn directions',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Navigate', 
          onPress: () => {
            // In a real app, you'd use Linking.openURL(url)
            updateJobStatus(job.id, 'en_route');
          }
        }
      ]
    );
  };

  const takePackagePhoto = async () => {
    // Request camera permissions
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take package photos');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        timestamp: new Date().toISOString()
      };
      setPackagePhotos(prev => [...prev, newPhoto]);
      
      Alert.alert('Photo Saved', 'Package photo has been captured and saved');
      
      // Send notification
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Package Photo Captured',
          body: 'Photo saved for delivery verification',
        },
        trigger: null,
      });
    }
  };

  const completeJob = (jobId) => {
    const job = activeJobs.find(j => j.id === jobId);
    setActiveJobs(activeJobs.filter(j => j.id !== jobId));
    setTodayEarnings(prev => prev + job.amount);
    setCompletedJobs(prev => prev + 1);
    
    Alert.alert('Job Completed', `You earned $${job.amount.toFixed(2)}`);
    
    // Send notification
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Job Completed! 🎉',
        body: `You earned $${job.amount.toFixed(2)}`,
      },
      trigger: null,
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F59E0B" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>returnit Driver</Text>
            <Text style={styles.headerSubtitle}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.onlineToggle, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]}
            onPress={toggleOnlineStatus}
          >
            <Text style={styles.onlineToggleText}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Stats Dashboard */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${todayEarnings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedJobs}</Text>
              <Text style={styles.statLabel}>Jobs Completed</Text>
            </View>
          </View>

          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Jobs</Text>
              {activeJobs.map(job => (
                <View key={job.id} style={styles.jobCard}>
                  <View style={styles.jobHeader}>
                    <Text style={styles.customerName}>{job.customer}</Text>
                    <Text style={styles.jobAmount}>${job.amount.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.address}>{job.pickupAddress}</Text>
                  <Text style={styles.dropoff}>→ {job.dropoffLocation}</Text>
                  <Text style={styles.statusText}>Status: {job.status.replace('_', ' ').toUpperCase()}</Text>
                  <View style={styles.jobFooter}>
                    <Text style={styles.distance}>{job.distance} • {job.estimatedTime}</Text>
                    <View style={styles.jobActions}>
                      <TouchableOpacity
                        style={styles.photoButton}
                        onPress={takePackagePhoto}
                      >
                        <Text style={styles.photoButtonText}>📷</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => startNavigation(job)}
                      >
                        <Text style={styles.navButtonText}>Navigate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => completeJob(job.id)}
                      >
                        <Text style={styles.completeButtonText}>Complete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Available Jobs */}
          {isOnline && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Jobs</Text>
              {availableJobs.map(job => (
                <View key={job.id} style={styles.jobCard}>
                  <View style={styles.jobHeader}>
                    <Text style={styles.customerName}>{job.customer}</Text>
                    <View style={styles.amountContainer}>
                      <Text style={styles.jobAmount}>${job.amount.toFixed(2)}</Text>
                      {job.priority === 'high' && (
                        <View style={styles.priorityBadge}>
                          <Text style={styles.priorityText}>HIGH</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.address}>{job.pickupAddress}</Text>
                  <Text style={styles.dropoff}>→ {job.dropoffLocation}</Text>
                  <View style={styles.jobFooter}>
                    <Text style={styles.distance}>{job.distance} • {job.estimatedTime}</Text>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => acceptJob(job)}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Map View */}
          {currentLocation && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Location</Text>
              <MapView
                style={styles.map}
                region={{
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                  }}
                  title="Your Location"
                />
              </MapView>
            </View>
          )}

          {/* Contact Support Button */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.contactSupportButton}
              onPress={() => Alert.alert('Contact Support', 'Support chat feature coming soon! For immediate help, call (636) 254-4821')}
            >
              <Text style={styles.contactSupportText}>💬 Contact Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#F59E0B',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  onlineToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  onlineToggleText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  jobCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  priorityBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  address: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  dropoff: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  acceptButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  completeButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  photoButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 16,
  },
  navButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  map: {
    height: 200,
    borderRadius: 12,
  },
  contactSupportButton: {
    backgroundColor: '#D97706',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactSupportText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});