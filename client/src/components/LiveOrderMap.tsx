import { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Package, MapPin, Navigation, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface OrderLocation {
  id: string;
  trackingNumber: string;
  latitude: number;
  longitude: number;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedPay: number;
  distance: string;
  packageType: string;
  createdAt: string;
  priority: 'normal' | 'high' | 'urgent';
}

interface LiveOrderMapProps {
  driverId?: number;
  onOrderAccept?: (orderId: string) => void;
}

export default function LiveOrderMap({ driverId, onOrderAccept }: LiveOrderMapProps) {
  const [viewport, setViewport] = useState({
    latitude: 38.6270, // St. Louis
    longitude: -90.1994,
    zoom: 11
  });
  const [availableOrders, setAvailableOrders] = useState<OrderLocation[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderLocation | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<any>(null);
  const { toast } = useToast();

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    fetchAvailableOrders();
    getCurrentLocation();

    // Refresh orders every 10 seconds
    const interval = setInterval(fetchAvailableOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setDriverLocation(location);
          setViewport(prev => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng,
            zoom: 12
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const response = await fetch('/api/driver/orders/available', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const orders = await response.json();
        
        // Transform orders to map locations
        const orderLocations: OrderLocation[] = orders.map((order: any) => ({
          id: order.id,
          trackingNumber: order.trackingNumber,
          latitude: parseFloat(order.pickupLatitude) || 38.6270 + (Math.random() - 0.5) * 0.1,
          longitude: parseFloat(order.pickupLongitude) || -90.1994 + (Math.random() - 0.5) * 0.1,
          pickupAddress: order.pickupAddress,
          deliveryAddress: order.deliveryAddress,
          estimatedPay: calculateEstimatedPay(order),
          distance: calculateDistance(driverLocation, {
            lat: parseFloat(order.pickupLatitude) || 38.6270,
            lng: parseFloat(order.pickupLongitude) || -90.1994
          }),
          packageType: order.packageType || 'Standard',
          createdAt: order.createdAt,
          priority: determinePriority(order)
        }));

        setAvailableOrders(orderLocations);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching available orders:', error);
      setIsLoading(false);
    }
  };

  const calculateEstimatedPay = (order: any): number => {
    // Base pay + distance-based calculation
    const basePay = 8;
    const perMilePay = 1.5;
    const distance = parseFloat(order.distance) || 3;
    return basePay + (distance * perMilePay);
  };

  const calculateDistance = (from: { lat: number; lng: number } | null, to: { lat: number; lng: number }): string => {
    if (!from) return 'Unknown';
    
    const R = 3959; // Earth's radius in miles
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return `${distance.toFixed(1)} mi`;
  };

  const determinePriority = (order: any): 'normal' | 'high' | 'urgent' => {
    const createdTime = new Date(order.createdAt).getTime();
    const now = Date.now();
    const hoursSinceCreation = (now - createdTime) / (1000 * 60 * 60);
    
    if (hoursSinceCreation > 2) return 'urgent';
    if (hoursSinceCreation > 1) return 'high';
    return 'normal';
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/driver/orders/${orderId}/accept`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Order Accepted!",
          description: "Navigate to the pickup location to begin",
        });
        
        setSelectedOrder(null);
        fetchAvailableOrders();
        
        if (onOrderAccept) {
          onOrderAccept(orderId);
        }
      } else {
        throw new Error('Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444'; // red
      case 'high': return '#F59E0B'; // orange
      default: return '#10B981'; // green
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Map configuration required</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px]" data-testid="live-order-map">
      <Map
        ref={mapRef}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl 
          position="top-right"
          trackUserLocation
          onGeolocate={(e) => {
            setDriverLocation({
              lat: e.coords.latitude,
              lng: e.coords.longitude
            });
          }}
        />

        {/* Driver's current location */}
        {driverLocation && (
          <Marker
            latitude={driverLocation.lat}
            longitude={driverLocation.lng}
            anchor="center"
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
              <div className="relative bg-blue-600 rounded-full p-2 shadow-lg">
                <Navigation className="h-5 w-5 text-white" />
              </div>
            </div>
          </Marker>
        )}

        {/* Available order markers */}
        {availableOrders.map((order) => (
          <Marker
            key={order.id}
            latitude={order.latitude}
            longitude={order.longitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedOrder(order);
            }}
          >
            <div 
              className="cursor-pointer transform hover:scale-110 transition-transform"
              data-testid={`marker-order-${order.id}`}
            >
              <div 
                className="relative bg-white rounded-full p-3 shadow-lg border-4"
                style={{ borderColor: getPriorityColor(order.priority) }}
              >
                <Package className="h-6 w-6" style={{ color: getPriorityColor(order.priority) }} />
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  ${order.estimatedPay}
                </div>
              </div>
            </div>
          </Marker>
        ))}

        {/* Order details popup */}
        {selectedOrder && (
          <Popup
            latitude={selectedOrder.latitude}
            longitude={selectedOrder.longitude}
            onClose={() => setSelectedOrder(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
            offset={25}
          >
            <div className="p-2 min-w-[280px]" data-testid="popup-order-details">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-900">New Pickup</h3>
                  <Badge 
                    className={
                      selectedOrder.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      selectedOrder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }
                  >
                    {selectedOrder.priority}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-900">Pickup</p>
                      <p className="text-amber-700 text-xs">{selectedOrder.pickupAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-900">Deliver to</p>
                      <p className="text-amber-700 text-xs">{selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                    <div className="flex items-center gap-1 text-amber-700">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">{selectedOrder.distance}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-700 font-bold">
                      <DollarSign className="h-4 w-4" />
                      <span>${selectedOrder.estimatedPay.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleAcceptOrder(selectedOrder.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  data-testid="button-accept-order"
                >
                  Accept Order
                </Button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating stats */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-amber-200">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-900">{availableOrders.length}</p>
            <p className="text-xs text-amber-600">Available</p>
          </div>
          {isLoading && (
            <div className="text-xs text-amber-600">Updating...</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-amber-200">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-amber-900">Normal Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-amber-900">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-amber-900">Urgent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
