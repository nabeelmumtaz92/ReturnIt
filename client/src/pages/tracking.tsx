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
  RefreshCw,
  Camera,
  FileText,
  Car
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useWebSocketTracking } from '@/hooks/useWebSocket';
import CustomerTrackingMap from '@/components/CustomerTrackingMap';
import { EngagementOfferBanner } from '@/components/EngagementOfferBanner';

const formSchema = z.object({
  trackingNumber: trackingNumberSchema,
  zipCode: z.string().min(5, 'ZIP code must be at least 5 digits').max(10, 'ZIP code is too long'),
});

interface TrackingInfo {
  orderId: string;
  trackingNumber: string;
  status: string;
  statusDisplayName: string;
  pickup: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
    scheduledTime?: string;
    actualTime?: string;
  };
  delivery: {
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
    estimatedTime?: string;
    actualTime?: string;
  };
  driver: {
    assigned: boolean;
    assignedAt?: string;
    firstName?: string;
    lastName?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehicleYear?: string;
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
  deliveryPhotos?: {
    verification: Array<string | { uri?: string; base64?: string; timestamp?: string }>;
    completion: Array<string | { uri?: string; base64?: string; timestamp?: string }>;
    signature: string | null;
    notes: string | null;
  };
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
        return 'bg-amber-100 text-amber-800 border-amber-200';
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

const DriverVehicleCard = ({ trackingInfo }: { trackingInfo: TrackingInfo }) => {
  if (!trackingInfo.driver.assigned) {
    return null;
  }

  const { driver, status } = trackingInfo;
  const driverName = driver.firstName || 'Your driver';
  const vehicleInfo = driver.vehicleMake && driver.vehicleModel 
    ? `${driver.vehicleColor || ''} ${driver.vehicleYear || ''} ${driver.vehicleMake} ${driver.vehicleModel}`.trim()
    : null;

  // Show Uber-style message for en route and picked up statuses
  const isEnRoute = status === 'en_route' || status === 'picked_up' || status === 'driver_assigned';

  if (!isEnRoute || !vehicleInfo) {
    return null;
  }

  return (
    <Card className="w-full border-border bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 rounded-full p-3">
            <Car className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-foreground mb-1">
              Your Return It driver <span className="text-primary">{driverName}</span> {status === 'picked_up' ? 'is on the way' : 'has been assigned'}
            </p>
            <p className="text-muted-foreground">
              in a {vehicleInfo}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DriverLocationCard = ({ trackingInfo }: { trackingInfo: TrackingInfo }) => {
  if (!trackingInfo.driver.assigned || !trackingInfo.driver.currentLocation) {
    return null;
  }

  const { currentLocation } = trackingInfo.driver;
  const lastUpdate = new Date(currentLocation.timestamp);

  return (
    <Card className="w-full border-border bg-gradient-to-r from-transparent to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Navigation className="h-5 w-5" />
          Driver Location
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Live GPS tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Coordinates:</span>
            </div>
            <div className="text-sm text-foreground font-mono bg-white/50 rounded px-2 py-1">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Last Update:</span>
            </div>
            <div className="text-sm text-foreground">
              {format(lastUpdate, 'MMM d, h:mm a')}
            </div>
          </div>
        </div>
        
        {currentLocation.accuracy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/30 rounded px-2 py-1">
            <span className="font-medium">Accuracy:</span>
            <span>±{currentLocation.accuracy}m</span>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border text-muted-foreground hover:bg-accent"
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

const DeliveryPhotosCard = ({ deliveryPhotos }: { deliveryPhotos?: TrackingInfo['deliveryPhotos'] }) => {
  if (!deliveryPhotos || (deliveryPhotos.verification.length === 0 && deliveryPhotos.completion.length === 0)) {
    return null;
  }

  const allPhotos = [...deliveryPhotos.verification, ...deliveryPhotos.completion];
  const hasSignature = deliveryPhotos.signature && deliveryPhotos.signature !== '';
  const hasNotes = deliveryPhotos.notes && deliveryPhotos.notes !== '';

  return (
    <Card className="w-full border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Camera className="h-5 w-5" />
          Delivery Verification
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Photos and signature from your driver
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photos Grid */}
        {allPhotos.length > 0 && (
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Package Photos ({allPhotos.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allPhotos.map((photo, index) => {
                // Handle both string and object formats
                let imageUrl: string | null = null;
                if (typeof photo === 'string') {
                  // Photo is already a full data URL or URI
                  imageUrl = photo;
                } else if (photo && typeof photo === 'object') {
                  // Photo is an object with base64 or uri property
                  if (photo.base64) {
                    imageUrl = photo.base64.startsWith('data:') 
                      ? photo.base64 
                      : `data:image/jpeg;base64,${photo.base64}`;
                  } else if (photo.uri) {
                    imageUrl = photo.uri;
                  }
                }
                
                return (
                  <div 
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden border border-border bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => imageUrl && window.open(imageUrl, '_blank')}
                    data-testid={`delivery-photo-${index}`}
                  >
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={`Delivery photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Click to view full size</p>
          </div>
        )}

        {/* Customer Signature */}
        {hasSignature && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Customer Signature</p>
            <div className="bg-accent rounded-lg p-4 border border-border">
              <p className="text-foreground font-mono">{deliveryPhotos.signature}</p>
            </div>
          </div>
        )}

        {/* Driver Notes */}
        {hasNotes && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Delivery Notes
            </p>
            <div className="bg-accent rounded-lg p-4 border border-border">
              <p className="text-foreground text-sm">{deliveryPhotos.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EventTimeline = ({ events }: { events: TrackingEvent[] }) => {
  if (!events.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
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
        <CardTitle className="flex items-center gap-2 text-foreground">
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
                <div className="w-8 h-8 rounded-full bg-accent border-2 border-border flex items-center justify-center text-muted-foreground">
                  {getEventIcon(event.eventType)}
                </div>
                {index < sortedEvents.length - 1 && (
                  <div className="w-px h-4 bg-accent mt-2" />
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
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
  const [searchedZipCode, setSearchedZipCode] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingNumber: '',
      zipCode: '',
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
    queryKey: [`/api/tracking/${searchedTrackingNumber}?zipCode=${searchedZipCode}`],
    enabled: !!searchedTrackingNumber && !!searchedZipCode,
    refetchInterval: searchedTrackingNumber ? (wsConnected ? 120000 : 30000) : false, // 2 min if WS connected, 30s if not
    staleTime: wsConnected ? 60000 : 25000, // Longer stale time if WS connected
  });

  // Fetch tracking events with smart polling
  const { data: trackingEvents, isLoading: isLoadingEvents, error: eventsError } = useQuery<TrackingEventsResponse>({
    queryKey: [`/api/tracking/${searchedTrackingNumber}/events?zipCode=${searchedZipCode}`],
    enabled: !!searchedTrackingNumber && !!searchedZipCode,
    refetchInterval: searchedTrackingNumber ? (wsConnected ? 120000 : 30000) : false,
    staleTime: wsConnected ? 60000 : 25000,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const trackingNumber = values.trackingNumber.trim().toUpperCase();
    const zipCode = values.zipCode.trim();
    setSearchedTrackingNumber(trackingNumber);
    setSearchedZipCode(zipCode);
    
    toast({
      title: "Tracking Order",
      description: `Searching for tracking number: ${trackingNumber}`,
    });
  };

  const handleManualRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    refetchTracking();
    queryClient.invalidateQueries({ 
      queryKey: [`/api/tracking/${searchedTrackingNumber}/events?zipCode=${searchedZipCode}`] 
    });
    
    toast({
      title: "Refreshing",
      description: "Updating tracking information...",
    });
  }, [refetchTracking, searchedTrackingNumber, searchedZipCode, queryClient, toast]);

  const isLoading = isLoadingTracking || isLoadingEvents;
  const hasError = trackingError || eventsError;

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f]">
      {/* Header */}
      <div className="bg-white/95 border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Track Your Return
            </h1>
            <p className="text-muted-foreground text-lg">
              Enter your tracking number to see real-time updates
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Tracking Form */}
        <Card className="w-full mb-8 border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-foreground">
              <Package className="h-6 w-6" />
              Enter Tracking Number
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              For security, you'll need both your tracking number and pickup ZIP code
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
                      <FormLabel className="text-foreground font-medium">Tracking Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="RTN-ABC12345"
                          className="text-center text-lg font-mono border-border focus:border-border"
                          data-testid="input-tracking-number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Pickup ZIP Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="63101"
                          className="text-center text-lg font-mono border-border focus:border-border"
                          data-testid="input-zip-code"
                          maxLength={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">Enter the ZIP code from your pickup address</p>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg"
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
            <div className="flex justify-between items-center bg-white/50 rounded-lg px-4 py-2 border border-border">
              <ConnectionStatus 
                isConnected={wsConnected}
                isConnecting={wsConnecting}
                error={wsError}
                onManualRefresh={handleManualRefresh}
              />
              <div className="text-xs text-muted-foreground">
                {wsConnected ? 'Live updates' : 'Every 30 seconds'}
              </div>
            </div>

            {/* Order Status Card */}
            <Card className="w-full border-border bg-gradient-to-r from-transparent to-transparent">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Package className="h-5 w-5" />
                      Order {trackingInfo.orderId}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-medium">
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
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Pickup Address
                    </h4>
                    <p className="text-sm text-foreground">{trackingInfo.pickup.address}</p>
                    {trackingInfo.pickup.scheduledTime && (
                      <p className="text-xs text-muted-foreground">
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
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery To
                    </h4>
                    <p className="text-sm text-foreground">
                      {trackingInfo.delivery.address || trackingInfo.retailer}
                    </p>
                    {trackingInfo.estimatedArrival && (
                      <p className="text-xs text-muted-foreground">
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

                <Separator className="bg-accent" />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
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

            {/* Driver & Vehicle Information (Uber-style) */}
            <DriverVehicleCard trackingInfo={trackingInfo} />

            {/* Partner Engagement Offer Banner */}
            <EngagementOfferBanner />

            {/* Live Tracking Map */}
            {trackingInfo.driver.assigned && trackingInfo.driver.currentLocation && trackingInfo.pickup.coordinates && (
              <Card className="w-full border-border overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <MapPin className="h-5 w-5" />
                    Live GPS Tracking
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Real-time driver location updated automatically
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <CustomerTrackingMap
                    driverLocation={trackingInfo.driver.currentLocation}
                    pickupLocation={{
                      lat: trackingInfo.pickup.coordinates.lat,
                      lng: trackingInfo.pickup.coordinates.lng,
                      address: trackingInfo.pickup.address
                    }}
                    deliveryLocation={
                      trackingInfo.delivery.coordinates ? {
                        lat: trackingInfo.delivery.coordinates.lat,
                        lng: trackingInfo.delivery.coordinates.lng,
                        address: trackingInfo.delivery.address || ''
                      } : undefined
                    }
                    orderStatus={trackingInfo.status}
                  />
                </CardContent>
              </Card>
            )}

            {/* Driver Location Card */}
            <DriverLocationCard trackingInfo={trackingInfo} />

            {/* Delivery Photos and Verification */}
            <DeliveryPhotosCard deliveryPhotos={trackingInfo.deliveryPhotos} />

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
                className="border-border text-muted-foreground hover:bg-accent"
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