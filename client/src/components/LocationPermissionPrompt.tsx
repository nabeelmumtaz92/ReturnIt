import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, Shield, Truck, AlertTriangle } from 'lucide-react';
import { useLocationPermission } from '@/lib/locationServices';
import { useToast } from '@/hooks/use-toast';

interface LocationPermissionPromptProps {
  userType: 'customer' | 'driver';
  onPermissionGranted: (location: { lat: number; lng: number }) => void;
  onPermissionDenied?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationPermissionPrompt({
  userType,
  onPermissionGranted,
  onPermissionDenied,
  isOpen,
  onClose
}: LocationPermissionPromptProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const { hasPermission, isLoading, requestPermission } = useLocationPermission();
  const { toast } = useToast();

  const handlePermissionRequest = async () => {
    try {
      const location = await requestPermission();
      onPermissionGranted(location);
      onClose();
      
      toast({
        title: "Location access granted",
        description: "Thank you! Location features are now enabled.",
      });
    } catch (error) {
      console.error('Location permission denied:', error);
      setShowInstructions(true);
      
      if (onPermissionDenied) {
        onPermissionDenied();
      }
      
      toast({
        title: "Location access needed",
        description: "Please enable location access to use navigation features",
        variant: "destructive",
      });
    }
  };

  const getFeatureList = () => {
    if (userType === 'driver') {
      return [
        "Turn-by-turn navigation to pickups",
        "Automatic arrival detection",
        "Real-time ETA updates for customers",
        "Optimized route suggestions",
        "Geofencing for status updates"
      ];
    } else {
      return [
        "Address autocomplete and suggestions",
        "Find nearest store locations",
        "Accurate delivery time estimates",
        "Real-time driver tracking",
        "Smart route optimization"
      ];
    }
  };

  const getIcon = () => {
    return userType === 'driver' ? <Truck className="h-8 w-8" /> : <MapPin className="h-8 w-8" />;
  };

  const getTitle = () => {
    return userType === 'driver' 
      ? "Enable Location for Driver Features"
      : "Enable Location for Better Service";
  };

  const getDescription = () => {
    return userType === 'driver'
      ? "Location access is required for navigation, automatic arrival detection, and providing accurate ETAs to customers."
      : "Location access helps us provide accurate pickup estimates, find nearby stores, and give you real-time delivery tracking.";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-amber-900">
            {getIcon()}
            <span>{getTitle()}</span>
          </DialogTitle>
          <DialogDescription className="text-amber-700">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!showInstructions ? (
            <>
              <Card className="border-amber-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-amber-900 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Your Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-amber-700">
                    Your location is only used for navigation and service features. 
                    We never store or share your location data.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h4 className="font-medium text-amber-900">Features enabled:</h4>
                <ul className="space-y-1">
                  {getFeatureList().map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-amber-700">
                      <Navigation className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handlePermissionRequest}
                  disabled={isLoading}
                  className="flex-1 bg-amber-800 hover:bg-amber-900"
                >
                  {isLoading ? "Requesting..." : "Enable Location"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInstructions(true);
                    if (onPermissionDenied) onPermissionDenied();
                  }}
                  className="border-amber-300 text-amber-700"
                >
                  Not Now
                </Button>
              </div>
            </>
          ) : (
            <>
              <Alert className="border-amber-300 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Location access was denied. Some features may be limited.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium text-amber-900">To enable location manually:</h4>
                
                <div className="space-y-2 text-sm text-amber-700">
                  <div className="bg-amber-50 p-3 rounded">
                    <p className="font-medium mb-1">Desktop browsers:</p>
                    <p>Click the location icon 📍 in your address bar and select "Allow"</p>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded">
                    <p className="font-medium mb-1">Mobile browsers:</p>
                    <p>Go to Settings → Privacy & Security → Location Services and enable for this site</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handlePermissionRequest}
                  variant="outline"
                  className="flex-1 border-amber-300 text-amber-700"
                >
                  Try Again
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-amber-800 hover:bg-amber-900"
                >
                  Continue Without Location
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}