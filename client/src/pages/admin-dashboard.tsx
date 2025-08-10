import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth-simple";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Package, Users, TrendingUp, DollarSign, MapPin, Clock, Star, AlertTriangle, Plus, Edit2, Trash2 } from "lucide-react";
import { Order, User } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as const,
    discountValue: 0,
    minOrderValue: 0,
    maxUses: 100,
    validUntil: ''
  });

  // Queries
  const { data: orders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && user?.isAdmin
  });

  const { data: drivers = [], isLoading: loadingDrivers } = useQuery<User[]>({
    queryKey: ["/api/admin/drivers"],
    enabled: isAuthenticated && user?.isAdmin
  });

  // Mutations
  const createPromoMutation = useMutation({
    mutationFn: async (promoData: any) => {
      await apiRequest("POST", "/api/admin/promo", promoData);
    },
    onSuccess: () => {
      setNewPromoCode({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: 0,
        maxUses: 100,
        validUntil: ''
      });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status, adminNotes }: { orderId: string, status?: string, adminNotes?: string }) => {
      await apiRequest("PATCH", `/api/orders/${orderId}`, { status, adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    }
  });

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You need administrator access to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Analytics calculations
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const onlineDrivers = drivers.filter(driver => driver.isOnline).length;
  const avgDeliveryTime = orders.filter(o => o.actualDeliveryTime && o.actualPickupTime)
    .reduce((sum, order) => {
      const pickup = new Date(order.actualPickupTime!).getTime();
      const delivery = new Date(order.actualDeliveryTime!).getTime();
      return sum + (delivery - pickup);
    }, 0) / orders.filter(o => o.actualDeliveryTime && o.actualPickupTime).length / (1000 * 60); // in minutes

  // Chart data
  const orderStatusData = [
    { name: 'Created', value: orders.filter(o => o.status === 'created').length, color: '#F59E0B' },
    { name: 'Assigned', value: orders.filter(o => o.status === 'assigned').length, color: '#3B82F6' },
    { name: 'Picked Up', value: orders.filter(o => o.status === 'picked_up').length, color: '#10B981' },
    { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#6366F1' },
    { name: 'Completed', value: orders.filter(o => o.status === 'completed').length, color: '#059669' }
  ];

  const revenueData = orders.reduce((acc: any[], order) => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.revenue += order.totalPrice || 0;
      existing.orders += 1;
    } else {
      acc.push({ date, revenue: order.totalPrice || 0, orders: 1 });
    }
    return acc;
  }, []).slice(-7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Admin Dashboard</h1>
              <p className="text-amber-700 mt-1">Manage your Returnly platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-300 text-green-700">
                {onlineDrivers} Drivers Online
              </Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {todayOrders} Orders Today
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-amber-900">${totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Total Orders</p>
                  <p className="text-3xl font-bold text-amber-900">{orders.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Active Drivers</p>
                  <p className="text-3xl font-bold text-amber-900">{onlineDrivers}/{drivers.length}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Avg Delivery</p>
                  <p className="text-3xl font-bold text-amber-900">{avgDeliveryTime ? `${Math.round(avgDeliveryTime)}m` : 'N/A'}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-900">Revenue Trend</CardTitle>
              <CardDescription>Daily revenue over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-900">Order Status Distribution</CardTitle>
              <CardDescription>Current status of all orders</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-amber-100">
            <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:text-amber-900">
              Orders
            </TabsTrigger>
            <TabsTrigger value="drivers" className="data-[state=active]:bg-white data-[state=active]:text-amber-900">
              Drivers
            </TabsTrigger>
            <TabsTrigger value="promos" className="data-[state=active]:bg-white data-[state=active]:text-amber-900">
              Promo Codes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-amber-900">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900">Order Management</CardTitle>
                <CardDescription>Monitor and manage all return orders</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 20).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>User #{order.userId}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'delivered' ? 'secondary' :
                              order.status === 'picked_up' ? 'outline' : 'destructive'
                            }>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.driverId ? `Driver #${order.driverId}` : 'Unassigned'}
                          </TableCell>
                          <TableCell>${order.totalPrice?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  data-testid={`button-view-order-${order.id}`}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
                                  <DialogDescription>
                                    View and manage order information
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Pickup Address</Label>
                                        <p className="text-sm text-gray-600">{selectedOrder.pickupAddress}</p>
                                      </div>
                                      <div>
                                        <Label>Retailer</Label>
                                        <p className="text-sm text-gray-600">{selectedOrder.retailer}</p>
                                      </div>
                                      <div>
                                        <Label>Item Description</Label>
                                        <p className="text-sm text-gray-600">{selectedOrder.itemDescription}</p>
                                      </div>
                                      <div>
                                        <Label>Total Price</Label>
                                        <p className="text-sm text-gray-600">${selectedOrder.totalPrice?.toFixed(2)}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label>Update Status</Label>
                                      <Select onValueChange={(value) => updateOrderMutation.mutate({ orderId: selectedOrder.id, status: value })}>
                                        <SelectTrigger>
                                          <SelectValue placeholder={selectedOrder.status} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="created">Created</SelectItem>
                                          <SelectItem value="assigned">Assigned</SelectItem>
                                          <SelectItem value="picked_up">Picked Up</SelectItem>
                                          <SelectItem value="in_transit">In Transit</SelectItem>
                                          <SelectItem value="delivered">Delivered</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                          <SelectItem value="refunded">Refunded</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900">Driver Management</CardTitle>
                <CardDescription>Monitor driver performance and status</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDrivers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Deliveries</TableHead>
                        <TableHead>Total Earnings</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">#{driver.id}</TableCell>
                          <TableCell>
                            {driver.firstName && driver.lastName 
                              ? `${driver.firstName} ${driver.lastName}`
                              : driver.username}
                          </TableCell>
                          <TableCell>
                            <Badge variant={driver.isOnline ? 'default' : 'secondary'}>
                              {driver.isOnline ? 'Online' : 'Offline'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{driver.driverRating?.toFixed(1) || '5.0'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{driver.completedDeliveries}</TableCell>
                          <TableCell>${driver.totalEarnings?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>{new Date(driver.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promos">
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-amber-900">Promotional Codes</CardTitle>
                  <CardDescription>Create and manage discount codes</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-amber-600 hover:bg-amber-700" data-testid="button-create-promo">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Promo Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Promo Code</DialogTitle>
                      <DialogDescription>
                        Set up a new promotional discount code
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">Code</Label>
                        <Input
                          id="code"
                          value={newPromoCode.code}
                          onChange={(e) => setNewPromoCode({...newPromoCode, code: e.target.value.toUpperCase()})}
                          className="col-span-3"
                          placeholder="SAVE20"
                          data-testid="input-promo-code"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input
                          id="description"
                          value={newPromoCode.description}
                          onChange={(e) => setNewPromoCode({...newPromoCode, description: e.target.value})}
                          className="col-span-3"
                          placeholder="20% off your order"
                          data-testid="input-promo-description"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discountType" className="text-right">Type</Label>
                        <Select value={newPromoCode.discountType} onValueChange={(value: any) => setNewPromoCode({...newPromoCode, discountType: value})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="free_delivery">Free Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discountValue" className="text-right">Value</Label>
                        <Input
                          id="discountValue"
                          type="number"
                          value={newPromoCode.discountValue}
                          onChange={(e) => setNewPromoCode({...newPromoCode, discountValue: parseFloat(e.target.value)})}
                          className="col-span-3"
                          placeholder="20"
                          data-testid="input-promo-value"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={() => createPromoMutation.mutate(newPromoCode)}
                        disabled={createPromoMutation.isPending}
                        data-testid="button-save-promo"
                      >
                        {createPromoMutation.isPending ? "Creating..." : "Create Code"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Demo promo codes: RETURN50 (50% off), BUNDLE25 ($2.50 off), STUDENT15 (15% off), FREESHIP (free delivery)
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-amber-900">Performance Analytics</CardTitle>
                  <CardDescription>Detailed insights into platform performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-amber-900">{((orders.filter(o => o.status === 'completed').length / orders.length) * 100).toFixed(1)}%</h3>
                      <p className="text-amber-600">Success Rate</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-green-900">${(totalRevenue / orders.length).toFixed(2)}</h3>
                      <p className="text-green-600">Avg Order Value</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-blue-900">{drivers.filter(d => d.driverRating && d.driverRating >= 4.5).length}</h3>
                      <p className="text-blue-600">Top Rated Drivers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}