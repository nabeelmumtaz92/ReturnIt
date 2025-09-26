import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function TrackPackageScreen({ navigation }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [packageInfo, setPackageInfo] = useState(null);

  const trackingStatuses = [
    { status: 'Order Received', completed: true, time: '2:30 PM' },
    { status: 'Driver Assigned', completed: true, time: '3:15 PM' },
    { status: 'Package Picked Up', completed: true, time: '4:45 PM' },
    { status: 'In Transit', completed: false, time: 'Estimated: 6:00 PM' },
    { status: 'Delivered', completed: false, time: 'Estimated: 6:30 PM' }
  ];

  const handleTrackPackage = () => {
    if (!trackingNumber.trim()) {
      Alert.alert('Missing Information', 'Please enter a tracking number');
      return;
    }

    // Simulate API call - in real app, this would fetch from backend
    setPackageInfo({
      id: trackingNumber,
      type: 'Return to Best Buy',
      pickupAddress: '123 Main St, City, ST 12345',
      destination: 'Best Buy Return Center',
      estimatedDelivery: 'Today by 6:30 PM',
      driver: 'John Smith',
      driverPhone: '(555) 123-4567'
    });
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
          <Text style={styles.headerTitle}>Track Package</Text>
        </View>

        {/* Tracking Input */}
        <View style={styles.trackingInputContainer}>
          <Text style={styles.inputLabel}>Enter Tracking Number</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.trackingInput}
              value={trackingNumber}
              onChangeText={setTrackingNumber}
              placeholder="RT123456789"
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.trackButton} onPress={handleTrackPackage}>
              <Text style={styles.trackButtonText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Package Information */}
        {packageInfo && (
          <View style={styles.packageInfoContainer}>
            <View style={styles.packageHeader}>
              <Text style={styles.packageTitle}>{packageInfo.type}</Text>
              <Text style={styles.packageId}>#{packageInfo.id}</Text>
            </View>

            {/* Package Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>From:</Text>
                <Text style={styles.detailValue}>{packageInfo.pickupAddress}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>To:</Text>
                <Text style={styles.detailValue}>{packageInfo.destination}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estimated Delivery:</Text>
                <Text style={styles.detailValue}>{packageInfo.estimatedDelivery}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Driver:</Text>
                <Text style={styles.detailValue}>{packageInfo.driver}</Text>
              </View>
            </View>

            {/* Tracking Progress */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressTitle}>Delivery Progress</Text>
              
              {trackingStatuses.map((item, index) => (
                <View key={index} style={styles.statusRow}>
                  <View style={[
                    styles.statusDot,
                    item.completed ? styles.statusDotCompleted : styles.statusDotPending
                  ]} />
                  <View style={styles.statusContent}>
                    <Text style={[
                      styles.statusText,
                      item.completed ? styles.statusTextCompleted : styles.statusTextPending
                    ]}>
                      {item.status}
                    </Text>
                    <Text style={styles.statusTime}>{item.time}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>📞 Call Driver</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>📱 Get Updates</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('BookReturn')}
          >
            <Text style={styles.quickActionText}>📦 Book New Return</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Text style={styles.quickActionText}>📋 View Order History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Support')}
          >
            <Text style={styles.quickActionText}>🆘 Get Help</Text>
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
    padding: 20,
    paddingTop: 50,
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
  trackingInputContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  trackingInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
  },
  trackButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  trackButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  packageInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  packageHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
  },
  packageId: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 4,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#78716C',
    width: 80,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 16,
  },
  statusDotCompleted: {
    backgroundColor: '#10B981',
  },
  statusDotPending: {
    backgroundColor: '#D1D5DB',
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusTextCompleted: {
    color: '#374151',
  },
  statusTextPending: {
    color: '#9CA3AF',
  },
  statusTime: {
    fontSize: 14,
    color: '#78716C',
  },
  actionButtonsContainer: {
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
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  quickActionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
  },
  quickActionButton: {
    backgroundColor: '#F8F7F4',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
  },
});