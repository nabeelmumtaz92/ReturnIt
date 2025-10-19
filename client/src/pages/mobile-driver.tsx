import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth-simple";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandler";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Navigation, 
  Camera, 
  Phone, 
  CheckCircle, 
  Power,
  User,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  Zap,
  Truck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Order, User as UserType } from "@shared/schema";
import { SwipeToAccept } from "@/components/SwipeToAccept";

interface DriverMobileView {
  view: 'home' | 'jobs' | 'earnings' | 'profile' | 'settings';
}

export default function MobileDriver() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<DriverMobileView['view']>('home');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  // Redirect to login if not authenticated or not a driver/admin
  if (!isAuthenticated || (!user?.isDriver && !user?.isAdmin)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-transparent flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold text-foreground mb-4">Driver Access Required</h1>
            <p className="text-muted-foreground mb-6">This app is for Return It drivers only.</p>
            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Sign In as Driver
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full border-border text-muted-foreground">
                  Back to Customer App
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOnline = user?.isOnline || false;

  // Real data queries
  const { data: availableOrders = [], isLoading: loadingAvailable } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders/available"],
    enabled: isAuthenticated,
    refetchInterval: 15000, // Auto-refresh every 15 seconds for driver app
  });

  const { data: myOrders = [], isLoading: loadingMy } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders"],
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const { data: earnings = [] } = useQuery<any[]>({
    queryKey: ["/api/driver/earnings"],
    enabled: isAuthenticated,
    retry: 1,
    retryDelay: 1000,
    throwOnError: false,
  });

  // Availability toggle mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: (isOnline: boolean) =>
      apiRequest('PATCH', '/api/driver/status', { isOnline }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      const userMessage = handleError(error, {
        context: "Driver Status Update",
        userMessage: "Error"
      });
      toast({
        title: userMessage,
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Accept job mutation
  const acceptJobMutation = useMutation({
    mutationFn: (orderId: string) =>
      apiRequest('PATCH', `/api/orders/${orderId}/accept`, {}),
    onSuccess: () => {
      toast({
        title: "Job Accepted!",
        description: "You've successfully accepted this delivery.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/driver/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/driver/orders/available'] });
    },
    onError: (error) => {
      const userMessage = handleError(error, {
        context: "Job Acceptance",
        userMessage: "Error"
      });
      toast({
        title: userMessage,
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCurrentLocation({ 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        }),
        (error) => console.log('Location access denied')
      );
    }
  }, []);

  // Helper functions
  const toggleOnlineStatus = () => {
    toggleAvailabilityMutation.mutate(!isOnline);
  };

  const acceptJob = (orderId: string) => {
    acceptJobMutation.mutate(orderId);
  };

  const startNavigation = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    if (navigator.userAgent.match(/iPhone|iPad|iPod/)) {
      window.open(`maps://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
    } else {
      window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
    }
  };

  const callCustomer = (orderId: string) => {
    const order = [...availableOrders, ...myOrders].find(o => o.id === orderId);
    if (order?.customerPhone) {
      window.open(`tel:${order.customerPhone}`);
    } else {
      toast({
        title: "No Phone Number",
        description: "Customer phone number not available.",
        variant: "destructive"
      });
    }
  };

  const markCompleted = (orderId: string) => {
    // This would typically be handled by a mutation
    toast({
      title: "Mark as Complete",
      description: "Feature coming soon - use main portal for now."
    });
  };

  // Calculate earnings
  const todayEarnings = earnings
    .filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.amount, 0);
  
  const weeklyEarnings = earnings
    .filter(e => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(e.createdAt) >= weekAgo;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const completedJobsToday = myOrders.filter(order => 
    order.status === 'completed' && 
    new Date(order.updatedAt || order.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const driverRating = user?.driverRating || 4.8;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-transparent p-4">
      {/* Header with Availability Toggle */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Return It Driver</h1>
            <p className="text-sm text-primary">Hello, {user?.firstName || 'Driver'}!</p>
            {user?.isAdmin && (
              <Badge variant="outline" className="mt-1 text-xs border-blue-300 text-blue-700">
                Admin View
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className={`h-4 w-4 ${isOnline ? 'text-green-600' : 'text-gray-400'}`} />
              <Switch
                checked={isOnline}
                onCheckedChange={toggleOnlineStatus}
                disabled={toggleAvailabilityMutation.isPending}
                data-testid="switch-availability"
              />
              <Badge variant={isOnline ? "default" : "secondary"} className={isOnline ? "bg-green-100 text-green-800" : ""}>
                {isOnline ? "AVAILABLE" : "OFFLINE"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-lg font-bold" data-testid="text-today-earnings">
                  ${todayEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Jobs Today</p>
                <p className="text-lg font-bold" data-testid="text-jobs-today">
                  {completedJobsToday}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-lg font-bold" data-testid="text-weekly-earnings">
                  ${weeklyEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-lg font-bold" data-testid="text-driver-rating">
                  {driverRating.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Jobs */}
      {availableOrders.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Available Jobs ({availableOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 bg-gray-50" data-testid={`available-order-${order.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{order.retailer}</h3>
                    <p className="text-sm text-gray-600">#{order.trackingNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${order.driverEarning?.toFixed(2) || (order.amount * 0.7).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Driver Fee</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{order.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-gray-500" />
                    <span>{order.dropoffLocation || 'UPS Store'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Est. 15-30 min</span>
                  </div>
                </div>

                <Separator className="my-3" />

                <SwipeToAccept
                  orderId={order.id}
                  onAccept={() => acceptJob(order.id)}
                  onTimeout={() => {
                    toast({
                      title: "Job Offer Expired",
                      description: "This job has been offered to another driver.",
                      variant: "default",
                    });
                  }}
                  timeoutSeconds={60}
                  disabled={acceptJobMutation.isPending}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Jobs */}
      {myOrders.filter(o => ['assigned', 'picked_up'].includes(o.status)).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myOrders
              .filter(order => ['assigned', 'picked_up'].includes(order.status))
              .map((order) => (
                <div key={order.id} className="border rounded-lg p-4 bg-blue-50" data-testid={`active-order-${order.id}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{order.retailer}</h3>
                      <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${order.driverEarning?.toFixed(2) || (order.amount * 0.7).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{order.pickupAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="h-4 w-4 text-gray-500" />
                      <span>{order.dropoffLocation || 'UPS Store'}</span>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          const pickupEncoded = encodeURIComponent(order.pickupAddress);
                          const dropoffEncoded = encodeURIComponent(order.dropoffLocation || order.retailer);
                          window.open(`https://www.google.com/maps/dir/?api=1&origin=${pickupEncoded}&destination=${dropoffEncoded}`, '_blank');
                        }}
                        data-testid={`button-navigate-google-${order.id}`}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Google
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-gray-800 hover:bg-gray-900 text-white"
                        onClick={() => {
                          const pickupEncoded = encodeURIComponent(order.pickupAddress);
                          const dropoffEncoded = encodeURIComponent(order.dropoffLocation || order.retailer);
                          if (/(iPhone|iPad|iPod|Macintosh)/i.test(navigator.userAgent)) {
                            window.location.href = `maps://maps.apple.com/?saddr=${pickupEncoded}&daddr=${dropoffEncoded}`;
                          } else {
                            window.open(`https://www.google.com/maps/dir/?api=1&origin=${pickupEncoded}&destination=${dropoffEncoded}`, '_blank');
                          }
                        }}
                        data-testid={`button-navigate-apple-${order.id}`}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Apple
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => callCustomer(order.id)}
                        className="flex-1 flex items-center justify-center gap-1"
                        data-testid={`button-call-${order.id}`}
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => markCompleted(order.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700"
                        data-testid={`button-complete-${order.id}`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Complete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* No Jobs Available */}
      {availableOrders.length === 0 && myOrders.filter(o => ['assigned', 'picked_up'].includes(o.status)).length === 0 && (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Jobs</h3>
            <p className="text-gray-600 mb-4">
              {isOnline ? 'Stay available - new jobs will appear here automatically.' : 'Toggle to available to start receiving jobs.'}
            </p>
            {!isOnline && (
              <Button 
                onClick={toggleOnlineStatus}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-go-online"
              >
                <Power className="h-4 w-4 mr-2" />
                Go Available
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions & Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Link href="/driver-portal">
            <Button variant="outline" className="w-full flex items-center gap-2" data-testid="button-full-portal">
              <Settings className="h-4 w-4" />
              Full Portal
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setLocation('/customer-support')}
          >
            <Phone className="h-4 w-4" />
            Support
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Rate Customer
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}