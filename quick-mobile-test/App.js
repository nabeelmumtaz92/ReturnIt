import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>📦 ReturnIt</Text>
          <Text style={styles.subtitle}>Driver Mobile App Test</Text>
        </View>

        {/* Dashboard Cards */}
        <View style={styles.dashboardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Active Orders</Text>
            <Text style={styles.cardNumber}>3</Text>
            <Text style={styles.cardSubtext}>Ready for pickup</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>💰 Today's Earnings</Text>
            <Text style={styles.cardNumber}>$47.50</Text>
            <Text style={styles.cardSubtext}>+15% from yesterday</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>🚚 Start Driving</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>📍 View Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>💳 Request Payout</Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>✅ Connected to ReturnIt</Text>
          <Text style={styles.statusText}>📱 Mobile App Test Version</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF3E2',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0522D',
    textAlign: 'center',
  },
  dashboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D2691E',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#A0522D',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#D2691E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#D2691E',
  },
  secondaryButtonText: {
    color: '#D2691E',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 4,
  },
});