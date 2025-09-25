import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Route,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GPSNavigationProps {
  destination: {
    address: string;
    lat?: number;
    lng?: number;
  };
  orderId?: string;
  customerPhone?: string;
  onNavigationStart?: () => void;
  onNavigationEnd?: () => void;
}

interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
  direction: 'straight' | 'left' | 'right' | 'u-turn';
}

export default function GPSNavigation({ 
  destination, 
  orderId, 
  customerPhone,
  onNavigationStart,
  onNavigationEnd 
}: GPSNavigationProps) {
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [remainingDistance, setRemainingDistance] = useState<string>('');
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const watchId = useRef<number | null>(null);

  // Check location permission on mount
  useEffect(() => {
    checkLocationPermission();
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationError('GPS not supported on this device');
      return;
    }

    try {
      const position = await getCurrentPosition();
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setIsLocationPermissionGranted(true);
      setLocationError('');
    } catch (error) {
      setLocationError('Location access denied. Please enable GPS to use navigation.');
      setIsLocationPermissionGranted(false);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      });
    });
  };

  const startNavigation = async () => {
    if (!isLocationPermissionGranted || !currentLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location access to start navigation.",
        variant: "destructive",
      });
      return;
    }

    setIsNavigating(true);
    onNavigationStart?.();

    try {
      // Calculate route using Google Directions API
      const response = await fetch('/api/navigation/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: `${currentLocation.lat},${currentLocation.lng}`,
          destination: destination.address,
          mode: 'driving'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate route');
      }

      const routeData = await response.json();
      
      if (routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        const leg = route.legs[0];
        
        // Convert Google Directions steps to our format
        const steps: NavigationStep[] = leg.steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
          distance: step.distance.text,
          duration: step.duration.text,
          direction: getDirectionFromManeuver(step.maneuver)
        }));

        setNavigationSteps(steps);
        setCurrentStepIndex(0);
        setEstimatedTime(leg.duration.text);
        setRemainingDistance(leg.distance.text);
      } else {
        // Fallback to basic navigation
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Route calculation failed:', error);
      
      // Fallback to simulated navigation with basic route
      const mockSteps: NavigationStep[] = [
        {
          instruction: `Navigate to ${destination.address}`,
          distance: "~5 mi",
          duration: "~15 min",
          direction: "straight"
        },
        {
          instruction: "Follow GPS directions",
          distance: "0 mi",
          duration: "0 min",
          direction: "straight"
        }
      ];

      setNavigationSteps(mockSteps);
      setCurrentStepIndex(0);
      setEstimatedTime("~15 min");
      setRemainingDistance("~5 mi");
      
      toast({
        title: "Basic Navigation Mode",
        description: "Using basic directions. For full navigation, open external maps.",
        variant: "destructive",
      });
    }

    // Start location tracking
    if (watchId.current === null) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // Update navigation progress and check for step completion
          updateNavigationProgress(position);
        },
        (error) => {
          console.error('GPS tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    }

    toast({
      title: "Navigation Started",
      description: `Routing to ${destination.address}`,
    });
  };

  const getDirectionFromManeuver = (maneuver: string): string => {
    if (!maneuver) return 'straight';
    if (maneuver.includes('left')) return 'left';
    if (maneuver.includes('right')) return 'right';
    if (maneuver.includes('uturn') || maneuver.includes('u-turn')) return 'u-turn';
    return 'straight';
  };

  const updateNavigationProgress = (position: GeolocationPosition) => {
    // Calculate distance to next step and auto-advance if close enough
    if (navigationSteps.length > 0 && currentStepIndex < navigationSteps.length - 1) {
      // For demo purposes, auto-advance every 30 seconds
      // In a real implementation, this would check proximity to next waypoint
      const now = Date.now();
      const timeSinceStart = now - (position.timestamp || now);
      
      // Auto-advance demo steps every 30 seconds
      if (Math.floor(timeSinceStart / 30000) > currentStepIndex) {
        nextStep();
      }
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setNavigationSteps([]);
    setCurrentStepIndex(0);
    onNavigationEnd?.();

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    toast({
      title: "Navigation Stopped",
      description: "You can restart navigation anytime.",
    });
  };

  const nextStep = () => {
    if (currentStepIndex < navigationSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      // Update remaining time and distance
      const remainingSteps = navigationSteps.slice(currentStepIndex + 1);
      const totalTime = remainingSteps.reduce((acc, step) => acc + parseInt(step.duration), 0);
      setEstimatedTime(`${totalTime} min`);
    }
  };

  const openExternalNavigation = () => {
    // Open in Google Maps
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.address)}`;
    window.open(mapsUrl, '_blank');
    
    toast({
      title: "External Navigation",
      description: "Opened in Google Maps",
    });
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'left': return <ArrowLeft className="h-6 w-6" />;
      case 'right': return <ArrowRight className="h-6 w-6" />;
      case 'u-turn': return <RotateCcw className="h-6 w-6" />;
      default: return <ArrowUp className="h-6 w-6" />;
    }
  };

  if (!isLocationPermissionGranted && locationError) {
    return (
      <Card className="border-red-300 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Location Access Required</h3>
              <p className="text-red-700 text-sm">{locationError}</p>
              <Button 
                onClick={checkLocationPermission}
                size="sm"
                className="mt-2 bg-red-600 hover:bg-red-700"
                data-testid="button-retry-location"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Destination Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            GPS Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-medium">Destination</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">{destination.address}</p>
              {orderId && (
                <Badge variant="outline" className="ml-6">
                  Order #{orderId}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {customerPhone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${customerPhone}`)}
                  data-testid="button-call-customer"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={openExternalNavigation}
                data-testid="button-external-maps"
              >
                <Route className="h-4 w-4 mr-1" />
                Maps
              </Button>
            </div>
          </div>

          <Separator />

          {!isNavigating ? (
            <div className="text-center space-y-4">
              <Button
                onClick={startNavigation}
                disabled={!isLocationPermissionGranted}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-start-navigation"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Start Navigation
              </Button>
              {!isLocationPermissionGranted && (
                <p className="text-sm text-gray-500">
                  Waiting for location access...
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Navigation Status */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-blue-900">Navigating</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopNavigation}
                    data-testid="button-stop-navigation"
                  >
                    Stop
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ETA:</span>
                    <span className="ml-2 font-medium">{estimatedTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Distance:</span>
                    <span className="ml-2 font-medium">{remainingDistance}</span>
                  </div>
                </div>
              </div>

              {/* Current Step */}
              {navigationSteps.length > 0 && currentStepIndex < navigationSteps.length && (
                <Card className="border-blue-300 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {getDirectionIcon(navigationSteps[currentStepIndex].direction)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">
                          {navigationSteps[currentStepIndex].instruction}
                        </p>
                        <p className="text-sm text-blue-700">
                          {navigationSteps[currentStepIndex].distance} • {navigationSteps[currentStepIndex].duration}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextStep}
                        disabled={currentStepIndex >= navigationSteps.length - 1}
                        data-testid="button-next-step"
                      >
                        Next
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Steps */}
              {navigationSteps.length > 0 && currentStepIndex < navigationSteps.length - 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Upcoming Directions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {navigationSteps.slice(currentStepIndex + 1, currentStepIndex + 4).map((step, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 text-gray-400">
                          {getDirectionIcon(step.direction)}
                        </div>
                        <span className="text-gray-600">{step.instruction}</span>
                        <span className="text-gray-500 ml-auto">{step.distance}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}