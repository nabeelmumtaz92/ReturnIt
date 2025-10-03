import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import apiClient from '../services/api-client';
import authService from '../services/auth-service';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function LiveOrderMapScreen({ navigation }) {
  const [region, setRegion] = useState({
    latitude: 38.6270, // St. Louis
    longitude: -90.1994,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [availableOrders, setAvailableOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const mapRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    setupLocationTracking();
    fetchAvailableOrders();
    setupWebSocket();

    // Refresh orders every 15 seconds as fallback
    const interval = setInterval(fetchAvailableOrders, 15000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const setupLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show available orders near you.');
        return;
      }

      setLocationPermission(true);

      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setDriverLocation(newLocation);
      setRegion({
        ...newLocation,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });

      // Watch position for continuous tracking
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 50,
        },
        (newPos) => {
          setDriverLocation({
            latitude: newPos.coords.latitude,
            longitude: newPos.coords.longitude,
          });
        }
      );
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    try {
      const protocol = 'wss:'; // Use secure WebSocket
      const baseUrl = authService.getApiUrl().replace('https://', '').replace('http://', '');
      const wsUrl = `${protocol}//${baseUrl}/ws/tracking`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected for live order updates');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'NEW_ORDER') {
            Alert.alert(
              '🚨 New Order Available!',
              data.order?.pickupAddress ? `Pickup at ${data.order.pickupAddress}` : 'Tap to view on map',
              [{ text: 'View Map', onPress: () => fetchAvailableOrders() }]
            );
            fetchAvailableOrders();
          } else if (data.type === 'ORDER_STATUS_UPDATE') {
            fetchAvailableOrders();
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt reconnect after 5 seconds
        setTimeout(setupWebSocket, 5000);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const orders = await apiClient.getAvailableJobs();
      
      const orderLocations = orders.map((order) => ({
        id: order.id,
        trackingNumber: order.trackingNumber,
        latitude: parseFloat(order.pickupLatitude) || 38.6270 + (Math.random() - 0.5) * 0.1,
        longitude: parseFloat(order.pickupLongitude) || -90.1994 + (Math.random() - 0.5) * 0.1,
        pickupAddress: `${order.pickupStreetAddress}, ${order.pickupCity}`,
        deliveryAddress: order.retailer || order.returnAddress,
        estimatedPay: order.driverTotalEarning || calculateEstimatedPay(order),
        distance: driverLocation ? calculateDistance(driverLocation, {
          latitude: parseFloat(order.pickupLatitude) || 38.6270,
          longitude: parseFloat(order.pickupLongitude) || -90.1994
        }) : 'Unknown',
        packageType: order.packageType || 'Standard',
        createdAt: order.createdAt,
        priority: determinePriority(order)
      }));

      setAvailableOrders(orderLocations);
    } catch (error) {
      console.error('Error fetching available orders:', error);
      Alert.alert('Connection Issue', 'Unable to load available orders. Check your connection.');
    }
  };

  const calculateEstimatedPay = (order) => {
    const basePay = 8;
    const perMilePay = 1.5;
    const distance = parseFloat(order.distance) || 3;
    return basePay + (distance * perMilePay);
  };

  const calculateDistance = (from, to) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (to.latitude - from.latitude) * Math.PI / 180;
    const dLon = (to.longitude - from.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return `${distance.toFixed(1)} mi`;
  };

  const determinePriority = (order) => {
    const createdTime = new Date(order.createdAt).getTime();
    const now = Date.now();
    const hoursSinceCreation = (now - createdTime) / (1000 * 60 * 60);
    
    if (hoursSinceCreation > 2) return 'urgent';
    if (hoursSinceCreation > 1) return 'high';
    return 'normal';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#EF4444'; // red
      case 'high': return '#F59E0B'; // orange
      default: return '#10B981'; // green
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await apiClient.acceptOrder(orderId);
      Alert.alert(
        'Order Accepted!',
        'Navigate to the pickup location to begin',
        [
          {
            text: 'View Jobs',
            onPress: () => navigation.navigate('JobManagement')
          }
        ]
      );
      setSelectedOrder(null);
      fetchAvailableOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      Alert.alert('Error', error.message || 'Failed to accept order. Please try again.');
    }
  };

  const centerOnDriver = () => {
    if (driverLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...driverLocation,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 1000);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Loading Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Order Map</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
      >
        {/* Driver Location Marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="You"
            description="Your current location"
          >
            <View style={styles.driverMarker}>
              <View style={styles.driverMarkerInner}>
                <Text style={styles.driverMarkerText}>📍</Text>
              </View>
            </View>
          </Marker>
        )}

        {/* Available Order Markers */}
        {availableOrders.map((order) => (
          <Marker
            key={order.id}
            coordinate={{
              latitude: order.latitude,
              longitude: order.longitude,
            }}
            onPress={() => setSelectedOrder(order)}
          >
            <View style={[
              styles.orderMarker,
              { borderColor: getPriorityColor(order.priority) }
            ]}>
              <Text style={styles.orderMarkerIcon}>📦</Text>
              <View style={styles.orderMarkerBadge}>
                <Text style={styles.orderMarkerBadgeText}>${order.estimatedPay.toFixed(0)}</Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsCount}>{availableOrders.length}</Text>
        <Text style={styles.statsLabel}>Available</Text>
      </View>

      {/* Center on Driver Button */}
      {driverLocation && (
        <TouchableOpacity style={styles.centerButton} onPress={centerOnDriver}>
          <Text style={styles.centerButtonText}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Normal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>High</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Urgent</Text>
        </View>
      </View>

      {/* Order Details Modal */}
      {selectedOrder && (
        <View style={styles.orderDetails}>
          <View style={styles.orderDetailsHeader}>
            <Text style={styles.orderDetailsTitle}>Order #{selectedOrder.id.substring(0, 8)}</Text>
            <TouchableOpacity onPress={() => setSelectedOrder(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.orderDetailsBody}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Pickup</Text>
              <Text style={styles.detailValue}>{selectedOrder.pickupAddress}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📦 Deliver to</Text>
              <Text style={styles.detailValue}>{selectedOrder.deliveryAddress}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🚗 Distance</Text>
              <Text style={styles.detailValue}>{selectedOrder.distance}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>💰 Estimated Pay</Text>
              <Text style={styles.detailValueBold}>${selectedOrder.estimatedPay.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptOrder(selectedOrder.id)}
          >
            <Text style={styles.acceptButtonText}>Accept Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E8B57',
  },
  headerRight: {
    width: 60,
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverMarkerInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverMarkerText: {
    fontSize: 16,
  },
  orderMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderMarkerIcon: {
    fontSize: 20,
  },
  orderMarkerBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 32,
    alignItems: 'center',
  },
  orderMarkerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  statsCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E8B57',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  centerButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerButtonText: {
    fontSize: 24,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  orderDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  orderDetailsBody: {
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  detailValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  acceptButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
