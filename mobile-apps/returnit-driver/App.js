import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [isAvailable, setIsAvailable] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ReturnIt Driver</Text>
          <Text style={styles.headerSubtitle}>Driver Dashboard</Text>
        </View>

        {/* Availability Toggle */}
        <View style={styles.availabilityContainer}>
          <View style={styles.availabilityRow}>
            <Text style={styles.availabilityText}>Available for Jobs</Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#D1D5DB', true: '#FB923C' }}
              thumbColor={isAvailable ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
          <Text style={styles.statusText}>
            {isAvailable ? '🟢 You are online and available' : '🔴 You are offline'}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>$127.50</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>🚚 View Active Jobs</Text>
            <Text style={styles.buttonSubtext}>See current assignments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>💰 Earnings & Payouts</Text>
            <Text style={styles.buttonSubtext}>View payment history</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>📍 Route Optimization</Text>
            <Text style={styles.buttonSubtext}>Plan efficient routes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>📋 Job History</Text>
            <Text style={styles.buttonSubtext}>View completed deliveries</Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <TouchableOpacity style={styles.supportButton}>
          <Text style={styles.supportText}>Driver Support</Text>
        </TouchableOpacity>
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
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#78716C',
  },
  availabilityContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
  },
  statusText: {
    fontSize: 14,
    color: '#78716C',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#78716C',
  },
  actionContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#78716C',
  },
  supportButton: {
    backgroundColor: '#92400E',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  supportText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});