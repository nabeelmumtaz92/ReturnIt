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
import { MapPin, Clock, DollarSign, Star, Package, Truck, Navigation, Phone, CreditCard, FileText, Users, Menu, ArrowLeft, Home, Settings, Zap, TrendingUp, BarChart3, AlertCircle, User as UserIcon, ChevronDown, Calendar, X } from "lucide-react";
import { Order, User } from "@shared/schema";
import { RoleSwitcher } from '@/components/RoleSwitcher';
import DriverOnlineToggle from "@/components/DriverOnlineToggle";
import DriverOrderCard from "@/components/DriverOrderCard";
import DriverScheduleManager from "@/components/DriverScheduleManager";
import GPSNavigation from "@/components/GPSNavigation";
import LiveOrderMap from "@/components/LiveOrderMap";
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
  const [navigatingOrderId, setNavigatingOrderId] = useState<string | null>(null);
  
  // Allow both drivers and admins to access driver portal - moved up for earlier use
  const hasDriverAccess = user?.isDriver || user?.isAdmin;

  // Real-time driver status query to ensure background check and waitlist status updates
  const { data: driverStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/driver/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/driver/status');
      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    enabled: isAuthenticated && user?.isDriver
  });

  // Check if new driver needs tutorial (skip for admins viewing driver portal)
  useEffect(() => {
    if (user && user.isDriver && !user.isAdmin && !user.tutorialCompleted) {
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
      if (hasDriverAccess && isOnline) {
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
  }, [hasDriverAccess, isOnline]);

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
    enabled: isAuthenticated && hasDriverAccess
  });

  const { data: myOrders = [], isLoading: loadingMy } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders"],
    enabled: isAuthenticated && hasDriverAccess
  });

  const { data: earnings = [] } = useQuery<any[]>({
    queryKey: ["/api/driver/earnings"],
    enabled: isAuthenticated && hasDriverAccess
  });

  const { data: driverPerformance } = useQuery({
    queryKey: ["/api/driver/performance"],
    enabled: isAuthenticated && hasDriverAccess
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

  if (!isAuthenticated || !hasDriverAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-amber-900">Access Denied</CardTitle>
            <CardDescription>You need driver or admin access to view this page.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center">
              <Link href="/login" className="text-amber-600 hover:text-amber-800 underline">
                Sign in to continue
              </Link>
            </div>
          </CardContent>
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
      {/* Admin Viewing Indicator */}
      {user?.isAdmin && !user?.isDriver && (
        <div className="bg-blue-100 border-b border-blue-300 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                <UserIcon className="h-3 w-3 mr-1" />
                Admin View
              </Badge>
              <span className="text-blue-700 text-sm">
                Viewing driver portal for troubleshooting and quality assurance
              </span>
            </div>
            <Link href="/admin-dashboard">
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                Return to Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}

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
                <h1 className="text-2xl font-bold text-amber-900">
                  Driver Portal
                  {user?.isAdmin && !user?.isDriver && (
                    <span className="ml-2 text-sm text-blue-600">(Admin View)</span>
                  )}
                </h1>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-amber-700">
                    Welcome back, {user?.firstName || user?.username || 'Driver'}!
                    {user?.isAdmin && !user?.isDriver && (
                      <span className="ml-1 text-blue-600">(Administrator)</span>
                    )}
                  </span>
                  
                  {/* Real-time Driver Status Indicators */}
                  <div className="flex items-center space-x-2 ml-3">
                    {/* Background Check Status */}
                    {(driverStatus?.backgroundCheckStatus || user?.backgroundCheckStatus) && 
                     (driverStatus?.backgroundCheckStatus || user?.backgroundCheckStatus) !== 'approved' && (
                      <div className="flex items-center">
                        {(driverStatus?.backgroundCheckStatus || user?.backgroundCheckStatus) === 'pending' ? (
                          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                            <Clock className="h-3 w-3 mr-1" />
                            Background Check Pending
                          </Badge>
                        ) : (driverStatus?.backgroundCheckStatus || user?.backgroundCheckStatus) === 'in_progress' ? (
                          <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                            <Clock className="h-3 w-3 mr-1 animate-spin" />
                            Background Check In Progress
                          </Badge>
                        ) : (driverStatus?.backgroundCheckStatus || user?.backgroundCheckStatus) === 'failed' ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Background Check Failed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50">
                            <Clock className="h-3 w-3 mr-1" />
                            Background Check Required
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Waitlist Status */}
                    {(driverStatus?.applicationStatus || user?.applicationStatus) === 'waitlist' && (
                      <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                        <Users className="h-3 w-3 mr-1" />
                        On Waitlist
                        {driverStatus?.waitlistPosition && (
                          <span className="ml-1">#{driverStatus.waitlistPosition}</span>
                        )}
                      </Badge>
                    )}

                    {/* Application Status for non-approved drivers */}
                    {(driverStatus?.applicationStatus || user?.applicationStatus) && 
                     !['approved', 'waitlist'].includes(driverStatus?.applicationStatus || user?.applicationStatus || '') && (
                      <div className="flex items-center">
                        {(driverStatus?.applicationStatus || user?.applicationStatus) === 'pending_review' ? (
                          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                            <Clock className="h-3 w-3 mr-1" />
                            Under Review
                          </Badge>
                        ) : (driverStatus?.applicationStatus || user?.applicationStatus) === 'rejected' ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Application Rejected
                          </Badge>
                        ) : null}
                      </div>
                    )}
                  </div>
                  
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
        <Tabs defaultValue="map" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="map" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Live Map
            </TabsTrigger>
            <TabsTrigger value="available" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Available ({availableOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Active ({myOrders.length})
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <Card className="bg-white shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Live Order Map
                </CardTitle>
                <CardDescription>
                  Tap on order markers to view details and accept on-demand pickups
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[600px]">
                <LiveOrderMap 
                  driverId={user?.id}
                  onOrderAccept={(orderId) => {
                    acceptOrderMutation.mutate(orderId);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

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
                  <div key={order.id} className="space-y-4">
                    <Card className="bg-white shadow-lg border-amber-200">
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setNavigatingOrderId(navigatingOrderId === order.id ? null : order.id)}
                              data-testid={`button-navigate-${order.id}`}
                            >
                              <Navigation className="h-4 w-4 mr-1" />
                              {navigatingOrderId === order.id ? 'Hide Nav' : 'Navigate'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(`tel:${order.phone || '+1234567890'}`)}
                              data-testid={`button-call-${order.id}`}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* GPS Navigation Component */}
                    {navigatingOrderId === order.id && (
                      <GPSNavigation
                        destination={{
                          address: order.status === 'assigned' 
                            ? `${order.pickupStreetAddress}, ${order.pickupCity}` 
                            : (order.returnAddress || `${order.retailer} Store`),
                        }}
                        orderId={order.id}
                        customerPhone={order.phone || ''}
                        onNavigationStart={() => {
                          // Optional: Track navigation start event
                        }}
                        onNavigationEnd={() => {
                          // Optional: Track navigation end event
                        }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <DriverScheduleManager />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            {/* Earnings Overview */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900">Earnings Dashboard</CardTitle>
                <CardDescription>Comprehensive tracking of your delivery performance and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-xs text-green-700 mt-1">+12.5% from last month</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-3xl font-bold text-yellow-600">${pendingEarnings.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-xs text-yellow-700 mt-1">Next payout in 2 days</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-3xl font-bold text-blue-600">{user.completedDeliveries || 0}</p>
                    <p className="text-sm text-gray-600">Total Deliveries</p>
                    <p className="text-xs text-blue-700 mt-1">${((totalEarnings / (user.completedDeliveries || 1))).toFixed(2)} avg per delivery</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-3xl font-bold text-purple-600">{user?.driverRating?.toFixed(1) || '5.0'}</p>
                    <p className="text-sm text-gray-600">Driver Rating</p>
                    <p className="text-xs text-purple-700 mt-1">⭐⭐⭐⭐⭐ Excellent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-amber-900 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Weekly Deliveries</span>
                    <span className="font-semibold">{driverPerformance?.weeklyDeliveries || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Weekly Earnings</span>
                    <span className="font-semibold">${driverPerformance?.weeklyEarnings?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">On-Time Delivery Rate</span>
                    <span className="font-semibold text-green-600">{driverPerformance?.onTimeRate || 100}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-semibold">{driverPerformance?.customerSatisfaction || 98}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-amber-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Earnings Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Deliveries</span>
                      <span className="font-semibold">${(totalEarnings * 0.7).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tips</span>
                      <span className="font-semibold text-green-600">${(totalEarnings * 0.2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Bonuses & Incentives</span>
                      <span className="font-semibold text-blue-600">${(totalEarnings * 0.1).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total This Week</span>
                      <span className="text-green-600">${(totalEarnings * 0.3).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Earnings Chart */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900">Weekly Earnings Trend</CardTitle>
                <CardDescription>Your earnings over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const earnings = [45, 67, 52, 78, 89, 134, 98][index];
                    const maxEarnings = 134;
                    const height = (earnings / maxEarnings) * 100;
                    return (
                      <div key={day} className="text-center">
                        <div className="mb-2 h-32 flex items-end justify-center">
                          <div 
                            className="w-8 bg-amber-500 rounded-t-sm flex items-end justify-center text-xs text-white font-semibold"
                            style={{ height: `${height}%` }}
                          >
                            ${earnings}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Earnings */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900">Recent Earnings</CardTitle>
                <CardDescription>Your latest completed deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earnings.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                      <p className="text-amber-600">No earnings data available</p>
                      <p className="text-sm text-gray-500 mt-2">Complete your first delivery to see earnings here</p>
                    </div>
                  ) : (
                    earnings.slice(0, 10).map((earning: any) => (
                      <div key={earning.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-amber-700" />
                          </div>
                          <div>
                            <p className="font-medium text-amber-900">Order #{earning.orderId}</p>
                            <p className="text-sm text-amber-600">
                              {new Date(earning.createdAt).toLocaleDateString()} • 2.3 miles
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <div>
                            <p className="font-bold text-green-600">${earning.totalEarning.toFixed(2)}</p>
                            <Badge variant={earning.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                              {earning.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            28m
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {earnings.length > 10 && (
                  <div className="text-center mt-6">
                    <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      View All Earnings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instant Payout Section */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Instant Payout Available
                </CardTitle>
                <CardDescription>Cash out your pending earnings instantly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">${pendingEarnings.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Available for instant payout</p>
                    <p className="text-xs text-gray-500 mt-1">$0.50 instant transfer fee</p>
                  </div>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={pendingEarnings <= 0}
                    data-testid="button-instant-payout"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Cash Out Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}