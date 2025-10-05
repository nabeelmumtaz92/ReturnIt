import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Package, 
  Truck, 
  Clock, 
  MapPin, 
  Plus, 
  Search,
  BarChart3,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  ChevronRight,
  User,
  Activity,
  Navigation
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth-simple';
import { useToast } from '@/hooks/use-toast';
import LiveOrderTracking from '@/components/LiveOrderTracking';
import { apiRequest } from '@/lib/queryClient';
import { Order } from '@shared/schema';

// Customer stats interface matching server response
interface CustomerStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
  recentOrders: number;
  averageOrderValue: number;
  lastOrderDate: number | null;
}

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to view your dashboard",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [isAuthenticated, authLoading, setLocation, toast]);

  // Fetch customer orders using customer-scoped endpoint for security
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery<Order[]>({
    queryKey: ['/api/customers/orders'],
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch customer statistics using customer-scoped endpoint
  const { data: customerStats, isLoading: statsLoading, error: statsError } = useQuery<CustomerStats>({
    queryKey: ['/api/customers/stats'],
    enabled: isAuthenticated && !!user?.id,
  });

  // Filter orders based on search
  const filteredOrders = orders.filter(order => 
    order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.retailer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.itemCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate active and completed orders (using proper status values from schema)
  const activeOrders = filteredOrders.filter(order => 
    !['delivered', 'completed', 'refunded', 'cancelled', 'dropped_off'].includes(order.status)
  );
  const completedOrders = filteredOrders.filter(order => 
    ['delivered', 'completed', 'refunded', 'cancelled', 'dropped_off'].includes(order.status)
  );

  const getStatusColor = (status: string) => {
    const colors = {
      created: 'bg-blue-100 text-blue-800',
      assigned: 'bg-yellow-100 text-yellow-800',
      en_route: 'bg-purple-100 text-purple-800',
      arrived: 'bg-orange-100 text-orange-800',
      picked_up: 'bg-indigo-100 text-indigo-800',
      in_transit: 'bg-cyan-100 text-cyan-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <Clock className="h-4 w-4" />;
      case 'assigned': case 'en_route': return <Truck className="h-4 w-4" />;
      case 'picked_up': case 'in_transit': return <Package className="h-4 w-4" />;
      case 'delivered': case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-3xl font-bold text-amber-900 animate-pulse">
            Return It
          </div>
          <p className="text-amber-800">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Use server-provided stats or fallback to calculated stats for better security
  const displayStats = customerStats || {
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    pendingOrders: activeOrders.length,
    totalSpent: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
    recentOrders: 0,
    averageOrderValue: 0,
    lastOrderDate: null
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-amber-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Link href="/">
                <div className="text-2xl font-bold text-amber-900 cursor-pointer hover:text-amber-700 transition-colors">
                  Return It
                </div>
              </Link>
              <p className="text-amber-700 mt-1">Customer Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <User className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email?.split('@')[0] || 'User'
                  }
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/')}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                data-testid="button-home"
              >
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">
                Welcome back, {user?.firstName || 'there'}! 👋
              </h1>
              <p className="text-amber-700">
                Track your returns and manage your pickups from here.
              </p>
            </div>
          </div>

          {/* Stats Cards - Stitch Pattern */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)] border-border">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    {ordersLoading || statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <div className="text-2xl font-bold text-amber-900" data-testid="stat-total-orders">
                        {displayStats.totalOrders}
                      </div>
                    )}
                  </div>
                  <BarChart3 className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)] border-border">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                    {ordersLoading || statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <div className="text-2xl font-bold text-blue-600" data-testid="stat-active-orders">
                        {displayStats.pendingOrders || activeOrders.length}
                      </div>
                    )}
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)] border-border">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    {ordersLoading || statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <div className="text-2xl font-bold text-green-600" data-testid="stat-completed-orders">
                        {displayStats.completedOrders}
                      </div>
                    )}
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)] border-border">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                    {ordersLoading || statsLoading ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <div className="text-2xl font-bold text-amber-900" data-testid="stat-total-spent">
                        ${(displayStats.totalSpent || 0).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <DollarSign className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Summary Panel - Stitch Pattern */}
        <div className="mb-8">
          <Card className="shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)] border-border">
            <CardHeader>
              <CardTitle className="text-xl text-amber-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : 'Not set'
                    }
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900 text-sm">{user?.email || 'Not set'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{user?.phone || 'Not set'}</p>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/profile')}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    data-testid="button-edit-profile"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => setLocation('/book-pickup')}
              className="bg-amber-600 hover:bg-amber-700 text-white h-auto p-6 flex flex-col items-center gap-3"
              data-testid="button-book-pickup"
            >
              <Plus className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">Book New Pickup</div>
                <div className="text-sm opacity-90">Schedule a return pickup</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => setLocation('/track')}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 h-auto p-6 flex flex-col items-center gap-3"
              data-testid="button-track-order"
            >
              <Search className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">Track Order</div>
                <div className="text-sm opacity-90">Track any order by number</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => setLocation('/profile')}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 h-auto p-6 flex flex-col items-center gap-3"
              data-testid="button-profile"
            >
              <User className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">My Profile</div>
                <div className="text-sm opacity-90">Manage account settings</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-amber-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Active Orders ({activeOrders.length})
            </h2>
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <Card key={order.id} className="shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-15px_rgba(249,152,6,0.2)] border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-2 capitalize">
                            {order.status.replace('_', ' ')}
                          </span>
                        </Badge>
                        <div>
                          <div className="font-semibold text-gray-900" data-testid={`order-id-${order.id}`}>
                            Order #{order.id}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.retailer} • {order.itemCategory}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.trackingNumber && order.trackingEnabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrderId(
                              selectedOrderId === order.id ? null : order.id
                            )}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            data-testid={`button-track-order-${order.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {selectedOrderId === order.id ? 'Hide Tracking' : 'Track Order'}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/order-status/${order.id}`)}
                          data-testid={`button-view-order-${order.id}`}
                        >
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {order.pickupCity}, {order.pickupState}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          ${(order.totalPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Live Tracking Integration - User Scoped */}
                    {selectedOrderId === order.id && order.trackingNumber && order.trackingEnabled && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="mb-3">
                          <h4 className="font-medium text-blue-900 flex items-center">
                            <Navigation className="h-4 w-4 mr-2" />
                            Live Tracking - Order #{order.id}
                          </h4>
                          <p className="text-sm text-blue-700">Tracking Number: {order.trackingNumber}</p>
                        </div>
                        <LiveOrderTracking 
                          orderId={order.id} 
                          className="border-0 shadow-none bg-transparent p-0"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Order History Table */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h2 className="text-xl font-semibold text-amber-900 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order History
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-orders"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                data-testid="button-refresh-orders"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {ordersLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : ordersError ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">No orders...yet!</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                  data-testid="button-retry-orders"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No matching orders found' : 'No orders yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Get started by booking your first pickup'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setLocation('/book-pickup')}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    data-testid="button-first-pickup"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Pickup
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Retailer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium" data-testid={`table-order-id-${order.id}`}>
                            #{order.id}
                          </div>
                          {order.trackingNumber && (
                            <div className="text-sm text-gray-500">
                              {order.trackingNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">
                            {order.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.retailer}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{order.itemCategory}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          ${(order.totalPrice || 0).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/order-status/${order.id}`)}
                            data-testid={`button-table-view-${order.id}`}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {order.trackingNumber && order.trackingEnabled && !['delivered', 'completed', 'refunded', 'cancelled', 'dropped_off'].includes(order.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrderId(
                                selectedOrderId === order.id ? null : order.id
                              )}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              data-testid={`button-table-track-${order.id}`}
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Track
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}