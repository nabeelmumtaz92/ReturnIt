import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Screen } from '@/components/screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Clock,
  MapPin,
  User,
  Truck,
  BarChart3,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Filter,
  Download,
  Bell,
  Calendar,
  Search,
  CreditCard,
  MessageCircle,
  Phone,
  HeadphonesIcon,
  Send,
  Bot,
  UserCheck,
  X
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth-simple";
import { useToast } from "@/hooks/use-toast";
import AdminSupportModal from "@/components/AdminSupportModal";
import NotificationBell from "@/components/NotificationBell";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

interface Order {
  id: string;
  customer: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'refunded';
  driver?: string;
  amount: number;
  pickupAddress: string;
  destination: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  completedOrders: number;
  rating: number;
  earnings: number;
  pendingPayouts: number;
  location?: string;
  vehicleInfo?: string;
  joinDate: string;
  lastActive: string;
  supportTickets: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDriverDetail, setShowDriverDetail] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [showAdminSupportModal, setShowAdminSupportModal] = useState(false);
  const [supportContext, setSupportContext] = useState<{type: 'driver' | 'customer', id: string, name: string} | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    setOrders([
      {
        id: 'ORD001',
        customer: 'Sarah Johnson',
        status: 'pending',
        amount: 8.99,
        pickupAddress: '123 Main St, St. Louis, MO',
        destination: 'Target - Chesterfield',
        createdAt: '2024-01-12 10:30 AM',
        priority: 'high'
      },
      {
        id: 'ORD002',
        customer: 'Mike Rodriguez',
        status: 'assigned',
        driver: 'John Smith',
        amount: 12.50,
        pickupAddress: '456 Oak Ave, St. Louis, MO',
        destination: 'Best Buy - Kirkwood',
        createdAt: '2024-01-12 09:15 AM',
        priority: 'medium'
      },
      {
        id: 'ORD003',
        customer: 'Jennifer Lee',
        status: 'picked_up',
        driver: 'Maria Garcia',
        amount: 6.75,
        pickupAddress: '789 Pine Rd, St. Louis, MO',
        destination: 'Macy\'s - West County',
        createdAt: '2024-01-12 08:45 AM',
        priority: 'low'
      }
    ]);

    setDrivers([
      {
        id: 'DRV001',
        name: 'John Smith',
        email: 'john.smith@returnly.com',
        phone: '(314) 555-0101',
        status: 'active',
        completedOrders: 245,
        rating: 4.8,
        earnings: 1847.50,
        pendingPayouts: 127.85,
        location: 'Downtown St. Louis',
        vehicleInfo: '2021 Honda CR-V',
        joinDate: '2024-01-15',
        lastActive: '2024-01-12 11:45 AM',
        supportTickets: 2
      },
      {
        id: 'DRV002',
        name: 'Maria Garcia',
        email: 'maria.garcia@returnly.com',
        phone: '(314) 555-0102',
        status: 'active',
        completedOrders: 189,
        rating: 4.9,
        earnings: 1432.75,
        pendingPayouts: 89.50,
        location: 'Clayton',
        vehicleInfo: '2020 Toyota RAV4',
        joinDate: '2024-02-03',
        lastActive: '2024-01-12 10:22 AM',
        supportTickets: 0
      },
      {
        id: 'DRV003',
        name: 'David Wilson',
        email: 'david.wilson@returnly.com',
        phone: '(314) 555-0103',
        status: 'inactive',
        completedOrders: 67,
        rating: 4.6,
        earnings: 528.25,
        pendingPayouts: 45.00,
        location: 'Chesterfield',
        vehicleInfo: '2019 Subaru Outback',
        joinDate: '2023-11-20',
        lastActive: '2024-01-11 6:30 PM',
        supportTickets: 5
      }
    ]);
  }, []);

  if (!isAuthenticated) {
    return (
      <Screen>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-amber-900">Admin Access Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-amber-700 mb-4">Please sign in to access the admin dashboard.</p>
              <Button 
                onClick={() => setLocation('/login')}
                className="bg-amber-700 hover:bg-amber-800 text-white"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Screen>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      assigned: 'bg-blue-100 text-blue-800 border-blue-300',
      picked_up: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      refunded: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return variants[priority as keyof typeof variants] || variants.medium;
  };

  const getDriverStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const handleDriverPayout = (driver: Driver) => {
    toast({
      title: "Payout Initiated",
      description: `$${driver.pendingPayouts} sent to ${driver.name}`,
    });
  };

  const handleDriverSupport = (driver: Driver) => {
    setSupportContext({ type: 'driver', id: driver.id, name: driver.name });
    setShowAdminSupportModal(true);
  };

  const handleCustomerSupport = (order: Order) => {
    setSupportContext({ type: 'customer', id: order.id, name: order.customer });
    setShowAdminSupportModal(true);
  };

  return (
    <Screen>
      <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50">
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-amber-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="/logo-cardboard-deep.png" 
                  alt="Returnly Logo" 
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className="text-2xl font-bold text-amber-900">Admin Dashboard</h1>
                  <p className="text-amber-700">Business Operations Center</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <NotificationBell userType="admin" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/')}
                >
                  Back to Site
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">Today's Orders</p>
                    <p className="text-2xl font-bold text-amber-900">47</p>
                  </div>
                  <Package className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">+12% from yesterday</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">Active Drivers</p>
                    <p className="text-2xl font-bold text-amber-900">28</p>
                  </div>
                  <Truck className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">3 on break</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">Revenue Today</p>
                    <p className="text-2xl font-bold text-amber-900">$1,247</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">+8% from yesterday</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">Avg Pickup Time</p>
                    <p className="text-2xl font-bold text-amber-900">14min</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-xs text-amber-700 mt-2">-2min from yesterday</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="bg-white border-amber-200">
              <TabsTrigger value="orders" className="data-[state=active]:bg-amber-100">
                <Package className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="drivers" className="data-[state=active]:bg-amber-100">
                <Truck className="h-4 w-4 mr-2" />
                Drivers
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-100">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-amber-100">
                <MessageCircle className="h-4 w-4 mr-2" />
                Support Tickets
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-amber-100">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-amber-900">Live Orders</CardTitle>
                    <div className="flex items-center space-x-3">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="picked_up">Picked Up</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="p-4 border border-amber-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-semibold text-amber-900">{order.id}</p>
                              <p className="text-sm text-amber-700">{order.customer}</p>
                            </div>
                            <Badge className={`${getPriorityBadge(order.priority)} text-xs`}>
                              {order.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getStatusBadge(order.status)} text-xs mb-2`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <p className="text-sm font-semibold text-amber-900">${order.amount}</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-700">
                          <p><MapPin className="h-3 w-3 inline mr-1" />{order.pickupAddress}</p>
                          <p><Package className="h-3 w-3 inline mr-1" />{order.destination}</p>
                        </div>
                        {order.driver && (
                          <p className="mt-2 text-xs text-amber-600">
                            <Truck className="h-3 w-3 inline mr-1" />
                            Assigned to: {order.driver}
                          </p>
                        )}
                        <div className="flex justify-end mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-blue-700 border-blue-300"
                            onClick={() => handleCustomerSupport(order)}
                          >
                            <HeadphonesIcon className="h-3 w-3 mr-1" />
                            Support
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Drivers Tab */}
            <TabsContent value="drivers">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Driver Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drivers.map((driver) => (
                      <Card key={driver.id} className="border-amber-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getDriverStatusIcon(driver.status)}
                              <p className="font-semibold text-amber-900">{driver.name}</p>
                            </div>
                            <Badge className={`text-xs ${driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {driver.status}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-amber-700">
                            <p>📧 {driver.email}</p>
                            <p>📱 {driver.phone}</p>
                            <p>📍 {driver.location}</p>
                            <div className="flex justify-between pt-2 border-t border-amber-200">
                              <span>Orders: {driver.completedOrders}</span>
                              <span>⭐ {driver.rating}</span>
                            </div>
                            <p className="font-semibold text-amber-900">
                              Earnings: ${driver.earnings.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => {
                                setSelectedDriver(driver);
                                setShowDriverDetail(true);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 text-green-700 border-green-300"
                              onClick={() => handleDriverPayout(driver)}
                              disabled={driver.pendingPayouts === 0}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 text-blue-700 border-blue-300"
                              onClick={() => handleDriverSupport(driver)}
                            >
                              <HeadphonesIcon className="h-3 w-3 mr-1" />
                              Help
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Orders This Week</span>
                      <span className="font-bold text-amber-900">327</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Average Rating</span>
                      <span className="font-bold text-amber-900">4.8⭐</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Customer Retention</span>
                      <span className="font-bold text-amber-900">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Revenue Growth</span>
                      <span className="font-bold text-green-700">+23%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-900">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Server Status</span>
                      <span className="flex items-center text-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Healthy
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Payment Processing</span>
                      <span className="flex items-center text-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Online
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Driver Mobile App</span>
                      <span className="flex items-center text-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Connected
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Business Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="pickup-fee" className="text-amber-800 font-medium">Base Pickup Fee ($)</Label>
                      <Input 
                        id="pickup-fee" 
                        defaultValue="6.99" 
                        className="mt-1 border-amber-300 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-area" className="text-amber-800 font-medium">Service Area (miles)</Label>
                      <Input 
                        id="service-area" 
                        defaultValue="25" 
                        className="mt-1 border-amber-300 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-wait" className="text-amber-800 font-medium">Max Wait Time (hours)</Label>
                      <Input 
                        id="max-wait" 
                        defaultValue="4" 
                        className="mt-1 border-amber-300 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-commission" className="text-amber-800 font-medium">Driver Commission (%)</Label>
                      <Input 
                        id="driver-commission" 
                        defaultValue="70" 
                        className="mt-1 border-amber-300 focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button className="bg-amber-700 hover:bg-amber-800 text-white">
                      Save Settings
                    </Button>
                    <Button variant="outline" className="border-amber-300 text-amber-700">
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Admin Support Modal */}
        <AdminSupportModal
          isOpen={showAdminSupportModal}
          onClose={() => setShowAdminSupportModal(false)}
          context={supportContext}
        />
      </div>
    </Screen>
  );
}
