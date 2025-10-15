import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Package, 
  Truck, 
  Clock, 
  Phone, 
  MessageCircle,
  Star,
  Camera,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TrackingOrder {
  id: string;
  status: string;
  trackingNumber: string;
  driver?: {
    name: string;
    phone: string;
    rating: number;
    vehicle: string;
    licensePlate: string;
  };
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedArrival: string;
  timeline: {
    eventType: string;
    description: string;
    timestamp: string;
    completed: boolean;
  }[];
}

export default function RealTimeTracking() {
  const [orderId, setOrderId] = useState(new URLSearchParams(window.location.search).get('order') || '');
  
  const { data: order, refetch } = useQuery<TrackingOrder>({
    queryKey: ['/api/tracking', orderId],
    enabled: !!orderId,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const getProgressPercentage = (status: string) => {
    const statusMap: Record<string, number> = {
      'created': 10,
      'assigned': 25,
      'pickup_scheduled': 40,
      'picked_up': 60,
      'in_transit': 80,
      'delivered': 100,
    };
    return statusMap[status] || 0;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'created': 'bg-gray-500',
      'assigned': 'bg-blue-500',
      'pickup_scheduled': 'bg-amber-500',
      'picked_up': 'bg-yellow-500',
      'in_transit': 'bg-purple-500',
      'delivered': 'bg-green-500',
    };
    return colorMap[status] || 'bg-gray-500';
  };

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please enter your order ID or tracking number to track your return pickup.</p>
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Enter order ID..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                data-testid="input-order-id"
              />
              <Button 
                onClick={() => refetch()}
                disabled={!orderId}
                data-testid="button-track"
              >
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Loading tracking information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Order Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                Order #{order.trackingNumber}
              </CardTitle>
              <p className="text-gray-600 mt-1">Real-time tracking and updates</p>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-white`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Order Progress</span>
                <span>{getProgressPercentage(order.status)}% Complete</span>
              </div>
              <Progress value={getProgressPercentage(order.status)} className="h-3" />
            </div>
            
            {order.estimatedArrival && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Estimated arrival: {new Date(order.estimatedArrival).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Driver Information */}
      {order.driver && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Your Driver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="font-semibold">{order.driver.name}</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{order.driver.rating}/5.0 rating</span>
                </div>
                <div className="text-sm text-gray-600">
                  {order.driver.vehicle} • {order.driver.licensePlate}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" data-testid="button-call-driver">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm" data-testid="button-message-driver">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Map - Placeholder for real map integration */}
      {order.currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Live Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center space-y-2">
                <MapPin className="h-8 w-8 mx-auto text-blue-500" />
                <p className="font-medium">Driver Location</p>
                <p className="text-sm text-gray-600">{order.currentLocation.address}</p>
                <p className="text-xs text-gray-500">
                  {order.currentLocation.lat}, {order.currentLocation.lng}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.timeline.map((event, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 ${
                  event.completed ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${
                        event.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {event.description}
                      </p>
                      {event.completed && (
                        <p className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {event.completed && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" size="sm" data-testid="button-contact-support">
              <MessageCircle className="h-4 w-4 mr-1" />
              Contact Support
            </Button>
            <Button variant="outline" size="sm" data-testid="button-emergency">
              <Phone className="h-4 w-4 mr-1" />
              Emergency
            </Button>
            <Button variant="outline" size="sm" data-testid="button-photo-proof">
              <Camera className="h-4 w-4 mr-1" />
              Photo Proof
            </Button>
            <Button variant="outline" size="sm" data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}