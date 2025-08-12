import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Power, PowerOff, MapPin, Clock } from "lucide-react";

interface DriverOnlineToggleProps {
  isOnline: boolean;
  onToggle: (online: boolean) => void;
  driverStats?: {
    completedToday: number;
    earningsToday: number;
    hoursOnline: number;
  };
}

export default function DriverOnlineToggle({ 
  isOnline, 
  onToggle, 
  driverStats = { completedToday: 0, earningsToday: 0, hoursOnline: 0 }
}: DriverOnlineToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (newStatus: boolean) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('PATCH', '/api/driver/status', {
        isOnline: newStatus,
        timestamp: new Date().toISOString()
      });

      if (response.ok) {
        onToggle(newStatus);
        toast({
          title: newStatus ? "You're Online!" : "You're Offline",
          description: newStatus 
            ? "You'll start receiving delivery requests" 
            : "You won't receive new delivery requests",
          variant: newStatus ? "default" : "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`border-2 transition-all duration-300 ${
      isOnline 
        ? 'border-green-300 bg-green-50' 
        : 'border-gray-300 bg-gray-50'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <Power className="h-6 w-6 text-green-600" />
              ) : (
                <PowerOff className="h-6 w-6 text-gray-500" />
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {isOnline ? "Online" : "Offline"}
                </h3>
                <p className="text-sm text-gray-600">
                  {isOnline 
                    ? "Accepting delivery requests" 
                    : "Not accepting requests"}
                </p>
              </div>
            </div>
            <Badge 
              className={`px-3 py-1 ${
                isOnline 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isOnline ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>

          {/* Toggle Control */}
          <div className="flex items-center justify-center space-x-4 py-2">
            <span className="text-sm font-medium text-gray-700">Offline</span>
            <Switch
              checked={isOnline}
              onCheckedChange={handleToggle}
              disabled={isLoading}
              className="data-[state=checked]:bg-green-600"
              data-testid="switch-driver-online-status"
            />
            <span className="text-sm font-medium text-gray-700">Online</span>
          </div>

          {/* Quick Stats */}
          {isOnline && (
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-green-200">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-bold text-green-700">
                    {driverStats.completedToday}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-700">
                  ${driverStats.earningsToday.toFixed(2)}
                </div>
                <p className="text-xs text-gray-600">Today</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-bold text-green-700">
                    {driverStats.hoursOnline.toFixed(1)}h
                  </span>
                </div>
                <p className="text-xs text-gray-600">Online</p>
              </div>
            </div>
          )}

          {/* Quick Action Button */}
          <Button
            variant={isOnline ? "destructive" : "default"}
            size="lg"
            onClick={() => handleToggle(!isOnline)}
            disabled={isLoading}
            className="w-full"
            data-testid={`button-${isOnline ? 'go-offline' : 'go-online'}`}
          >
            {isLoading ? (
              "Updating..."
            ) : isOnline ? (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Go Offline
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                Go Online
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}