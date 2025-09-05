import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth-simple";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, DollarSign, Star, Package, Truck, Navigation, Phone, CreditCard, FileText, Users, Menu, ArrowLeft, Home, Settings } from "lucide-react";
import { Order, User } from "@shared/schema";
import { RoleSwitcher } from '@/components/RoleSwitcher';
import DriverOnlineToggle from "@/components/DriverOnlineToggle";
import DriverOrderCard from "@/components/DriverOrderCard";
import ContactSupportButton from "@/components/ContactSupportButton";
import { useLocation, Link } from "wouter";

export default function DriverPortal() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, accuracy?: number, timestamp?: number} | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [watchId, setWatchId] = useState<number | null>(null);

  // Check if new driver needs tutorial
  useEffect(() => {
    if (user && user.isDriver && !user.tutorialCompleted) {
      setLocation('/driver-tutorial');
    }
  }, [user, setLocation]);

  // Continuous GPS tracking when on duty
  useEffect(() => {
    const initializeLocationTracking = async () => {
      if (!navigator.geolocation) {
        console.log("Geolocation not supported");
        return;
      }

      // Check current permission status
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setLocationPermission(result.state);
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setLocationPermission(result.state);
          });
        } catch (error) {
          console.log("Permission query failed");
        }
      }

      // Start continuous tracking
      if (user?.isDriver && isOnline) {
        startLocationTracking();
      }
    };

    initializeLocationTracking();

    // Cleanup on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [user?.isDriver, isOnline]);

  // Location tracking functions
  const startLocationTracking = () => {
    if (!navigator.geolocation || watchId !== null) return;

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // Cache location for 30 seconds
    };

    const newWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        setCurrentLocation(newLocation);
        
        // Update server with new location if driver is online
        if (isOnline) {
          updateStatusMutation.mutate({ 
            currentLocation: newLocation 
          });
        }
      },
      (error) => {
        console.error("GPS tracking error:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission('denied');
        }
      },
      options
    );

    setWatchId(newWatchId);
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  // Handle online status changes
  const handleOnlineToggle = async (online: boolean) => {
    setIsOnline(online);
    
    if (online) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    
    // Update server
    updateStatusMutation.mutate({ 
      isOnline: online,
      currentLocation: online ? currentLocation : null
    });
  };

  // Queries
  const { data: availableOrders = [], isLoading: loadingAvailable } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders/available"],
    enabled: isAuthenticated && user?.isDriver
  });

  const { data: myOrders = [], isLoading: loadingMy } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders"],
    enabled: isAuthenticated && user?.isDriver
  });

  const { data: earnings = [] } = useQuery<any[]>({
    queryKey: ["/api/driver/earnings"],
    enabled: isAuthenticated && user?.isDriver
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ isOnline, currentLocation }: { isOnline?: boolean, currentLocation?: any }) => {
      await apiRequest("PATCH", "/api/driver/status", { isOnline, currentLocation });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiRequest("POST", `/api/driver/orders/${orderId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders"] });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status, driverNotes }: { orderId: string, status: string, driverNotes?: string }) => {
      await apiRequest("PATCH", `/api/orders/${orderId}`, { status, driverNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/orders"] });
    }
  });

  // Remove duplicate function - already defined above

  if (!isAuthenticated || !user?.isDriver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-amber-900">Access Denied</CardTitle>
            <CardDescription>You need driver access to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalEarnings = Array.isArray(earnings) ? earnings.reduce((sum: number, earning: any) => sum + (earning.totalEarning || 0), 0) : 0;
  const pendingEarnings = Array.isArray(earnings) ? earnings.filter((e: any) => e.status === 'pending').reduce((sum: number, earning: any) => sum + (earning.totalEarning || 0), 0) : 0;
  const activeOrders = myOrders.filter(order => ['assigned', 'picked_up', 'in_transit'].includes(order.status));
  const completedToday = myOrders.filter(order => 
    order.status === 'completed' && 
    new Date(order.actualDeliveryTime || order.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/welcome">
                <Button variant="ghost" size="sm" className="text-amber-800">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">Driver Portal</h1>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-amber-700">Welcome back, {user.firstName || user.username || 'Driver'}!</span>
                  <div className="flex items-center space-x-1">
                    <Switch 
                      checked={isOnline} 
                      onCheckedChange={handleOnlineToggle}
                      data-testid="switch-online-status"
                    />
                    <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-amber-700">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{user.driverRating?.toFixed(1) || '5.0'}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-amber-800"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowSidebar(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-sm shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-amber-900">Navigation</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Link href="/driver-portal">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50 bg-amber-100">
                  <Truck className="h-4 w-4 mr-3" />
                  Driver Portal
                </Button>
              </Link>
              <Link href="/driver-payments">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Payments & Earnings
                </Button>
              </Link>
              <Link href="/order-status">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50">
                  <Package className="h-4 w-4 mr-3" />
                  My Orders
                </Button>
              </Link>
              <Link href="/admin-dashboard">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50">
                  <Users className="h-4 w-4 mr-3" />
                  Admin Dashboard
                </Button>
              </Link>
              <Link href="/welcome">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50">
                  <Home className="h-4 w-4 mr-3" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Dashboard */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-900 flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Today's Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* GPS Tracking Status */}
            <div className="mb-4 p-3 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    locationPermission === 'granted' && currentLocation 
                      ? 'bg-green-500 animate-pulse' 
                      : locationPermission === 'denied' 
                        ? 'bg-red-500' 
                        : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      GPS Tracking Status: {
                        locationPermission === 'granted' && currentLocation 
                          ? 'Active' 
                          : locationPermission === 'denied' 
                            ? 'Permission Denied' 
                            : 'Checking...'
                      }
                    </p>
                    {currentLocation && (
                      <p className="text-xs text-amber-700">
                        Last update: {new Date(currentLocation.timestamp || Date.now()).toLocaleTimeString()}
                        {currentLocation.accuracy && ` • Accuracy: ${Math.round(currentLocation.accuracy)}m`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className={`h-4 w-4 ${
                    locationPermission === 'granted' && currentLocation 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }`} />
                  {locationPermission === 'denied' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                      className="text-xs"
                    >
                      Enable Location
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-emerald-800">
                  ${totalEarnings.toFixed(2)}
                </div>
                <div className="text-sm text-emerald-600 font-medium">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-800">${pendingEarnings.toFixed(2)}</div>
                <div className="text-sm text-amber-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-800">{activeOrders.length}</div>
                <div className="text-sm text-amber-600">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-800">{completedToday}</div>
                <div className="text-sm text-amber-600">Completed Today</div>
              </div>
            </div>
            
            <div className="mt-4">
              <Link href="/driver-payments">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Instant Pay Available
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Orders Management */}
        <Tabs defaultValue="available" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="available" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Available ({availableOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Active ({myOrders.length})
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid gap-4">
              {loadingAvailable ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                </div>
              ) : availableOrders.length === 0 ? (
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-amber-900 mb-2">No Available Orders</h3>
                    <p className="text-amber-600">Check back soon for new pickup opportunities!</p>
                  </CardContent>
                </Card>
              ) : (
                availableOrders.map((order) => (
                  <Card key={order.id} className="bg-white shadow-lg border-amber-200 hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-amber-900">Order #{order.id}</h3>
                          <p className="text-amber-700">{order.retailer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${((order.basePrice || 0) + (order.tip || 0)).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Base: ${order.basePrice || 0} + Tip: ${order.tip || 0}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-900">Pickup Address</p>
                            <p className="text-amber-700">{order.pickupStreetAddress}, {order.pickupCity}</p>
                            {order.pickupInstructions && (
                              <p className="text-sm text-amber-600 mt-1">{order.pickupInstructions}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Package className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-900">Item</p>
                            <p className="text-amber-700">{order.itemDescription}</p>
                            {order.returnReason && (
                              <p className="text-sm text-amber-600 mt-1">Reason: {order.returnReason}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="border-amber-300 text-amber-700">
                            {order.priority}
                          </Badge>
                          {order.isFragile && (
                            <Badge variant="destructive">Fragile</Badge>
                          )}
                          {order.requiresSignature && (
                            <Badge variant="secondary">Signature Required</Badge>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link href={`/driver-portal/job/${order.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                              View Details
                            </Button>
                          </Link>
                          <Button 
                            onClick={() => acceptOrderMutation.mutate(order.id)}
                            disabled={acceptOrderMutation.isPending}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            data-testid={`button-accept-${order.id}`}
                          >
                            {acceptOrderMutation.isPending ? "Accepting..." : "Accept Order"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4">
              {loadingMy ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                </div>
              ) : myOrders.length === 0 ? (
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Truck className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-amber-900 mb-2">No Active Orders</h3>
                    <p className="text-amber-600">Accept orders from the Available tab to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                myOrders.map((order) => (
                  <Card key={order.id} className="bg-white shadow-lg border-amber-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-amber-900">Order #{order.id}</h3>
                          <p className="text-amber-700">{order.retailer}</p>
                          <Badge className="mt-2" variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'in_transit' ? 'secondary' :
                            order.status === 'picked_up' ? 'outline' : 'destructive'
                          }>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">${((order.basePrice || 0) + (order.tip || 0)).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-900">Pickup</span>
                          </div>
                          <p className="text-sm text-amber-700 ml-6">{order.pickupStreetAddress}, {order.pickupCity}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Navigation className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-900">Return To</span>
                          </div>
                          <p className="text-sm text-amber-700 ml-6">{order.returnAddress || `${order.retailer} Store`}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                        <div className="flex space-x-2">
                          {order.status === 'assigned' && (
                            <Button 
                              size="sm"
                              onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'picked_up' })}
                              disabled={updateOrderMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                              data-testid={`button-pickup-${order.id}`}
                            >
                              Mark Picked Up
                            </Button>
                          )}
                          {order.status === 'picked_up' && (
                            <Button 
                              size="sm"
                              onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'in_transit' })}
                              disabled={updateOrderMutation.isPending}
                              className="bg-yellow-600 hover:bg-yellow-700"
                              data-testid={`button-transit-${order.id}`}
                            >
                              En Route
                            </Button>
                          )}
                          {order.status === 'in_transit' && (
                            <Button 
                              size="sm"
                              onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'delivered' })}
                              disabled={updateOrderMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`button-deliver-${order.id}`}
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link href={`/driver-portal/job/${order.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                              View Details
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" data-testid={`button-navigate-${order.id}`}>
                            <Navigation className="h-4 w-4 mr-1" />
                            Navigate
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-call-${order.id}`}>
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900">Earnings Overview</CardTitle>
                <CardDescription>Track your delivery earnings and payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600">${pendingEarnings.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{user.completedDeliveries}</p>
                    <p className="text-sm text-gray-600">Total Deliveries</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-semibold text-amber-900">Recent Earnings</h4>
                  {earnings.length === 0 ? (
                    <p className="text-amber-600 text-center py-4">No earnings data available</p>
                  ) : (
                    earnings.slice(0, 10).map((earning: any) => (
                      <div key={earning.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div>
                          <p className="font-medium text-amber-900">Order #{earning.orderId}</p>
                          <p className="text-sm text-amber-600">
                            {new Date(earning.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${earning.totalEarning.toFixed(2)}</p>
                          <Badge variant={earning.status === 'paid' ? 'default' : 'secondary'}>
                            {earning.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Support Button */}
      <ContactSupportButton 
        context={{ type: 'driver', id: String(user?.id) || 'DRIVER', name: user?.firstName || 'Driver' }}
      />
    </div>
  );
}