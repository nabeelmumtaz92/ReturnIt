import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ReturnIt</Text>
          <Text style={styles.headerSubtitle}>Professional Return Service</Text>
        </View>

        {/* Main Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>📦 Book a Return</Text>
            <Text style={styles.buttonSubtext}>Schedule pickup for returns & exchanges</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>📍 Track Package</Text>
            <Text style={styles.buttonSubtext}>Monitor your return status</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>💝 Donate Items</Text>
            <Text style={styles.buttonSubtext}>Schedule charity pickup</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            1. Schedule a pickup{'\n'}
            2. We collect from your location{'\n'}
            3. Items returned or donated safely
          </Text>
        </View>

        {/* Support */}
        <TouchableOpacity style={styles.supportButton}>
          <Text style={styles.supportText}>Need Help? Contact Support</Text>
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
    marginBottom: 40,
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
  actionContainer: {
    marginBottom: 40,
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
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#78716C',
    lineHeight: 20,
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