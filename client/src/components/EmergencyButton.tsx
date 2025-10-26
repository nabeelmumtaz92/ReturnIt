import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Shield,
  Car,
  Heart,
  Wrench,
  HelpCircle
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EmergencyButtonProps {
  driverId?: number;
  orderId?: string;
  variant?: 'default' | 'floating' | 'compact';
  className?: string;
}

interface EmergencyAlert {
  alertType: string;
  orderId?: string;
  description?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

const EMERGENCY_TYPES = {
  'emergency_911': {
    label: '911 Emergency',
    icon: <Phone className="h-4 w-4" />,
    color: 'bg-red-600 text-white',
    description: 'Life-threatening emergency requiring immediate response',
    priority: 'urgent',
  },
  'safety_concern': {
    label: 'Safety Concern',
    icon: <Shield className="h-4 w-4" />,
    color: 'bg-amber-500 text-white',
    description: 'Safety issue or threatening situation',
    priority: 'high',
  },
  'breakdown': {
    label: 'Vehicle Breakdown',
    icon: <Car className="h-4 w-4" />,
    color: 'bg-yellow-500 text-white',
    description: 'Vehicle malfunction or breakdown',
    priority: 'medium',
  },
  'accident': {
    label: 'Minor Accident',
    icon: <Wrench className="h-4 w-4" />,
    color: 'bg-blue-500 text-white',
    description: 'Minor accident or fender bender',
    priority: 'medium',
  },
  'medical': {
    label: 'Medical Issue',
    icon: <Heart className="h-4 w-4" />,
    color: 'bg-purple-500 text-white',
    description: 'Non-emergency medical issue',
    priority: 'high',
  },
  'help_needed': {
    label: 'Need Assistance',
    icon: <HelpCircle className="h-4 w-4" />,
    color: 'bg-gray-500 text-white',
    description: 'General assistance or guidance needed',
    priority: 'low',
  },
};

export default function EmergencyButton({ 
  driverId, 
  orderId, 
  variant = 'default',
  className = ''
}: EmergencyButtonProps) {
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState('');
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEmergencyAlert = useMutation({
    mutationFn: async (alertData: EmergencyAlert) => {
      // Get current location
      let location;
      if (navigator.geolocation) {
        setIsGettingLocation(true);
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            });
          });
          
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Location coordinates captured',
          };
        } catch (error) {
          console.warn('Could not get location:', error);
        } finally {
          setIsGettingLocation(false);
        }
      }

      return await apiRequest('POST', '/api/emergency/alerts', {
        ...alertData,
        driverId,
        location,
      });
    },
    onSuccess: () => {
      const emergencyType = EMERGENCY_TYPES[selectedEmergencyType as keyof typeof EMERGENCY_TYPES];
      
      // Show different success messages based on emergency type
      if (selectedEmergencyType === 'emergency_911') {
        toast({
          title: "🚨 EMERGENCY ALERT SENT",
          description: "Emergency services and Return It support have been notified. Help is on the way.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Alert Sent",
          description: `Your ${emergencyType.label.toLowerCase()} alert has been sent to Return It support.`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/emergency/alerts'] });
      setShowEmergencyDialog(false);
      setSelectedEmergencyType('');
      setEmergencyDescription('');
    },
    onError: (error) => {
      toast({
        title: "Alert Failed",
        description: `Failed to send emergency alert: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEmergencySubmit = () => {
    if (!selectedEmergencyType) {
      toast({
        title: "Selection Required",
        description: "Please select the type of emergency or assistance needed.",
        variant: "destructive",
      });
      return;
    }

    createEmergencyAlert.mutate({
      alertType: selectedEmergencyType,
      orderId,
      description: emergencyDescription.trim() || undefined,
    });
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'floating':
        return (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => setShowEmergencyDialog(true)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 shadow-lg"
              data-testid="button-emergency-floating"
            >
              <div className="text-center">
                <Phone className="h-6 w-6 mx-auto" />
                <span className="text-xs mt-1 block">911</span>
              </div>
            </Button>
          </div>
        );
      case 'compact':
        return (
          <Button
            onClick={() => setShowEmergencyDialog(true)}
            variant="destructive"
            size="sm"
            className={`${className} bg-red-600 hover:bg-red-700`}
            data-testid="button-emergency-compact"
          >
            <Phone className="h-4 w-4 mr-1" />
            Emergency
          </Button>
        );
      default:
        return (
          <Button
            onClick={() => setShowEmergencyDialog(true)}
            variant="destructive"
            className={`${className} bg-red-600 hover:bg-red-700`}
            data-testid="button-emergency-default"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency / Get Help
          </Button>
        );
    }
  };

  return (
    <>
      {getButtonContent()}

      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Emergency Assistance
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Important Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold">For life-threatening emergencies:</p>
                  <p>Call 911 immediately, then use this form to notify Return It.</p>
                </div>
              </div>
            </div>

            {/* Emergency Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="emergency-type">What type of assistance do you need?</Label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(EMERGENCY_TYPES).map(([type, config]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedEmergencyType(type)}
                    className={`p-3 border rounded-lg text-left transition-all hover:border-gray-400 ${
                      selectedEmergencyType === type 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200'
                    }`}
                    data-testid={`button-emergency-type-${type}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{config.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {config.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <Label htmlFor="emergency-description">Additional details (optional)</Label>
              <Textarea
                id="emergency-description"
                placeholder="Describe your situation or what help you need..."
                value={emergencyDescription}
                onChange={(e) => setEmergencyDescription(e.target.value)}
                rows={3}
                data-testid="textarea-emergency-description"
              />
            </div>

            {/* Location Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <MapPin className="h-4 w-4" />
                <div className="text-sm">
                  <span className="font-semibold">Location:</span>
                  <span className="ml-1">Your current GPS location will be sent with this alert</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEmergencyDialog(false)}
                className="flex-1"
                data-testid="button-cancel-emergency"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEmergencySubmit}
                disabled={!selectedEmergencyType || createEmergencyAlert.isPending || isGettingLocation}
                className="flex-1 bg-red-600 hover:bg-red-700"
                data-testid="button-send-emergency-alert"
              >
                {createEmergencyAlert.isPending || isGettingLocation ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Send Alert
                  </>
                )}
              </Button>
            </div>

            {/* Emergency Numbers */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-2">Emergency Contacts</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Police/Fire/Medical:</span>
                  <a href="tel:911" className="font-medium text-red-600 hover:underline">911</a>
                </div>
                <div className="flex justify-between">
                  <span>Poison Control:</span>
                  <a href="tel:1-800-222-1222" className="font-medium text-blue-600 hover:underline">1-800-222-1222</a>
                </div>
                <div className="flex justify-between">
                  <span>Return It Support:</span>
                  <a href="tel:555-123-4567" className="font-medium text-blue-600 hover:underline">(555) 123-4567</a>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}