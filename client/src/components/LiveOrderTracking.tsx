import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Truck, 
  Clock, 
  Navigation, 
  RefreshCw, 
  Phone,
  Package,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { locationService, type Location, type RouteInfo } from '@/lib/locationServices';
import { useToast } from '@/hooks/use-toast';

interface OrderStatus {
  id: string;
  customerName: string;
  driverName?: string;
  driverPhone?: string;
  status: 'created' | 'assigned' | 'en_route' | 'arrived' | 'picked_up' | 'dropped_off' | 'refunded';
  pickupAddress: string;
  dropoffAddress: string;
  estimatedArrival?: Date;
  actualPickupTime?: Date;
  actualDropoffTime?: Date;
  driverLocation?: Location;
  amount: number;
}

interface LiveOrderTrackingProps {
  orderId: string;
  onRefund?: () => void;
  className?: string;
}

export default function LiveOrderTracking({ 
  orderId, 
  onRefund,
  className = '' 
}: LiveOrderTrackingProps) {
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [driverRoute, setDriverRoute] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Mock order data - replace with real API calls
  useEffect(() => {
    const mockOrder: OrderStatus = {
      id: orderId,
      customerName: 'Sarah Johnson',
      driverName: 'Mike Rodriguez',
      driverPhone: '(636) 254-4821',
      status: 'en_route',
      pickupAddress: '123 Main St, St. Louis, MO 63101',
      dropoffAddress: 'Target - Chesterfield Valley',
      estimatedArrival: new Date(Date.now() + 12 * 60 * 1000), // 12 minutes
      driverLocation: {
        lat: 38.6270,
        lng: -90.1994
      },
      amount: 8.99
    };
    
    setOrder(mockOrder);
    setIsLoading(false);
    calculateDriverRoute(mockOrder);
  }, [orderId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshOrderStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const calculateDriverRoute = async (orderData: OrderStatus) => {
    if (!orderData.driverLocation) return;

    try {
      // For demo, calculate route from driver to pickup
      const pickupLocation = { lat: 38.6324, lng: -90.2040 }; // Mock pickup coordinates
      const route = await locationService.calculateRoute(
        orderData.driverLocation, 
        pickupLocation
      );
      setDriverRoute(route);
    } catch (error) {
      console.error('Failed to calculate driver route:', error);
    }
  };

  const refreshOrderStatus = async () => {
    setLastUpdate(new Date());
    // In real implementation, this would fetch latest order status from API
    toast({
      title: "Status updated",
      description: "Order status refreshed",
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      created: 'bg-gray-100 text-gray-800',
      assigned: 'bg-blue-100 text-blue-800',
      en_route: 'bg-purple-100 text-purple-800',
      arrived: 'bg-yellow-100 text-yellow-800',
      picked_up: 'bg-orange-100 text-orange-800',
      dropped_off: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.created;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <Package className="h-4 w-4" />;
      case 'assigned': return <Truck className="h-4 w-4" />;
      case 'en_route': return <Navigation className="h-4 w-4" />;
      case 'arrived': return <MapPin className="h-4 w-4" />;
      case 'picked_up': return <CheckCircle className="h-4 w-4" />;
      case 'dropped_off': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    const messages = {
      created: 'Order created and looking for driver',
      assigned: 'Driver assigned and preparing',
      en_route: 'Driver is on the way to pickup',
      arrived: 'Driver has arrived at pickup location',
      picked_up: 'Package picked up, heading to drop-off',
      dropped_off: 'Package successfully delivered',
      refunded: 'Order cancelled and refunded'
    };
    return messages[status as keyof typeof messages] || 'Unknown status';
  };

  if (isLoading) {
    return (
      <Card className={`border-blue-200 ${className}`}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-700">Loading order status...</span>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="text-center py-8">
          <p className="text-red-600">Order not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-900 flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Order {order.id}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshOrderStatus}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{order.status.replace('_', ' ').toUpperCase()}</span>
            </Badge>
            
            {order.estimatedArrival && ['assigned', 'en_route'].includes(order.status) && (
              <div className="text-right">
                <p className="text-xs text-blue-600">ETA</p>
                <p className="text-sm font-semibold text-blue-900">
                  {order.estimatedArrival.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            )}
          </div>
          
          <p className="text-sm text-blue-700 mb-2">{getStatusMessage(order.status)}</p>
          
          {driverRoute && ['en_route', 'arrived'].includes(order.status) && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="text-center p-2 bg-white rounded">
                <p className="text-xs text-blue-600">Distance</p>
                <p className="text-sm font-semibold text-blue-900">{driverRoute.distance}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-xs text-blue-600">ETA</p>
                <p className="text-sm font-semibold text-blue-900">{driverRoute.duration}</p>
              </div>
            </div>
          )}
        </div>

        {/* Driver Information */}
        {order.driverName && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Your Driver</h4>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{order.driverName}</p>
                <p className="text-sm text-gray-600">Returnly Driver</p>
              </div>
              
              {order.driverPhone && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`tel:${order.driverPhone}`, '_self')}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Pickup & Drop-off Locations */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Pickup</p>
              <p className="text-xs text-gray-600 truncate">{order.pickupAddress}</p>
              {order.actualPickupTime && (
                <p className="text-xs text-green-600">
                  ✓ Picked up at {order.actualPickupTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 pl-1">
            <div className="w-px h-4 bg-gray-300"></div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Drop-off</p>
              <p className="text-xs text-gray-600 truncate">{order.dropoffAddress}</p>
              {order.actualDropoffTime && (
                <p className="text-xs text-green-600">
                  ✓ Delivered at {order.actualDropoffTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Amount */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-600">Total Paid</span>
          <span className="font-semibold text-gray-900">${order.amount.toFixed(2)}</span>
        </div>

        {/* Action Buttons */}
        {['created', 'assigned'].includes(order.status) && onRefund && (
          <Button
            variant="outline"
            onClick={onRefund}
            className="w-full border-red-300 text-red-700 hover:bg-red-50"
          >
            Cancel & Refund Order
          </Button>
        )}

        {/* Last Updated */}
        <p className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}