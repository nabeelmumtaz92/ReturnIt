import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Route,
  Save,
  RefreshCw,
  Power,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface DaySchedule {
  available: boolean;
  start: string;
  end: string;
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface DriverPreferences {
  availableHours: WeeklySchedule;
  preferredRoutes: string[];
  serviceRadius: number;
}

const defaultDaySchedule: DaySchedule = {
  available: true,
  start: "09:00",
  end: "17:00"
};

const defaultWeeklySchedule: WeeklySchedule = {
  monday: defaultDaySchedule,
  tuesday: defaultDaySchedule,
  wednesday: defaultDaySchedule,
  thursday: defaultDaySchedule,
  friday: defaultDaySchedule,
  saturday: { available: false, start: "10:00", end: "16:00" },
  sunday: { available: false, start: "10:00", end: "16:00" }
};

const dayNames = {
  monday: 'Monday',
  tuesday: 'Tuesday', 
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

export default function DriverScheduleManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<DriverPreferences>({
    availableHours: defaultWeeklySchedule,
    preferredRoutes: [],
    serviceRadius: 25.0
  });
  const [newRoute, setNewRoute] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current user preferences
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Load user preferences when data arrives
  useEffect(() => {
    if (user) {
      setPreferences({
        availableHours: (user as any).availableHours || defaultWeeklySchedule,
        preferredRoutes: (user as any).preferredRoutes || [],
        serviceRadius: (user as any).serviceRadius || 25.0
      });
    }
  }, [user]);

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: Partial<DriverPreferences>) =>
      apiRequest('PATCH', '/api/driver/preferences', data),
    onSuccess: () => {
      toast({
        title: "Schedule Updated",
        description: "Your availability and preferences have been saved.",
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Toggle availability status mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: (isOnline: boolean) =>
      apiRequest('PATCH', '/api/driver/status', { isOnline }),
    onSuccess: (data) => {
      const status = (data as any).isOnline ? "Available" : "Offline";
      toast({
        title: `Status Updated`,
        description: `You are now ${status.toLowerCase()} for deliveries.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: () => {
      toast({
        title: "Status Update Failed",
        description: "Failed to update your availability status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateDaySchedule = (day: keyof WeeklySchedule, field: keyof DaySchedule, value: any) => {
    setPreferences(prev => ({
      ...prev,
      availableHours: {
        ...prev.availableHours,
        [day]: {
          ...prev.availableHours[day],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const updateServiceRadius = (radius: number) => {
    setPreferences(prev => ({
      ...prev,
      serviceRadius: radius
    }));
    setHasChanges(true);
  };

  const addRoute = () => {
    if (newRoute.trim() && !preferences.preferredRoutes.includes(newRoute.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferredRoutes: [...prev.preferredRoutes, newRoute.trim()]
      }));
      setNewRoute('');
      setHasChanges(true);
    }
  };

  const removeRoute = (routeToRemove: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredRoutes: prev.preferredRoutes.filter(route => route !== routeToRemove)
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const resetToDefaults = () => {
    setPreferences({
      availableHours: defaultWeeklySchedule,
      preferredRoutes: [],
      serviceRadius: 25.0
    });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading your schedule...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOnline = (user as any)?.isOnline || false;

  const handleAvailabilityToggle = (checked: boolean) => {
    toggleAvailabilityMutation.mutate(checked);
  };

  return (
    <div className="space-y-6">
      {/* Availability Toggle - Primary Control */}
      <Card className="border-2 border-dashed border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
                {isOnline ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-gray-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isOnline ? "Available for Deliveries" : "Currently Offline"}
                </h2>
                <p className="text-gray-600">
                  {isOnline 
                    ? "You'll receive delivery requests when orders become available" 
                    : "Turn on to start receiving delivery requests"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Label htmlFor="availability-toggle" className="text-lg font-medium">
                {isOnline ? "Available" : "Offline"}
              </Label>
              <Switch
                id="availability-toggle"
                checked={isOnline}
                onCheckedChange={handleAvailabilityToggle}
                disabled={toggleAvailabilityMutation.isPending}
                className="data-[state=checked]:bg-green-500 scale-150"
                data-testid="switch-driver-availability"
              />
            </div>
          </div>
          
          {toggleAvailabilityMutation.isPending && (
            <div className="mt-4 flex items-center justify-center text-gray-600">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Updating your availability status...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule & Preferences
          </CardTitle>
          <p className="text-sm text-gray-600">
            Set your preferred hours, service areas, and delivery preferences
          </p>
        </CardHeader>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Preferred Working Hours
          </CardTitle>
          <p className="text-sm text-gray-600">
            Set your preferred times for each day. You can still work outside these hours when available.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(dayNames).map(([day, displayName]) => {
            const daySchedule = preferences.availableHours[day as keyof WeeklySchedule];
            return (
              <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-20">
                    <Label className="font-medium">{displayName}</Label>
                  </div>
                  <Switch
                    checked={daySchedule.available}
                    onCheckedChange={(checked) => 
                      updateDaySchedule(day as keyof WeeklySchedule, 'available', checked)
                    }
                    data-testid={`switch-${day}-available`}
                  />
                </div>
                
                {daySchedule.available && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={daySchedule.start}
                      onChange={(e) => 
                        updateDaySchedule(day as keyof WeeklySchedule, 'start', e.target.value)
                      }
                      className="w-24"
                      data-testid={`input-${day}-start`}
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      value={daySchedule.end}
                      onChange={(e) => 
                        updateDaySchedule(day as keyof WeeklySchedule, 'end', e.target.value)
                      }
                      className="w-24"
                      data-testid={`input-${day}-end`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Service Radius */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Service Radius
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Maximum distance you're willing to travel: {preferences.serviceRadius} miles</Label>
            <Slider
              value={[preferences.serviceRadius]}
              onValueChange={(value) => updateServiceRadius(value[0])}
              min={5}
              max={50}
              step={1}
              className="w-full"
              data-testid="slider-service-radius"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 miles</span>
              <span>50 miles</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferred Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Preferred Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add area (e.g., Downtown, Clayton, Chesterfield)"
              value={newRoute}
              onChange={(e) => setNewRoute(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRoute();
                }
              }}
              data-testid="input-add-route"
            />
            <Button onClick={addRoute} disabled={!newRoute.trim()} data-testid="button-add-route">
              Add
            </Button>
          </div>
          
          {preferences.preferredRoutes.length > 0 && (
            <div className="space-y-2">
              <Label>Your preferred areas:</Label>
              <div className="flex flex-wrap gap-2">
                {preferences.preferredRoutes.map((route, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeRoute(route)}
                    data-testid={`badge-route-${index}`}
                  >
                    {route} ×
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Click on an area to remove it from your preferences
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={updatePreferencesMutation.isPending}
              data-testid="button-reset"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updatePreferencesMutation.isPending}
              data-testid="button-save"
            >
              {updatePreferencesMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
          
          {hasChanges && (
            <p className="text-sm text-amber-600 mt-2">
              You have unsaved changes
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}