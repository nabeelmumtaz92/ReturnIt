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
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // Check if new driver needs tutorial
  useEffect(() => {
    if (user && user.isDriver && !user.tutorialCompleted) {
      setLocation('/driver-tutorial');
    }
  }, [user, setLocation]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Location access denied")
      );
    }
  }, []);

  // Queries
  const { data: availableOrders = [], isLoading: loadingAvailable } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders/available"],
    enabled: isAuthenticated && user?.isDriver
  });

  const { data: myOrders = [], isLoading: loadingMy } = useQuery<Order[]>({
    queryKey: ["/api/driver/orders"],
    enabled: isAuthenticated && user?.isDriver
  });

  const { data: earnings = [] } = useQuery({
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

  const handleOnlineToggle = (checked: boolean) => {
    setIsOnline(checked);
    updateStatusMutation.mutate({ 
      isOnline: checked,
      currentLocation: currentLocation 
    });
  };

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

  const totalEarnings = earnings.reduce((sum: number, earning: any) => sum + earning.totalEarning, 0);
  const pendingEarnings = earnings.filter((e: any) => e.status === 'pending').reduce((sum: number, earning: any) => sum + earning.totalEarning, 0);
  const activeOrders = myOrders.filter(order => ['assigned', 'picked_up', 'in_transit'].includes(order.status));
  const completedToday = myOrders.filter(order => 
    order.status === 'completed' && 
    new Date(order.actualDeliveryTime || order.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-img-enhanced"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/6195125/pexels-photo-6195125.jpeg?auto=compress&cs=tinysrgb&w=5120&h=3413&dpr=3&fit=crop&crop=center&q=100)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="absolute inset-0 bg-white/85"></div>
      <div className="relative z-10">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-amber-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/welcome">
                <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-50" data-testid="button-home">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <div className="h-6 w-px bg-amber-200"></div>
              <h1 className="text-xl font-bold text-amber-900" data-testid="heading-portal">
                Driver Portal
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-amber-700 hover:bg-amber-50"
              data-testid="button-menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-amber-900 mb-6">Driver Navigation</h2>
            <div className="space-y-3">
              <Link href="/driver-portal">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50 bg-amber-50" data-testid="nav-portal">
                  <Home className="h-4 w-4 mr-3" />
                  Driver Portal
                </Button>
              </Link>
              <Link href="/driver-payments">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50" data-testid="nav-payments">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Payments & Earnings
                </Button>
              </Link>
              <Link href="/order-status">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50" data-testid="nav-orders">
                  <Package className="h-4 w-4 mr-3" />
                  My Orders
                </Button>
              </Link>
              <Link href="/admin-dashboard">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50" data-testid="nav-admin">
                  <Users className="h-4 w-4 mr-3" />
                  Admin Dashboard
                </Button>
              </Link>
              <Link href="/welcome">
                <Button variant="ghost" className="w-full justify-start text-amber-700 hover:bg-amber-50" data-testid="nav-home">
                  <Home className="h-4 w-4 mr-3" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header with User Info */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profileImage || undefined} />
                <AvatarFallback className="bg-amber-100 text-amber-900">
                  {user.firstName?.[0] || user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-amber-900">
                  Welcome back, {user.firstName || user.username}!
                </h2>
                <p className="text-amber-700">Driver ID: {user.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="order-1">
                <RoleSwitcher />
              </div>
              
              <div className="flex items-center space-x-2 order-3 sm:order-2">
                <Switch 
                  checked={isOnline} 
                  onCheckedChange={handleOnlineToggle}
                  data-testid="switch-online-status"
                />
                <span className={`font-medium text-xs sm:text-sm ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
                  <span className="sm:hidden">{isOnline ? 'On' : 'Off'}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 text-amber-700 order-2 sm:order-3">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-sm sm:text-base">{user.driverRating?.toFixed(1) || '5.0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Total Earnings</p>
                  <p className="text-3xl font-bold text-amber-900">${totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Pending</p>
                  <p className="text-3xl font-bold text-amber-900">${pendingEarnings.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-amber-200 cursor-pointer hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <a href="/driver-payments" className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Payment Center</p>
                    <p className="text-lg font-bold text-blue-700">Instant Pay</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
              </a>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Active Orders</p>
                  <p className="text-3xl font-bold text-amber-900">{activeOrders.length}</p>
                </div>
                <Truck className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Today</p>
                  <p className="text-3xl font-bold text-amber-900">{completedToday}</p>
                </div>
                <Package className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-amber-100">
            <TabsTrigger value="available" className="data-[state=active]:bg-white data-[state=active]:text-amber-900">
              Available Orders ({availableOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-amber-900">
              My Orders ({myOrders.length})
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-white data-[state=active]:text-amber-900">
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
                          <p className="text-2xl font-bold text-green-600">${(order.basePrice + (order.tip || 0)).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Base: ${order.basePrice} + Tip: ${order.tip || 0}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-900">Pickup Address</p>
                            <p className="text-amber-700">{order.pickupAddress}</p>
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
                        
                        <Button 
                          onClick={() => acceptOrderMutation.mutate(order.id)}
                          disabled={acceptOrderMutation.isPending}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                          data-testid={`button-accept-${order.id}`}
                        >
                          {acceptOrderMutation.isPending ? "Accepting..." : "Accept Order"}
                        </Button>
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
                          <p className="text-xl font-bold text-green-600">${(order.basePrice + (order.tip || 0)).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-900">Pickup</span>
                          </div>
                          <p className="text-sm text-amber-700 ml-6">{order.pickupAddress}</p>
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
        context={{ type: 'driver', id: user?.id || 'DRIVER', name: user?.firstName || 'Driver' }}
      />
      </div>
    </div>
  );
}