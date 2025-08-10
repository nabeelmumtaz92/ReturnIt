import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { colors } from '../styles/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>Returnly</Text>
        <Text style={styles.subtitle}>
          Reverse delivery for returns, exchanges, and donations.
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Make returns effortless
          </Text>
          <Text style={styles.cardSubtitle}>
            Schedule a pickup, hand off your item, and we'll return it for you.
          </Text>
          <View style={styles.buttonRow}>
            <Button 
              mode="contained" 
              style={[styles.button, styles.primaryButton]}
              labelStyle={styles.primaryButtonText}
              onPress={() => navigation.navigate('BookPickup')}
            >
              Book a Pickup
            </Button>
            <Button 
              mode="outlined" 
              style={[styles.button, styles.secondaryButton]}
              labelStyle={styles.secondaryButtonText}
              onPress={() => navigation.navigate('Login')}
            >
              Sign in
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={styles.driverCardContent}>
          <View style={styles.iconContainer}>
            <Avatar.Icon 
              size={40} 
              icon="truck-delivery" 
              style={styles.driverIcon}
            />
          </View>
          <View style={styles.driverTextContainer}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Want to earn as a driver?
            </Text>
            <Text style={styles.cardSubtitle}>
              Download the Returnly Driver app to start accepting pickup jobs.
            </Text>
          </View>
          <Button 
            mode="outlined" 
            compact 
            style={styles.downloadButton}
            labelStyle={styles.secondaryButtonText}
            onPress={() => {
              // In a real app, this would open app store
              alert('Driver app coming soon to App Store & Google Play!');
            }}
          >
            Download App
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'web' ? 24 : 50,
    backgroundColor: colors.offWhite,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: colors.barcodeBlack,
    fontWeight: '800',
    fontSize: 32,
  },
  subtitle: {
    color: colors.tapeBrown,
    marginTop: 8,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardboard,
    elevation: 2,
    shadowColor: colors.cardboard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardTitle: {
    color: colors.barcodeBlack,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: colors.tapeBrown,
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  button: {
    borderRadius: 12,
    flex: 1,
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: colors.accentOrange,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.cardboard,
    borderColor: colors.tapeBrown,
  },
  secondaryButtonText: {
    color: colors.barcodeBlack,
    fontWeight: '600',
  },
  driverCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  driverIcon: {
    backgroundColor: colors.accentOrange + '33', // 20% opacity
  },
  driverTextContainer: {
    flex: 1,
  },
  downloadButton: {
    backgroundColor: colors.cardboard,
    borderColor: colors.tapeBrown,
    borderRadius: 8,
  },
});