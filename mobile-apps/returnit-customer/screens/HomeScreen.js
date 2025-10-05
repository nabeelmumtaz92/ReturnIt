import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen({ navigation }) {
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
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('BookReturn')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>📦 Book a Return</Text>
            <Text style={styles.buttonSubtext}>Schedule pickup for returns & exchanges</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('TrackPackage')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>📍 Track Package</Text>
            <Text style={styles.buttonSubtext}>Monitor your return status</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('BookReturn', { type: 'donation' })}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>💝 Donate Items</Text>
            <Text style={styles.buttonSubtext}>Schedule charity pickup</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Access */}
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('OrderHistory')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickAccessText}>📋 Order History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickAccessText}>🔔 Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickAccessText}>👤 Profile</Text>
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
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={() => navigation.navigate('Support')}
          activeOpacity={0.8}
        >
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
    fontSize: 34,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#78716C',
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  actionContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 22,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#78716C',
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickAccessButton: {
    backgroundColor: 'white',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  quickAccessText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    letterSpacing: 0.2,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 14,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  infoText: {
    fontSize: 15,
    color: '#78716C',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  supportButton: {
    backgroundColor: '#92400E',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#92400E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  supportText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});