import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://returnit.online';

export default function PayPalCheckoutScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState(null);

  const orderDetails = route?.params?.orderDetails || {
    pickupAddress: '123 Main St, St. Louis, MO',
    returnAddress: 'Target Store, Downtown',
    estimatedCost: 15.00,
    packageType: 'return'
  };

  useEffect(() => {
    // Check for cold-start deep link (app was closed)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLinkUrl(url);
      }
    });

    // Listen for hot deep links (app is running)
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLinkUrl(event.url);
    });
    
    return () => {
      subscription.remove();
    };
  }, [paypalOrderId]);

  const handleDeepLinkUrl = async (url) => {
    if (!url) return;

    // Extract order ID from URL query parameters (PayPal sends token parameter)
    // React Native-safe URL parsing
    const extractOrderId = (url) => {
      try {
        // Parse query parameters manually (React Native safe)
        const queryStart = url.indexOf('?');
        if (queryStart === -1) return paypalOrderId;
        
        const queryString = url.substring(queryStart + 1);
        const params = queryString.split('&');
        
        for (const param of params) {
          const [key, value] = param.split('=');
          if (key === 'token' && value) {
            return decodeURIComponent(value);
          }
        }
        
        return paypalOrderId;
      } catch {
        // Fallback to in-memory ID
        return paypalOrderId;
      }
    };

    if (url.includes('returnit-customer://paypal-success')) {
      const orderId = extractOrderId(url);
      if (orderId) {
        await capturePayPalOrder(orderId);
      } else {
        Alert.alert('Error', 'Unable to complete payment. Order ID missing.');
        setLoading(false);
      }
    } else if (url.includes('returnit-customer://paypal-cancel')) {
      Alert.alert('Payment Cancelled', 'Your PayPal payment was cancelled.');
      setLoading(false);
      setPaypalOrderId(null);
    }
  };

  const capturePayPalOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/api/capture-paypal-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to capture PayPal order');
      }

      const data = await response.json();
      
      if (data.status === 'COMPLETED') {
        Alert.alert(
          'Payment Successful! 🎉',
          'Your return pickup has been scheduled. Track your order in Order History.',
          [
            {
              text: 'Track Order',
              onPress: () => navigation.navigate('TrackPackage')
            },
            {
              text: 'Home',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      } else {
        Alert.alert('Payment Error', 'Payment was not completed. Please try again.');
      }
    } catch (error) {
      console.error('PayPal capture error:', error);
      Alert.alert('Error', 'Failed to complete payment. Please try again.');
    } finally {
      setLoading(false);
      setPaypalOrderId(null);
    }
  };

  const handlePayPalPayment = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/create-paypal-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: orderDetails.estimatedCost.toFixed(2),
          currency: 'USD',
          intent: 'CAPTURE',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const paypalData = await response.json();
      const approvalLink = paypalData.links?.find(link => link.rel === 'approve');
      const approvalUrl = approvalLink?.href;
      const orderId = paypalData.id;

      if (approvalUrl && orderId) {
        setPaypalOrderId(orderId);
        
        const supported = await Linking.canOpenURL(approvalUrl);
        if (supported) {
          await Linking.openURL(approvalUrl);
        } else {
          Alert.alert('Error', 'Cannot open PayPal checkout. Please try again.');
          setLoading(false);
        }
      } else {
        Alert.alert('Error', 'Failed to create PayPal order. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      Alert.alert('Error', 'Unable to process PayPal payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PayPal Payment</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Type</Text>
              <Text style={styles.summaryValue}>{orderDetails.packageType}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Address</Text>
              <Text style={styles.summaryValue}>{orderDetails.pickupAddress}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Return Address</Text>
              <Text style={styles.summaryValue}>{orderDetails.returnAddress}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${orderDetails.estimatedCost.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.paypalInfo}>
          <Text style={styles.paypalTitle}>Pay with PayPal</Text>
          <Text style={styles.paypalDescription}>
            Click below to securely complete your payment with PayPal.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.paypalButton, loading && styles.paypalButtonDisabled]}
          onPress={handlePayPalPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.paypalButtonIcon}>💙</Text>
              <Text style={styles.paypalButtonText}>Pay with PayPal</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToStripeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backToStripeText}>← Back to payment methods</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By completing this payment, you agree to our Terms of Service and Privacy Policy.
        </Text>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#78716C',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#FED7AA',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FB923C',
  },
  paypalInfo: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 30,
    alignItems: 'center',
  },
  paypalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0070BA',
    marginBottom: 12,
  },
  paypalDescription: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 20,
  },
  paypalButton: {
    backgroundColor: '#0070BA',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paypalButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  paypalButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  paypalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  backToStripeButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  backToStripeText: {
    fontSize: 16,
    color: '#78716C',
  },
  disclaimer: {
    fontSize: 12,
    color: '#78716C',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
