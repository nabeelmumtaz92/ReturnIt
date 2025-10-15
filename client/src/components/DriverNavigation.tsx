import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Phone, 
  RefreshCw, 
  Target, 
  Route,
  Smartphone,
  ExternalLink,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { locationService, useCurrentLocation, type Location, type RouteInfo } from '@/lib/locationServices';
import { useToast } from '@/hooks/use-toast';

interface DriverJob {
  id: string;
  customer: string;
  customerPhone: string;
  status: 'available' | 'accepted' | 'en_route' | 'arrived' | 'picked_up' | 'completed';
  amount: number;
  pickupAddress: string;
  dropoffLocation: string;
  pickupLocation?: Location;
  dropoffLocationCoords?: Location;
  specialInstructions?: string;
}

interface DriverNavigationProps {
  job: DriverJob;
  onStatusUpdate: (status: DriverJob['status']) => void;
  className?: string;
}

export default function DriverNavigation({ 
  job, 
  onStatusUpdate,
  className = '' 
}: DriverNavigationProps) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [eta, setEta] = useState<Date | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [showNavigationOptions, setShowNavigationOptions] = useState(false);
  const { location: currentLocation, getCurrentLocation } = useCurrentLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Calculate route when job is accepted
    if (job.status === 'accepted' && job.pickupLocation && currentLocation) {
      calculateRoute();
    }
  }, [job.status, job.pickupLocation, currentLocation]);

  useEffect(() => {
    // Check geofencing
    if (currentLocation && job.pickupLocation) {
      const withinPickupGeofence = locationService.isWithinGeofence(
        currentLocation, 
        job.pickupLocation, 
        100 // 100 meter radius
      );
      setIsWithinGeofence(withinPickupGeofence);
      
      if (withinPickupGeofence && job.status === 'en_route') {
        onStatusUpdate('arrived');
        toast({
          title: "Arrived at pickup",
          description: "You're now at the pickup location",
        });
      }
    }
  }, [currentLocation, job.pickupLocation, job.status]);

  const calculateRoute = async () => {
    if (!job.pickupLocation || !currentLocation) return;

    setIsLoadingRoute(true);
    try {
      const route = await locationService.calculateRoute(currentLocation, job.pickupLocation);
      setRouteInfo(route);
      
      // Calculate ETA
      const etaTime = new Date(Date.now() + route.durationValue * 1000);
      setEta(etaTime);
      
      toast({
        title: "Route calculated",
        description: `${route.distance} • ${route.duration} to pickup`,
      });
    } catch (error) {
      console.error('Route calculation failed:', error);
      toast({
        title: "Route error",
        description: "Could not calculate route to pickup",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const refreshLocation = async () => {
    try {
      await getCurrentLocation();
      if (job.pickupLocation) {
        calculateRoute();
      }
    } catch (error) {
      console.error('Location refresh failed:', error);
      toast({
        title: "Location error",
        description: "Could not refresh your location",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (app: 'apple' | 'google' | 'waze') => {
    const destination = job.status === 'picked_up' && job.dropoffLocationCoords 
      ? job.dropoffLocationCoords 
      : job.pickupLocation;
    
    if (destination) {
      locationService.openNavigationApp(destination, app);
      setShowNavigationOptions(false);
      
      // Update status to en_route if not already
      if (job.status === 'accepted') {
        onStatusUpdate('en_route');
      }
    }
  };

  const getNextDestination = () => {
    return job.status === 'picked_up' ? 'Drop-off' : 'Pickup';
  };

  const getNextAddress = () => {
    return job.status === 'picked_up' ? job.dropoffLocation : job.pickupAddress;
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'en_route': return 'bg-purple-100 text-purple-800';
      case 'arrived': return 'bg-yellow-100 text-yellow-800';
      case 'picked_up': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-900 flex items-center justify-between">
          <div className="flex items-center">
            <Navigation className="h-5 w-5 mr-2" />
            Navigation - Job {job.id}
          </div>
          <Badge className={getStatusColor()}>
            {job.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Destination */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {getNextDestination()}
              </span>
            </div>
            {isWithinGeofence && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Arrived
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-blue-700 font-medium">{job.customer}</p>
            <p className="text-sm text-blue-600">{getNextAddress()}</p>
            
            {job.specialInstructions && (
              <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                📝 {job.specialInstructions}
              </p>
            )}
          </div>
        </div>

        {/* Route Information */}
        {isLoadingRoute ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
            <span className="text-blue-700">Calculating route...</span>
          </div>
        ) : routeInfo ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Route className="h-4 w-4 text-gray-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">Distance</p>
              <p className="text-sm font-bold text-gray-900">{routeInfo.distance}</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-4 w-4 text-gray-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">ETA</p>
              <p className="text-sm font-bold text-gray-900">
                {eta?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--:--'}
              </p>
            </div>
          </div>
        ) : null}

        {/* Navigation Actions */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Dialog open={showNavigationOptions} onOpenChange={setShowNavigationOptions}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <Navigation className="h-4 w-4 mr-2" />
                  Start Navigation
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-blue-900">Choose Navigation App</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation('google')}
                    className="w-full justify-start border-blue-200 hover:bg-blue-50"
                  >
                    <Smartphone className="h-4 w-4 mr-3" />
                    Google Maps
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation('apple')}
                    className="w-full justify-start border-blue-200 hover:bg-blue-50"
                  >
                    <Smartphone className="h-4 w-4 mr-3" />
                    Apple Maps
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation('waze')}
                    className="w-full justify-start border-blue-200 hover:bg-blue-50"
                  >
                    <Smartphone className="h-4 w-4 mr-3" />
                    Waze
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              onClick={refreshLocation}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Customer Contact */}
          <Button
            variant="outline"
            onClick={() => window.open(`tel:${job.customerPhone}`, '_self')}
            className="w-full border-green-300 text-green-700 hover:bg-green-50"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Customer - {job.customerPhone}
          </Button>
        </div>

        {/* Status Update Actions */}
        <div className="border-t border-blue-200 pt-4">
          {job.status === 'arrived' && (
            <Button
              onClick={() => onStatusUpdate('picked_up')}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Picked Up
            </Button>
          )}
          
          {job.status === 'picked_up' && (
            <Button
              onClick={() => onStatusUpdate('completed')}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Delivered
            </Button>
          )}
        </div>

        {/* Route Quality Indicators */}
        {routeInfo && (
          <div className="text-xs text-blue-600 text-center border-t border-blue-200 pt-3">
            Auto-refreshing ETA • Geofence enabled
          </div>
        )}
      </CardContent>
    </Card>
  );
}