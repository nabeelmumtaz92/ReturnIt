import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const openWebApp = () => {
    Linking.openURL('https://31d2e9c8-ee18-4d8b-a694-284850544705-00-2mu2k62ukku0q.janeway.replit.dev');
  };

  const bookReturn = () => {
    Linking.openURL('https://31d2e9c8-ee18-4d8b-a694-284850544705-00-2mu2k62ukku0q.janeway.replit.dev/book-pickup');
  };

  const trackReturn = () => {
    Alert.alert("Track Return", "Enter your tracking number to see real-time updates on your return status.", [
      { text: "Open Web App", onPress: openWebApp },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const driverPortal = () => {
    Linking.openURL('https://31d2e9c8-ee18-4d8b-a694-284850544705-00-2mu2k62ukku0q.janeway.replit.dev/driver-portal');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>📦 ReturnIt</Text>
          <Text style={styles.subtitle}>Return Delivery Service</Text>
          <Text style={styles.version}>Mobile App v1.0.0</Text>
        </View>

        {/* Main Features */}
        <View style={styles.featuresContainer}>
          <TouchableOpacity style={styles.featureCard} onPress={bookReturn}>
            <Text style={styles.featureIcon}>📦</Text>
            <Text style={styles.featureTitle}>Book Return</Text>
            <Text style={styles.featureDescription}>Schedule a pickup for your package returns</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={trackReturn}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureTitle}>Track Return</Text>
            <Text style={styles.featureDescription}>Real-time tracking of your return delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={driverPortal}>
            <Text style={styles.featureIcon}>🚗</Text>
            <Text style={styles.featureTitle}>Driver Portal</Text>
            <Text style={styles.featureDescription}>Access driver dashboard and manage deliveries</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={openWebApp}>
            <Text style={styles.featureIcon}>🌐</Text>
            <Text style={styles.featureTitle}>Full Web App</Text>
            <Text style={styles.featureDescription}>Access all ReturnIt features and admin tools</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,000+</Text>
            <Text style={styles.statLabel}>Returns Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Active Drivers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.9</Text>
            <Text style={styles.statLabel}>Customer Rating</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={bookReturn}>
            <Text style={styles.primaryButtonText}>🚚 Book a Return Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={trackReturn}>
            <Text style={styles.secondaryButtonText}>📱 Track My Return</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Available in St. Louis, MO</Text>
          <Text style={styles.footerText}>© 2024 ReturnIt. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D2691E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8B4513',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D2691E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#D2691E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D2691E',
  },
  secondaryButtonText: {
    color: '#D2691E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});