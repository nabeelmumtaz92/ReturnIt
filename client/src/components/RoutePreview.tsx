import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, Truck, RefreshCw, Loader2 } from 'lucide-react';
import { locationService, type Location, type RouteInfo } from '@/lib/locationServices';
import { useToast } from '@/hooks/use-toast';

interface RoutePreviewProps {
  pickupLocation: Location;
  dropoffLocation: Location;
  pickupAddress: string;
  dropoffAddress: string;
  onFareCalculated: (fare: number, routeInfo: RouteInfo) => void;
  className?: string;
}

export default function RoutePreview({
  pickupLocation,
  dropoffLocation,
  pickupAddress,
  dropoffAddress,
  onFareCalculated,
  className = ''
}: RoutePreviewProps) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fare, setFare] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calculateRoute = async () => {
    if (!pickupLocation || !dropoffLocation) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const route = await locationService.calculateRoute(pickupLocation, dropoffLocation);
      const calculatedFare = locationService.calculateFare(route.distanceValue, route.durationValue);
      
      setRouteInfo(route);
      setFare(calculatedFare);
      onFareCalculated(calculatedFare, route);
      
      toast({
        title: "Route calculated",
        description: `${route.distance} • ${route.duration} • $${calculatedFare.toFixed(2)}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Route calculation failed';
      setError(errorMessage);
      toast({
        title: "Route error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      calculateRoute();
    }
  }, [pickupLocation, dropoffLocation]);

  const handleRefreshRoute = () => {
    calculateRoute();
  };

  const handleNavigateRoute = () => {
    if (pickupLocation && dropoffLocation) {
      // Open navigation with waypoints (pickup -> dropoff)
      const waypointsUrl = `https://www.google.com/maps/dir/${pickupLocation.lat},${pickupLocation.lng}/${dropoffLocation.lat},${dropoffLocation.lng}`;
      window.open(waypointsUrl, '_blank');
    }
  };

  if (!pickupLocation || !dropoffLocation) {
    return (
      <Card className={`border-amber-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <MapPin className="h-8 w-8 text-amber-300 mx-auto mb-3" />
          <p className="text-amber-600">
            Complete pickup and drop-off locations to see route preview
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-amber-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-amber-900 flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Route Preview
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshRoute}
            disabled={isLoading}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
            data-testid="button-refresh-route"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Route Points */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">Pickup</p>
              <p className="text-xs text-amber-600 truncate">{pickupAddress}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 pl-1">
            <div className="w-px h-6 bg-amber-300"></div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">Drop-off</p>
              <p className="text-xs text-amber-600 truncate">{dropoffAddress}</p>
            </div>
          </div>
        </div>

        {/* Route Information */}
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-amber-600 mr-2" />
            <span className="text-amber-700">Calculating route...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshRoute}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        ) : routeInfo ? (
          <>
            {/* Route Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <MapPin className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                <p className="text-xs text-amber-600 font-medium">Distance</p>
                <p className="text-sm font-bold text-amber-900">{routeInfo.distance}</p>
              </div>
              
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                <p className="text-xs text-amber-600 font-medium">Duration</p>
                <p className="text-sm font-bold text-amber-900">{routeInfo.duration}</p>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-green-600 font-bold text-lg mx-auto mb-1">$</div>
                <p className="text-xs text-green-600 font-medium">Fare</p>
                <p className="text-sm font-bold text-green-900">${fare.toFixed(2)}</p>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">Fare Breakdown</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base fare</span>
                  <span className="text-gray-900">$3.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance ({routeInfo.distance})</span>
                  <span className="text-gray-900">
                    ${Math.max(0, fare - 3.99).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-1 flex justify-between font-medium">
                  <span className="text-gray-700">Total</span>
                  <span className="text-gray-900">${fare.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleNavigateRoute}
                className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                data-testid="button-preview-route"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Preview Route
              </Button>
            </div>

            {/* Route Quality Indicators */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-200">
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Optimal Route
                </Badge>
              </div>
              <p className="text-xs text-amber-600">
                ETA: {new Date(Date.now() + routeInfo.durationValue * 1000).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}