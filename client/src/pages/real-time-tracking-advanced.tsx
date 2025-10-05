import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Truck, Navigation, Phone, MessageSquare, Star } from 'lucide-react';
import { Link } from 'wouter';

interface DriverLocation {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  accuracy: number;
  timestamp: Date;
}

interface TrackingData {
  orderId: string;
  status: string;
  driver: {
    id: number;
    name: string;
    phone: string;
    rating: number;
    vehicle: string;
    photo: string;
  };
  currentLocation: DriverLocation;
  estimatedArrival: Date;
  route: {
    distance: string;
    duration: string;
    steps: Array<{
      instruction: string;
      distance: string;
      duration: string;
    }>;
  };
  updates: Array<{
    timestamp: Date;
    status: string;
    message: string;
    location?: string;
  }>;
}

export default function RealTimeTrackingAdvanced() {
  const [trackingData, setTrackingData] = useState<TrackingData>({
    orderId: 'RTN12345',
    status: 'en_route',
    driver: {
      id: 1,
      name: 'Mike Johnson',
      phone: '+1-314-555-0123',
      rating: 4.9,
      vehicle: '2022 Toyota Camry - Silver',
      photo: '/api/placeholder-driver.jpg'
    },
    currentLocation: {
      lat: 38.6270,
      lng: -90.1994,
      heading: 45,
      speed: 25,
      accuracy: 5,
      timestamp: new Date()
    },
    estimatedArrival: new Date(Date.now() + 12 * 60 * 1000),
    route: {
      distance: '2.3 miles',
      duration: '12 minutes',
      steps: [
        { instruction: 'Head north on Main St', distance: '0.5 mi', duration: '2 min' },
        { instruction: 'Turn right on Oak Ave', distance: '1.2 mi', duration: '5 min' },
        { instruction: 'Turn left on your street', distance: '0.6 mi', duration: '3 min' },
        { instruction: 'Arrive at destination', distance: '', duration: '2 min' }
      ]
    },
    updates: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'pickup_complete',
        message: 'Package picked up successfully',
        location: '123 Retailer St'
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        status: 'en_route',
        message: 'Driver is on the way to your location',
        location: 'Main St & 1st Ave'
      },
      {
        timestamp: new Date(),
        status: 'approaching',
        message: 'Driver is 2 blocks away',
        location: 'Oak Ave & 3rd St'
      }
    ]
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrackingData(prev => ({
        ...prev,
        currentLocation: {
          ...prev.currentLocation,
          lat: prev.currentLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.currentLocation.lng + (Math.random() - 0.5) * 0.001,
          timestamp: new Date()
        },
        estimatedArrival: new Date(Date.now() + Math.max(5, Math.floor(Math.random() * 15)) * 60 * 1000)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pickup_complete': return 'bg-blue-500';
      case 'en_route': return 'bg-yellow-500';
      case 'approaching': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pickup_complete': return 'Picked Up';
      case 'en_route': return 'En Route';
      case 'approaching': return 'Approaching';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent to-transparent py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Tracking</h1>
            <p className="text-muted-foreground">Order #{trackingData.orderId}</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-border text-muted-foreground">
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Tracking Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-5 w-5" />
                  Live Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                  {/* Simulated Map Interface */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100"></div>
                  <div className="absolute top-4 left-4 bg-white rounded-lg p-2 shadow-md">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Driver Location</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-md">
                    <div className="text-xs text-gray-600">Speed: {trackingData.currentLocation.speed} mph</div>
                    <div className="text-xs text-gray-600">Accuracy: ±{trackingData.currentLocation.accuracy}m</div>
                  </div>
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-red-500 mx-auto mb-2 animate-bounce" />
                    <p className="text-lg font-semibold text-gray-700">Mike is {trackingData.route.distance} away</p>
                    <p className="text-sm text-gray-600">ETA: {trackingData.estimatedArrival.toLocaleTimeString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Navigation className="h-5 w-5" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trackingData.route.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{step.instruction}</p>
                        {step.distance && (
                          <p className="text-sm text-gray-600">{step.distance} • {step.duration}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Truck className="h-5 w-5" />
                  Your Driver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">
                      {trackingData.driver.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{trackingData.driver.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{trackingData.driver.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{trackingData.driver.vehicle}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-green-300 text-green-700">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Text
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5" />
                  Status Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trackingData.updates.map((update, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(update.status)}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {getStatusText(update.status)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {update.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{update.message}</p>
                        {update.location && (
                          <p className="text-xs text-gray-600 mt-1">{update.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ETA Card */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-800">
                  {Math.ceil((trackingData.estimatedArrival.getTime() - Date.now()) / 60000)} min
                </div>
                <p className="text-sm text-green-700">Estimated arrival</p>
                <p className="text-xs text-green-600 mt-1">
                  Updated {Math.floor((Date.now() - trackingData.currentLocation.timestamp.getTime()) / 1000)}s ago
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}