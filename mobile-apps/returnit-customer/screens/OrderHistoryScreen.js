import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../services/api-client';
import authService from '../services/auth-service';
import ErrorHandler from '../services/error-handler';

export default function OrderHistoryScreen({ navigation }) {
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      if (!authService.isAuthenticated()) {
        throw new Error('Please log in to view your order history');
      }

      const orders = await apiClient.getOrders();
      
      // Transform API data to match UI expectations
      const transformedOrders = orders.map(order => ({
        id: order.trackingNumber || order.id,
        orderId: order.id, // Preserve real order ID for API calls
        type: `Return to ${order.retailer}`,
        date: new Date(order.createdAt).toLocaleDateString(),
        status: formatOrderStatus(order.status),
        amount: order.totalPrice ? `$${order.totalPrice.toFixed(2)}` : 'N/A',
        items: order.itemDescription || 'Package',
        driverId: order.driverId,
        driverName: order.driverName
      }));

      setOrderHistory(transformedOrders);
    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      setError(appError.userFriendly);
      ErrorHandler.logError(appError, { screen: 'OrderHistory' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrderHistory();
    setRefreshing(false);
  };

  const formatOrderStatus = (status) => {
    const statusMap = {
      'created': 'Pending',
      'confirmed': 'Confirmed', 
      'assigned': 'Driver Assigned',
      'picked_up': 'Picked Up',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    };
    return statusMap[status] || status;
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="dark" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrderHistory}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return '#10B981';
      case 'In Transit':
        return '#F59E0B';
      case 'Pending':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const renderOrderItem = ({ item }) => {
    const isCompleted = item.status === 'Delivered' || item.status === 'Completed';
    
    return (
      <View style={styles.orderCard}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('TrackPackage')}
        >
          <View style={styles.orderHeader}>
            <Text style={styles.orderType}>{item.type}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          
          <Text style={styles.orderId}>#{item.id}</Text>
          <Text style={styles.orderItems}>{item.items}</Text>
          
          <View style={styles.orderFooter}>
            <Text style={styles.orderDate}>{item.date}</Text>
            <Text style={styles.orderAmount}>{item.amount}</Text>
          </View>
        </TouchableOpacity>

        {isCompleted && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => navigation.navigate('CustomerReview', {
              orderId: item.orderId, // Use real order ID for API
              driverId: item.driverId,
              driverName: item.driverName || 'Your Driver'
            })}
          >
            <Text style={styles.reviewButtonText}>⭐ Rate Your Experience</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orderHistory.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {orderHistory.filter(order => order.status === 'Delivered' || order.status === 'Completed').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {orderHistory.filter(order => order.type.includes('Donation')).length}
          </Text>
          <Text style={styles.statLabel}>Donations</Text>
        </View>
      </View>

      <FlatList
        data={orderHistory}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('BookReturn')}
        >
          <Text style={styles.primaryButtonText}>📦 Book New Return</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
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
    fontSize: 12,
    color: '#78716C',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  orderId: {
    fontSize: 14,
    color: '#78716C',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 14,
    color: '#78716C',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8F7F4',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
  },
  primaryButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  reviewButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});