import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [address, setAddress] = useState('');
  const [packages, setPackages] = useState(1);

  const CustomerApp = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>📦 Returnly</Text>
        <Text style={styles.subtitle}>Customer App Demo</Text>
      </View>

      {currentView === 'home' && (
        <View style={styles.content}>
          <Text style={styles.title}>Book a Return Pickup</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>Pickup Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your address"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Number of Packages</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity 
                style={styles.counterBtn}
                onPress={() => setPackages(Math.max(1, packages - 1))}
              >
                <Text style={styles.counterText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.packageCount}>{packages}</Text>
              <TouchableOpacity 
                style={styles.counterBtn}
                onPress={() => setPackages(packages + 1)}
              >
                <Text style={styles.counterText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => {
              Alert.alert('Success!', 'Pickup booked successfully!');
              setCurrentView('tracking');
            }}
          >
            <Text style={styles.buttonText}>Book Pickup - $8.99</Text>
          </TouchableOpacity>

          <View style={styles.navButtons}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => setCurrentView('history')}
            >
              <Text style={styles.navButtonText}>Order History</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => setCurrentView('driver')}
            >
              <Text style={styles.navButtonText}>Switch to Driver App</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {currentView === 'tracking' && (
        <View style={styles.content}>
          <Text style={styles.title}>Track Your Pickup</Text>
          
          <View style={styles.trackingCard}>
            <Text style={styles.trackingStatus}>🚗 Driver En Route</Text>
            <Text style={styles.trackingDetail}>Your driver Mike will arrive in 15 minutes</Text>
            <Text style={styles.trackingAddress}>Pickup: {address || '123 Main St'}</Text>
          </View>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentView('home')}
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentView === 'history' && (
        <View style={styles.content}>
          <Text style={styles.title}>Order History</Text>
          
          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>Today</Text>
            <Text style={styles.historyStatus}>In Progress</Text>
            <Text style={styles.historyDetail}>2 packages - $8.99</Text>
          </View>

          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>Yesterday</Text>
            <Text style={styles.historyStatus}>Completed</Text>
            <Text style={styles.historyDetail}>1 package - $8.99</Text>
          </View>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentView('home')}
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const DriverApp = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🚗 Returnly Driver</Text>
        <Text style={styles.subtitle}>Driver App Demo</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Available Jobs</Text>
        
        <View style={styles.jobCard}>
          <Text style={styles.jobTitle}>Pickup Job #1234</Text>
          <Text style={styles.jobDetail}>📍 123 Main St, St. Louis</Text>
          <Text style={styles.jobDetail}>📦 2 packages</Text>
          <Text style={styles.jobEarning}>💰 Earn $6.29 (70%)</Text>
          
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => Alert.alert('Job Accepted!', 'Navigate to pickup location')}
          >
            <Text style={styles.buttonText}>Accept Job</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.jobCard}>
          <Text style={styles.jobTitle}>Pickup Job #1235</Text>
          <Text style={styles.jobDetail}>📍 456 Oak Ave, Clayton</Text>
          <Text style={styles.jobDetail}>📦 1 package</Text>
          <Text style={styles.jobEarning}>💰 Earn $6.29 (70%)</Text>
          
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => Alert.alert('Job Accepted!', 'Navigate to pickup location')}
          >
            <Text style={styles.buttonText}>Accept Job</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentView('home')}
        >
          <Text style={styles.navButtonText}>Switch to Customer App</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.appContainer}>
      <StatusBar style="auto" />
      {currentView === 'driver' ? <DriverApp /> : <CustomerApp />}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F59E0B',
    marginBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtn: {
    backgroundColor: '#F59E0B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  packageCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#92400E',
  },
  bookButton: {
    backgroundColor: '#F59E0B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#6B7280',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  trackingCard: {
    backgroundColor: '#DBEAFE',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  trackingStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 10,
  },
  trackingDetail: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 5,
  },
  trackingAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  historyStatus: {
    fontSize: 14,
    color: '#10B981',
    marginVertical: 2,
  },
  historyDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  jobCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  jobDetail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  jobEarning: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 8,
  },
});