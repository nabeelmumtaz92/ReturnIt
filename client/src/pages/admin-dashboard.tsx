import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth-simple";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";

interface Order {
  id: number;
  customerId: number;
  driverId?: number;
  status: string;
  pickupAddress: string;
  retailer: string;
  itemDescription: string;
  totalAmount: number;
  createdAt: string;
  customerName?: string;
  driverName?: string;
}

interface Driver {
  id: number;
  username: string;
  email: string;
  isApproved: boolean;
  backgroundCheckStatus: string;
  totalEarnings: number;
  completedJobs: number;
  rating: number;
}

interface Analytics {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  activeDrivers: number;
  completionRate: number;
  avgOrderValue: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || !(user as any).isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, user, setLocation, toast]);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    enabled: isAuthenticated && (user as any)?.isAdmin,
  });

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
    enabled: isAuthenticated && (user as any)?.isAdmin,
  });

  // Fetch drivers
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['/api/admin/drivers'],
    enabled: isAuthenticated && (user as any)?.isAdmin,
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return await apiRequest(`/api/admin/orders/${orderId}/status`, 'PATCH', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  });

  // Approve driver mutation
  const approveDriverMutation = useMutation({
    mutationFn: async (driverId: number) => {
      return await apiRequest(`/api/admin/drivers/${driverId}/approve`, 'PATCH', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/drivers'] });
      toast({
        title: "Driver Approved",
        description: "Driver has been approved and can now accept orders",
      });
    },
    onError: () => {
      toast({
        title: "Approval Failed",
        description: "Failed to approve driver",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'assigned': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // Filter orders based on search and status
  const filteredOrders = orders?.filter((order: Order) => {
    const matchesSearch = !searchTerm || 
      order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-amber-800 animate-pulse" />
          <p className="text-amber-800">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !(user as any)?.isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-amber-800 hover:text-amber-900"
              data-testid="button-back-home"
            >
              ← Back
            </Button>
            <Shield className="h-8 w-8 text-amber-800" />
            <h1 className="text-xl font-bold text-amber-900">Admin Dashboard</h1>
          </div>
          <div className="text-amber-800 text-sm">
            Welcome, {user?.username}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stone-700">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-stone-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{analytics?.totalOrders || 0}</div>
              <p className="text-xs text-stone-600">
                {analytics?.completedOrders || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stone-700">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-stone-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                ${(analytics?.totalRevenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-stone-600">
                ${(analytics?.avgOrderValue || 0).toFixed(2)} avg order
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stone-700">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-stone-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {((analytics?.completionRate || 0) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-stone-600">
                {analytics?.activeDrivers || 0} active drivers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Management */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Management
            </CardTitle>
            <CardDescription>
              Monitor and manage all customer orders
            </CardDescription>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search orders</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="search"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-orders"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="status-filter" className="sr-only">Filter by status</Label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md bg-white"
                  data-testid="select-status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="created">Created</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-stone-400" />
                  <p className="text-stone-600 mt-2">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-stone-600">
                  No orders found matching your criteria
                </div>
              ) : (
                filteredOrders.map((order: Order) => (
                  <div key={order.id} className="border border-stone-200 rounded-lg p-4 bg-stone-50/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="font-medium text-amber-900">Order #{order.id}</span>
                        </div>
                        <div className="text-sm text-stone-700">
                          <p><strong>Customer:</strong> {order.customerName || 'Unknown'}</p>
                          <p><strong>Address:</strong> {order.pickupAddress}</p>
                          <p><strong>Retailer:</strong> {order.retailer}</p>
                          <p><strong>Item:</strong> {order.itemDescription}</p>
                          <p><strong>Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
                          {order.driverName && (
                            <p><strong>Driver:</strong> {order.driverName}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'created' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'assigned' })}
                            disabled={updateOrderMutation.isPending}
                            data-testid={`button-assign-${order.id}`}
                          >
                            Assign Driver
                          </Button>
                        )}
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'cancelled' })}
                            disabled={updateOrderMutation.isPending}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            data-testid={`button-cancel-${order.id}`}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Driver Management */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Driver Management
            </CardTitle>
            <CardDescription>
              Approve and manage delivery drivers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {driversLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-stone-400" />
                  <p className="text-stone-600 mt-2">Loading drivers...</p>
                </div>
              ) : !drivers || drivers.length === 0 ? (
                <div className="text-center py-8 text-stone-600">
                  No drivers registered yet
                </div>
              ) : (
                drivers.map((driver: Driver) => (
                  <div key={driver.id} className="border border-stone-200 rounded-lg p-4 bg-stone-50/50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-amber-900">{driver.username}</h3>
                          <Badge className={driver.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {driver.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="text-sm text-stone-700">
                          <p><strong>Email:</strong> {driver.email}</p>
                          <p><strong>Background Check:</strong> {driver.backgroundCheckStatus}</p>
                          <p><strong>Total Earnings:</strong> ${driver.totalEarnings?.toFixed(2) || '0.00'}</p>
                          <p><strong>Completed Jobs:</strong> {driver.completedJobs || 0}</p>
                          <p><strong>Rating:</strong> {driver.rating ? `${driver.rating.toFixed(1)}/5.0` : 'No ratings yet'}</p>
                        </div>
                      </div>
                      {!driver.isApproved && (
                        <Button
                          size="sm"
                          onClick={() => approveDriverMutation.mutate(driver.id)}
                          disabled={approveDriverMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          data-testid={`button-approve-driver-${driver.id}`}
                        >
                          Approve Driver
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}