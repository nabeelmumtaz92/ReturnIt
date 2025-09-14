import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { trackingNumberSchema } from '@shared/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Star,
  Navigation,
  Calendar,
  Timer,
  User,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useWebSocketTracking } from '@/hooks/useWebSocket';

const formSchema = z.object({
  trackingNumber: trackingNumberSchema,
});

interface TrackingInfo {
  orderId: string;
  trackingNumber: string;
  status: string;
  statusDisplayName: string;
  pickup: {
    address: string;
    scheduledTime?: string;
    actualTime?: string;
  };
  delivery: {
    address?: string;
    estimatedTime?: string;
    actualTime?: string;
  };
  driver: {
    assigned: boolean;
    assignedAt?: string;
    currentLocation?: {
      lat: number;
      lng: number;
      accuracy?: number;
      timestamp: string;
    };
  };
  lastUpdate: string;
  estimatedArrival?: string;
  retailer: string;
}

interface TrackingEvent {
  id: number;
  eventType: string;
  description: string;
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
  driverId?: number;
  metadata?: any;
}

interface TrackingEventsResponse {
  totalEvents: number;
  events: TrackingEvent[];
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'driver_assigned':
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pickup_scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'picked_up':
      case 'en_route':
      case 'in_transit':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} font-medium px-3 py-1 text-sm border`}>
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  );
};

const DriverLocationCard = ({ trackingInfo }: { trackingInfo: TrackingInfo }) => {
  if (!trackingInfo.driver.assigned || !trackingInfo.driver.currentLocation) {
    return null;
  }

  const { currentLocation } = trackingInfo.driver;
  const lastUpdate = new Date(currentLocation.timestamp);

  return (
    <Card className="w-full border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Navigation className="h-5 w-5" />
          Driver Location
        </CardTitle>
        <CardDescription className="text-amber-700">
          Live GPS tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-900">Coordinates:</span>
            </div>
            <div className="text-sm text-amber-800 font-mono bg-white/50 rounded px-2 py-1">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-900">Last Update:</span>
            </div>
            <div className="text-sm text-amber-800">
              {format(lastUpdate, 'MMM d, h:mm a')}
            </div>
          </div>
        </div>
        
        {currentLocation.accuracy && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-white/30 rounded px-2 py-1">
            <span className="font-medium">Accuracy:</span>
            <span>±{currentLocation.accuracy}m</span>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
            onClick={() => {
              const googleMapsUrl = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
              window.open(googleMapsUrl, '_blank');
            }}
            data-testid="button-view-on-map"
          >
            <MapPin className="h-4 w-4 mr-2" />
            View on Google Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EventTimeline = ({ events }: { events: TrackingEvent[] }) => {
  if (!events.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Timer className="h-5 w-5" />
            Tracking Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No tracking events available</p>
        </CardContent>
      </Card>
    );
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getEventIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'order_created':
        return <Package className="h-4 w-4" />;
      case 'driver_assigned':
        return <User className="h-4 w-4" />;
      case 'picked_up':
        return <CheckCircle className="h-4 w-4" />;
      case 'en_route':
      case 'location_update':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Timer className="h-5 w-5" />
          Tracking Timeline
        </CardTitle>
        <CardDescription>
          Real-time updates for your order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <div key={event.id || index} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700">
                  {getEventIcon(event.eventType)}
                </div>
                {index < sortedEvents.length - 1 && (
                  <div className="w-px h-4 bg-amber-200 mt-2" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {event.description}
                  </h4>
                  <time className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                  </time>
                </div>
                {event.location && (
                  <p className="text-xs text-gray-600 mt-1">
                    Location: {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
                  </p>
                )}
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {event.metadata.accuracy && (
                      <span>Accuracy: ±{event.metadata.accuracy}m</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Connection status component
const ConnectionStatus = ({ 
  isConnected, 
  isConnecting, 
  error, 
  onManualRefresh 
}: { 
  isConnected: boolean; 
  isConnecting: boolean; 
  error: string | null;
  onManualRefresh: () => void;
}) => {
  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <Wifi className="h-4 w-4" />
        <span>Real-time updates active</span>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-amber-600 text-sm">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Connecting to real-time updates...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-500 text-sm">
      <WifiOff className="h-4 w-4" />
      <span>Using periodic updates</span>
      {error && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onManualRefresh}
          className="ml-2 h-6 px-2 text-xs"
          data-testid="button-manual-refresh"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      )}
    </div>
  );
};

export default function TrackingPage() {
  const [searchedTrackingNumber, setSearchedTrackingNumber] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingNumber: '',
    },
  });

  // WebSocket connection for real-time updates
  const {
    isConnected: wsConnected,
    isConnecting: wsConnecting,
    error: wsError,
    lastMessage: wsLastMessage
  } = useWebSocketTracking({
    trackingNumber: searchedTrackingNumber,
    onMessage: useCallback((message) => {
      console.log('📦 Real-time tracking update:', message);
      
      // Show toast for important updates
      if (message.type === 'status_update') {
        toast({
          title: "Status Updated",
          description: `Order status: ${message.data.statusDisplayName}`,
        });
      } else if (message.type === 'location_update') {
        // Subtle notification for location updates to avoid spam
        console.log(`📍 Driver location updated for ${message.trackingNumber}`);
      }
    }, [toast]),
    onConnect: useCallback(() => {
      console.log(`✅ Real-time tracking connected for ${searchedTrackingNumber}`);
      toast({
        title: "Real-time Updates",
        description: "Connected to live tracking updates",
      });
    }, [searchedTrackingNumber, toast]),
    onDisconnect: useCallback(() => {
      console.log(`🔌 Real-time tracking disconnected for ${searchedTrackingNumber}`);
    }, [searchedTrackingNumber]),
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 3
  });

  // Fetch tracking information with smart polling (reduced when WebSocket connected)
  const { data: trackingInfo, isLoading: isLoadingTracking, error: trackingError, refetch: refetchTracking } = useQuery<TrackingInfo>({
    queryKey: ['/api/tracking', searchedTrackingNumber],
    enabled: !!searchedTrackingNumber,
    refetchInterval: searchedTrackingNumber ? (wsConnected ? 120000 : 30000) : false, // 2 min if WS connected, 30s if not
    staleTime: wsConnected ? 60000 : 25000, // Longer stale time if WS connected
  });

  // Fetch tracking events with smart polling
  const { data: trackingEvents, isLoading: isLoadingEvents, error: eventsError } = useQuery<TrackingEventsResponse>({
    queryKey: ['/api/tracking', searchedTrackingNumber, 'events'],
    enabled: !!searchedTrackingNumber,
    refetchInterval: searchedTrackingNumber ? (wsConnected ? 120000 : 30000) : false,
    staleTime: wsConnected ? 60000 : 25000,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const trackingNumber = values.trackingNumber.trim().toUpperCase();
    setSearchedTrackingNumber(trackingNumber);
    
    toast({
      title: "Tracking Order",
      description: `Searching for tracking number: ${trackingNumber}`,
    });
  };

  const handleManualRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    refetchTracking();
    queryClient.invalidateQueries({ 
      queryKey: ['/api/tracking', searchedTrackingNumber, 'events'] 
    });
    
    toast({
      title: "Refreshing",
      description: "Updating tracking information...",
    });
  }, [refetchTracking, searchedTrackingNumber, toast]);

  const isLoading = isLoadingTracking || isLoadingEvents;
  const hasError = trackingError || eventsError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/95 border-b border-amber-100 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-2">
              Track Your Return
            </h1>
            <p className="text-amber-700 text-lg">
              Enter your tracking number to see real-time updates
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Tracking Form */}
        <Card className="w-full mb-8 border-amber-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-amber-900">
              <Package className="h-6 w-6" />
              Enter Tracking Number
            </CardTitle>
            <CardDescription className="text-amber-700">
              Format: RTN-XXXXXXXX (e.g., RTN-ABC12345)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="trackingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-900 font-medium">Tracking Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="RTN-ABC12345"
                          className="text-center text-lg font-mono border-amber-200 focus:border-amber-400"
                          data-testid="input-tracking-number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg"
                  disabled={isLoading}
                  data-testid="button-track-order"
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Package className="h-5 w-5 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Error States */}
        {hasError && searchedTrackingNumber && (
          <Alert className="mb-8 border-red-200 bg-red-50" data-testid="alert-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {trackingError?.message || eventsError?.message || 'Unable to find tracking information. Please check your tracking number and try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading States */}
        {isLoading && searchedTrackingNumber && (
          <div className="space-y-6">
            <Card className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tracking Results */}
        {trackingInfo && !hasError && (
          <div className="space-y-6" data-testid="tracking-results">
            {/* Connection Status */}
            <div className="flex justify-between items-center bg-white/50 rounded-lg px-4 py-2 border border-amber-100">
              <ConnectionStatus 
                isConnected={wsConnected}
                isConnecting={wsConnecting}
                error={wsError}
                onManualRefresh={handleManualRefresh}
              />
              <div className="text-xs text-amber-600">
                {wsConnected ? 'Live updates' : 'Every 30 seconds'}
              </div>
            </div>

            {/* Order Status Card */}
            <Card className="w-full border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <Package className="h-5 w-5" />
                      Order {trackingInfo.orderId}
                    </CardTitle>
                    <CardDescription className="text-amber-700 font-medium">
                      {trackingInfo.trackingNumber}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={trackingInfo.status} />
                    {wsLastMessage && (
                      <div className="text-xs text-green-600 font-medium">
                        {wsLastMessage.type === 'location_update' ? '📍 Live' : 
                         wsLastMessage.type === 'status_update' ? '📊 Updated' : '📡 Active'}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-amber-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Pickup Address
                    </h4>
                    <p className="text-sm text-amber-800">{trackingInfo.pickup.address}</p>
                    {trackingInfo.pickup.scheduledTime && (
                      <p className="text-xs text-amber-700">
                        Scheduled: {format(new Date(trackingInfo.pickup.scheduledTime), 'MMM d, h:mm a')}
                      </p>
                    )}
                    {trackingInfo.pickup.actualTime && (
                      <p className="text-xs text-green-700 font-medium">
                        Picked up: {format(new Date(trackingInfo.pickup.actualTime), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-amber-900 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery To
                    </h4>
                    <p className="text-sm text-amber-800">
                      {trackingInfo.delivery.address || trackingInfo.retailer}
                    </p>
                    {trackingInfo.estimatedArrival && (
                      <p className="text-xs text-amber-700">
                        ETA: {format(new Date(trackingInfo.estimatedArrival), 'MMM d, h:mm a')}
                      </p>
                    )}
                    {trackingInfo.delivery.actualTime && (
                      <p className="text-xs text-green-700 font-medium">
                        Delivered: {format(new Date(trackingInfo.delivery.actualTime), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="bg-amber-200" />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-amber-700">
                  <span>Last Updated: {format(new Date(trackingInfo.lastUpdate), 'MMM d, h:mm a')}</span>
                  {trackingInfo.driver.assigned && (
                    <div className="flex items-center gap-1 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Driver Assigned
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Driver Location Card */}
            <DriverLocationCard trackingInfo={trackingInfo} />

            {/* Event Timeline */}
            {trackingEvents && (
              <EventTimeline events={trackingEvents.events} />
            )}

            {/* Refresh Button */}
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  refetchTracking();
                  toast({
                    title: "Refreshed",
                    description: "Tracking information has been updated",
                  });
                }}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                data-testid="button-refresh"
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh Tracking
              </Button>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!trackingInfo && !isLoading && !hasError && searchedTrackingNumber && (
          <Card className="w-full text-center py-8">
            <CardContent>
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tracking information found</h3>
              <p className="text-gray-600">
                Please verify your tracking number and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="w-full mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-800">
            <p>• Tracking numbers have the format RTN-XXXXXXXX</p>
            <p>• You can find your tracking number in your order confirmation email</p>
            <p>• Tracking information updates every 30 seconds automatically</p>
            <p>• Contact support if you're having trouble finding your order</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}