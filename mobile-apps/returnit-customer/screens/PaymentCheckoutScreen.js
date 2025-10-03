import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://returnit.online';

function CheckoutContent(props) {
  const { navigation, route } = props;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  const orderDetails = route?.params?.orderDetails || {
    pickupAddress: '123 Main St, St. Louis, MO',
    returnAddress: 'Target Store, Downtown',
    estimatedCost: 15.00,
    packageType: 'return'
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(orderDetails.estimatedCost * 100),
          currency: 'usd',
          description: `ReturnIt - ${orderDetails.packageType}`,
          mobile: true,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { paymentIntent, ephemeralKey, customer } = await response.json();

      if (!paymentIntent || !ephemeralKey || !customer) {
        throw new Error('Invalid payment intent response');
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'ReturnIt',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: 'Customer',
        },
        appearance: {
          colors: {
            primary: '#FB923C',
            background: '#F8F7F4',
            componentBackground: '#FFFFFF',
          },
        },
      });

      if (!error) {
        setPaymentReady(true);
      } else {
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      Alert.alert('Error', 'Unable to connect to payment service.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentReady) {
      Alert.alert('Please wait', 'Payment system is still loading...');
      return;
    }

    try {
      setLoading(true);
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code !== 'Canceled') {
          Alert.alert('Payment Failed', error.message);
        }
      } else {
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
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Something went wrong with the payment.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'card', name: '💳 Credit/Debit Card', enabled: true },
    { id: 'apple', name: '🍎 Apple Pay', enabled: true },
    { id: 'google', name: 'G Google Pay', enabled: true },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentMethodCard}>
              <Text style={styles.paymentMethodText}>{method.name}</Text>
              <Text style={styles.enabledBadge}>✓</Text>
            </View>
          ))}
          
          <Text style={styles.secureText}>🔒 Secure payment powered by Stripe</Text>
          
          <TouchableOpacity
            style={styles.paypalAlternativeButton}
            onPress={() => props.navigation.navigate('PayPalCheckout', { orderDetails })}
          >
            <Text style={styles.paypalAlternativeText}>Or pay with PayPal →</Text>
          </TouchableOpacity>
        </View>

        {loading && !paymentReady && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FB923C" />
            <Text style={styles.loadingText}>Preparing payment...</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.payButton, (!paymentReady || loading) && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={!paymentReady || loading}
        >
          {loading && paymentReady ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay ${orderDetails.estimatedCost.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By completing this payment, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </View>
  );
}

export default function PaymentCheckoutScreen(props) {
  const publishableKey = Constants.expoConfig?.extra?.stripePublishableKey || 'pk_test_placeholder';

  return (
    <StripeProvider publishableKey={publishableKey}>
      <CheckoutContent {...props} />
    </StripeProvider>
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
  paymentMethodCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  enabledBadge: {
    fontSize: 18,
    color: '#10B981',
  },
  secureText: {
    fontSize: 12,
    color: '#78716C',
    textAlign: 'center',
    marginTop: 8,
  },
  paypalAlternativeButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0070BA',
    marginTop: 16,
    alignItems: 'center',
  },
  paypalAlternativeText: {
    fontSize: 16,
    color: '#0070BA',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#78716C',
  },
  payButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  disclaimer: {
    fontSize: 12,
    color: '#78716C',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
