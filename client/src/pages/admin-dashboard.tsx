import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Truck,
  BarChart3,
  Settings,
  CheckCircle,
  CreditCard,
  MessageCircle,
  HeadphonesIcon,
  UserCheck,
  MapPin,
  Shield,
  Trophy,
  PieChart,
  Bell,
  Star,
  Terminal,
  RefreshCw,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth-simple";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { faker } from '@faker-js/faker';
import AdminSupportModal from "@/components/AdminSupportModal";
import NotificationBell from "@/components/NotificationBell";
import ContactSupportButton from "@/components/ContactSupportButton";
import { AdminLayout } from "@/components/AdminLayout";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import CompletedOrdersAnalytics from "@/components/CompletedOrdersAnalytics";
import AIAssistant from "@/components/AIAssistant";
import DeveloperConsole from "@/components/DeveloperConsole";

interface AdminDashboardProps {
  section?: string;
}

export default function AdminDashboard({ section }: AdminDashboardProps = {}) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get current section from URL parameters or props
  const urlParams = new URLSearchParams(window.location.search);
  const currentSection = urlParams.get('section') || section || 'overview';
  
  // Re-render when location changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [location]);
  
  // State for various features
  const [showAdminSupportModal, setShowAdminSupportModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showDeveloperConsole, setShowDeveloperConsole] = useState(false);
  const [supportContext, setSupportContext] = useState<{type: 'driver' | 'customer', id: string, name: string} | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['overview']);
  
  // Real-time data state
  const [dashboardStats, setDashboardStats] = useState({
    activeOrders: 24,
    activeDrivers: 12,
    todayRevenue: 486,
    completionRate: 94,
    lastUpdated: new Date()
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Function to change sections
  const changeSection = (newSection: string) => {
    // Add current section to history before changing
    setNavigationHistory(prev => [...prev, currentSection]);
    
    const url = new URL(window.location.href);
    if (newSection === 'overview') {
      url.searchParams.delete('section');
      setLocation('/admin-dashboard');
    } else {
      url.searchParams.set('section', newSection);
      setLocation(`/admin-dashboard?section=${newSection}`);
    }
  };

  // Function to go back to previous section
  const goBack = () => {
    if (navigationHistory.length > 1) {
      const previousSection = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      
      if (previousSection === 'overview') {
        setLocation('/admin-dashboard');
      } else {
        setLocation(`/admin-dashboard?section=${previousSection}`);
      }
    }
  };

  // Function to update dashboard statistics
  const updateDashboardStats = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call with realistic data variation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate real-time business changes with more dynamic variations
      const baseOrders = 15;
      const baseDrivers = 8;
      const baseRevenue = 300;
      
      // More realistic fluctuations that could happen during business operations
      const orderVariation = Math.floor(Math.random() * 25) + baseOrders; // 15-40 orders
      const driverVariation = Math.floor(Math.random() * 15) + baseDrivers; // 8-23 drivers
      const revenueVariation = Math.floor(Math.random() * 500) + baseRevenue; // $300-800
      const completionVariation = Math.floor(Math.random() * 8) + 92; // 92-100%
      
      setDashboardStats({
        activeOrders: orderVariation,
        activeDrivers: driverVariation,
        todayRevenue: revenueVariation,
        completionRate: completionVariation,
        lastUpdated: new Date()
      });
      
      toast({
        title: "Dashboard Updated",
        description: "All statistics have been refreshed with latest data",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Real-time event listener for admin tools updates
  useEffect(() => {
    const handleDashboardUpdate = (event: CustomEvent) => {
      console.log('Dashboard update triggered:', event.detail);
      updateDashboardStats();
    };

    // Listen for global update events from Admin Tools
    window.addEventListener('dashboardUpdate', handleDashboardUpdate as EventListener);
    
    return () => {
      window.removeEventListener('dashboardUpdate', handleDashboardUpdate as EventListener);
    };
  }, []);

  // Auto-refresh functionality for real-time stats
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      // Update every 10 seconds for truly real-time experience
      interval = setInterval(() => {
        updateDashboardStats();
      }, 10000); 
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  // Initial data load
  useEffect(() => {
    if (currentSection === 'overview') {
      updateDashboardStats();
    }
  }, [currentSection]);

  // Function to render content based on current section
  const renderSectionContent = () => {
    switch (currentSection) {
      case 'orders':
        return <OrdersContent />;
      case 'drivers':
        return <DriversContent />;
      case 'payments':
        return <PaymentsContent />;
      case 'analytics':
        return <AnalyticsContent />;
      case 'enhanced-analytics':
        return <EnhancedAnalyticsContent />;
      case 'routes':
        return <RoutesContent />;
      case 'quality':
        return <QualityContent />;
      case 'incentives':
        return <IncentivesContent />;
      case 'reporting':
        return <ReportingContent />;
      case 'tickets':
        return <TicketsContent />;
      case 'chat':
        return <ChatContent />;
      case 'ratings':
        return <RatingsContent />;
      case 'notifications':
        return <NotificationsContent />;
      case 'employees':
        return <EmployeesContent />;
      case 'operations':
        return <OperationsContent />;
      case 'payouts':
        return <PayoutsManagementContent />;
      case 'tax-reports':
        return <TaxReportsContent />;
      case 'overview':
      default:
        return <OverviewContent />;
    }
  };

  // Quick Actions Component
  const QuickActions = () => (
    <div className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-amber-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          onClick={() => changeSection('orders')}
          className="h-auto p-6 bg-white backdrop-blur-sm border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 flex flex-col items-center space-y-2"
          variant="outline"
        >
          <Package className="h-8 w-8" />
          <span className="text-sm font-medium">Manage Orders</span>
        </Button>
        
        <Button 
          onClick={() => changeSection('drivers')}
          className="h-auto p-6 bg-white backdrop-blur-sm border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 flex flex-col items-center space-y-2"
          variant="outline"
        >
          <Truck className="h-8 w-8" />
          <span className="text-sm font-medium">View Drivers</span>
        </Button>
        
        <Button 
          onClick={() => changeSection('analytics')}
          className="h-auto p-6 bg-white backdrop-blur-sm border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 flex flex-col items-center space-y-2"
          variant="outline"
        >
          <BarChart3 className="h-8 w-8" />
          <span className="text-sm font-medium">Analytics</span>
        </Button>
        
        <Button 
          onClick={() => changeSection('chat')}
          className="h-auto p-6 bg-white backdrop-blur-sm border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 flex flex-col items-center space-y-2"
          variant="outline"
        >
          <MessageCircle className="h-8 w-8" />
          <span className="text-sm font-medium">Support Chat</span>
        </Button>
      </div>
    </div>
  );

  // Individual section components
  const OverviewContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Quick Actions - Moved to top */}
      <QuickActions />

      {/* Update Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={updateDashboardStats}
            disabled={isUpdating}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isUpdating ? 'Updating...' : 'Update Stats'}
          </Button>
          
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            className={autoRefresh ? "bg-green-600 hover:bg-green-700 text-white" : ""}
          >
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
        </div>
        
        <div className="text-sm text-amber-600">
          Last updated: {dashboardStats.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Overview dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className={`bg-white/90 backdrop-blur-sm border-amber-200 transition-all duration-300 ${isUpdating ? 'animate-pulse' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Active Orders</p>
                <p className="text-2xl font-bold text-amber-900">{dashboardStats.activeOrders}</p>
                <Badge variant="outline" className="text-xs text-green-600 border-green-200 mt-1">
                  Live
                </Badge>
              </div>
              <Package className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/90 backdrop-blur-sm border-amber-200 transition-all duration-300 ${isUpdating ? 'animate-pulse' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Active Drivers</p>
                <p className="text-2xl font-bold text-amber-900">{dashboardStats.activeDrivers}</p>
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 mt-1">
                  Online
                </Badge>
              </div>
              <Truck className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/90 backdrop-blur-sm border-amber-200 transition-all duration-300 ${isUpdating ? 'animate-pulse' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-amber-900">${dashboardStats.todayRevenue}</p>
                <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 mt-1">
                  Real-time
                </Badge>
              </div>
              <DollarSign className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/90 backdrop-blur-sm border-amber-200 transition-all duration-300 ${isUpdating ? 'animate-pulse' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Completion Rate</p>
                <p className="text-2xl font-bold text-amber-900">{dashboardStats.completionRate}%</p>
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 mt-1">
                  Updated
                </Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const OrdersContent = () => {
    const [orders, setOrders] = useState([
      { id: 1, customer: 'Alice Johnson', status: 'in_progress', driver: 'John Smith', pickup: '123 Main St', dropoff: 'Walmart Returns', priority: 'standard', time: '2:30 PM', type: 'return' },
      { id: 2, customer: 'Bob Davis', status: 'pending_assignment', driver: null, pickup: '456 Oak Ave', dropoff: 'Target Returns', priority: 'urgent', time: '3:00 PM', type: 'exchange' },
      { id: 3, customer: 'Carol White', status: 'completed', driver: 'Sarah Wilson', pickup: '789 Pine St', dropoff: 'Amazon Returns', priority: 'standard', time: '1:45 PM', type: 'return' },
      { id: 4, customer: 'David Brown', status: 'requested', driver: null, pickup: '321 Elm St', dropoff: 'Best Buy Returns', priority: 'standard', time: '3:15 PM', type: 'return' }
    ]);

    const [selectedTab, setSelectedTab] = useState('active');
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const assignDriver = (orderId, driverName = 'Available Driver') => {
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'in_progress', driver: driverName }
          : order
      ));
    };

    const activeOrders = orders.filter(o => o.status === 'in_progress' || o.status === 'pending_assignment' || o.status === 'requested');
    const completedOrders = orders.filter(o => o.status === 'completed');

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {/* Order Pipeline Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-700">{orders.filter(o => o.status === 'requested').length}</p>
                  <p className="text-sm text-amber-600">Requested</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-700">{orders.filter(o => o.status === 'pending_assignment').length}</p>
                  <p className="text-sm text-amber-600">Assigned</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">{orders.filter(o => o.status === 'in_progress').length}</p>
                  <p className="text-sm text-amber-600">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">{completedOrders.length}</p>
                  <p className="text-sm text-amber-600">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-700">{orders.filter(o => o.priority === 'urgent').length}</p>
                  <p className="text-sm text-amber-600">Urgent</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Management */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-amber-900 text-xl">Order Pipeline: Requested → Assigned → In Progress → Completed</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowBulkUpload(!showBulkUpload)}
                    variant="outline"
                    size="sm"
                    data-testid="button-bulk-upload"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Bulk Upload
                  </Button>
                  <Button
                    onClick={() => setSelectedTab('active')}
                    variant={selectedTab === 'active' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Active ({activeOrders.length})
                  </Button>
                  <Button
                    onClick={() => setSelectedTab('completed')}
                    variant={selectedTab === 'completed' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Completed ({completedOrders.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showBulkUpload && (
                <div className="mb-6 p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <h4 className="font-medium text-amber-900 mb-2">Bulk Upload for Enterprise Clients</h4>
                  <p className="text-sm text-amber-600 mb-3">Upload CSV with columns: customer_name, pickup_address, dropoff_address, priority, type</p>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      accept=".csv"
                      className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-amber-100"
                    />
                    <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-upload-orders">
                      Process Upload
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {(selectedTab === 'active' ? activeOrders : completedOrders).map(order => (
                  <div key={order.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-amber-900">#{order.id} - {order.customer}</p>
                          <Badge className={
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'pending_assignment' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          {order.priority === 'urgent' && (
                            <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {order.type}
                          </Badge>
                          <span className="text-sm text-amber-600">{order.time}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-amber-600">Pickup</p>
                            <p className="font-medium text-amber-900">{order.pickup}</p>
                          </div>
                          <div>
                            <p className="text-amber-600">Drop-off</p>
                            <p className="font-medium text-amber-900">{order.dropoff}</p>
                          </div>
                          <div>
                            <p className="text-amber-600">Driver</p>
                            <p className="font-medium text-amber-900">{order.driver || 'Unassigned'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'pending_assignment' && (
                          <Button
                            onClick={() => assignDriver(order.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                            data-testid={`button-assign-driver-${order.id}`}
                          >
                            Assign Driver
                          </Button>
                        )}
                        <Button variant="outline" size="sm" data-testid={`button-view-order-${order.id}`}>
                          Track Live
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assignment System */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 text-xl">Manual & Automated Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border border-amber-200 rounded-lg bg-amber-50/30">
                    <h4 className="font-medium text-amber-900 mb-2">Auto-Assignment Rules</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-600">Distance-based routing</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-600">Load balancing</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-600">Priority queue</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Configure Assignment Rules
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 text-xl">Live Dashboard with Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 border border-amber-200 rounded-lg bg-amber-50/30 text-center">
                  <div className="h-32 bg-amber-100 rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-amber-600 text-sm">Interactive Map View</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-blue-700">{orders.filter(o => o.status === 'in_progress').length}</p>
                      <p className="text-amber-600">Live Tracking</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-green-700">94%</p>
                      <p className="text-amber-600">On-Time Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const DriversContent = () => {
    const [drivers, setDrivers] = useState([
      { 
        id: 1, 
        name: 'John Smith', 
        status: 'active', 
        availability: 'online',
        completedOrders: 247,
        rating: 4.8,
        punctuality: 95,
        onboardingStatus: 'completed',
        documents: { license: 'verified', insurance: 'verified', vehicle: 'verified' },
        currentDelivery: 'Order #1247'
      },
      { 
        id: 2, 
        name: 'Sarah Wilson', 
        status: 'active', 
        availability: 'offline',
        completedOrders: 189,
        rating: 4.6,
        punctuality: 92,
        onboardingStatus: 'completed',
        documents: { license: 'verified', insurance: 'verified', vehicle: 'verified' },
        currentDelivery: null
      },
      { 
        id: 3, 
        name: 'Mike Chen', 
        status: 'pending_approval', 
        availability: 'offline',
        completedOrders: 0,
        rating: 0,
        punctuality: 0,
        onboardingStatus: 'documents_pending',
        documents: { license: 'verified', insurance: 'pending', vehicle: 'not_submitted' },
        currentDelivery: null
      }
    ]);

    const [selectedTab, setSelectedTab] = useState('active');

    const toggleDriverStatus = (id) => {
      setDrivers(prev => prev.map(driver => 
        driver.id === id 
          ? { 
              ...driver, 
              availability: driver.availability === 'online' ? 'offline' : 'online' 
            }
          : driver
      ));
    };

    const approveDriver = (id) => {
      setDrivers(prev => prev.map(driver => 
        driver.id === id 
          ? { 
              ...driver, 
              status: 'active',
              onboardingStatus: 'completed'
            }
          : driver
      ));
    };

    const activeDrivers = drivers.filter(d => d.status === 'active');
    const pendingDrivers = drivers.filter(d => d.status === 'pending_approval');

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {/* Driver Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">{activeDrivers.filter(d => d.availability === 'online').length}</p>
                  <p className="text-sm text-amber-600">Online Now</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">{activeDrivers.filter(d => d.currentDelivery).length}</p>
                  <p className="text-sm text-amber-600">On Delivery</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-700">{activeDrivers.length}</p>
                  <p className="text-sm text-amber-600">Total Active</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-700">{pendingDrivers.length}</p>
                  <p className="text-sm text-amber-600">Pending Approval</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Driver Management Tabs */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-amber-900 text-xl">Driver Directory</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedTab('active')}
                    variant={selectedTab === 'active' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Active ({activeDrivers.length})
                  </Button>
                  <Button
                    onClick={() => setSelectedTab('pending')}
                    variant={selectedTab === 'pending' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Pending ({pendingDrivers.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(selectedTab === 'active' ? activeDrivers : pendingDrivers).map(driver => (
                  <div key={driver.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-amber-900">{driver.name}</p>
                          <Badge className={
                            driver.availability === 'online' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'
                          }>
                            {driver.availability}
                          </Badge>
                          {driver.status === 'pending_approval' && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Needs Approval
                            </Badge>
                          )}
                        </div>
                        
                        {driver.status === 'active' ? (
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-amber-600">Completed Orders</p>
                              <p className="font-bold text-amber-900">{driver.completedOrders}</p>
                            </div>
                            <div>
                              <p className="text-amber-600">Rating</p>
                              <p className="font-bold text-amber-900">{driver.rating}/5.0</p>
                            </div>
                            <div>
                              <p className="text-amber-600">Punctuality</p>
                              <p className="font-bold text-amber-900">{driver.punctuality}%</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-amber-600">Onboarding Status: {driver.onboardingStatus.replace('_', ' ')}</p>
                            <div className="flex gap-2">
                              <Badge variant={driver.documents.license === 'verified' ? 'default' : 'secondary'}>
                                License: {driver.documents.license}
                              </Badge>
                              <Badge variant={driver.documents.insurance === 'verified' ? 'default' : 'secondary'}>
                                Insurance: {driver.documents.insurance}
                              </Badge>
                              <Badge variant={driver.documents.vehicle === 'verified' ? 'default' : 'secondary'}>
                                Vehicle: {driver.documents.vehicle}
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        {driver.currentDelivery && (
                          <p className="text-xs text-blue-600 mt-1">Currently delivering: {driver.currentDelivery}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {driver.status === 'active' && (
                          <Button
                            onClick={() => toggleDriverStatus(driver.id)}
                            variant="outline"
                            size="sm"
                            className={driver.availability === 'online' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}
                            data-testid={`button-toggle-driver-${driver.id}`}
                          >
                            {driver.availability === 'online' ? 'Set Offline' : 'Set Online'}
                          </Button>
                        )}
                        {driver.status === 'pending_approval' && (
                          <Button
                            onClick={() => approveDriver(driver.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                            data-testid={`button-approve-driver-${driver.id}`}
                          >
                            Approve Driver
                          </Button>
                        )}
                        <Button variant="outline" size="sm" data-testid={`button-view-driver-${driver.id}`}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Driver Performance Overview */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <p className="text-2xl font-bold text-green-700">{(activeDrivers.reduce((sum, d) => sum + d.rating, 0) / activeDrivers.length).toFixed(1)}</p>
                  <p className="text-sm text-amber-600">Average Rating</p>
                </div>
                <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <p className="text-2xl font-bold text-blue-700">{Math.round(activeDrivers.reduce((sum, d) => sum + d.punctuality, 0) / activeDrivers.length)}%</p>
                  <p className="text-sm text-amber-600">Average Punctuality</p>
                </div>
                <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <p className="text-2xl font-bold text-amber-700">{activeDrivers.reduce((sum, d) => sum + d.completedOrders, 0)}</p>
                  <p className="text-sm text-amber-600">Total Completions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const PaymentsContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      {navigationHistory.length > 1 && (
        <div className="mb-4">
          <Button 
            onClick={goBack}
            variant="outline"
            className="border-amber-200 hover:bg-amber-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
          </Button>
        </div>
      )}

      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-amber-900 text-xl">Payment Tracking</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              onClick={updateDashboardStats}
              disabled={isUpdating}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Update Financials
            </Button>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              ${dashboardStats.todayRevenue} Today
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">Monitor payments, payouts, and financial metrics with real-time updates.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">${dashboardStats.todayRevenue}</p>
                  <p className="text-sm text-green-600">Today's Revenue</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-700">
                    ${Math.floor(dashboardStats.todayRevenue * 0.7)}
                  </p>
                  <p className="text-sm text-purple-600">Driver Payouts</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-900">
                    ${Math.floor(dashboardStats.todayRevenue * 0.3)}
                  </p>
                  <p className="text-sm text-amber-600">Platform Revenue</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Payment System</p>
            <p className="text-sm text-amber-600">Track payments and manage driver payouts with live financial data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      {navigationHistory.length > 1 && (
        <div className="mb-4">
          <Button 
            onClick={goBack}
            variant="outline"
            className="border-amber-200 hover:bg-amber-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
          </Button>
        </div>
      )}

      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-amber-900 text-xl">Business Intelligence</CardTitle>
          <Button 
            onClick={updateDashboardStats}
            disabled={isUpdating}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Update Analytics
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">Advanced business analytics and insights with real-time data.</p>
          <AnalyticsDashboard />
        </CardContent>
      </Card>
    </div>
  );

  const EnhancedAnalyticsContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      {navigationHistory.length > 1 && (
        <div className="mb-4">
          <Button 
            onClick={goBack}
            variant="outline"
            className="border-amber-200 hover:bg-amber-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
          </Button>
        </div>
      )}

      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-amber-900 text-xl">Enhanced Analytics</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              onClick={updateDashboardStats}
              disabled={isUpdating}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Data
            </Button>
            <Badge variant="outline" className="text-green-600 border-green-200">
              Auto-updating
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">Real-time performance metrics and comprehensive analytics with live updates.</p>
          <CompletedOrdersAnalytics completedOrders={[]} />
        </CardContent>
      </Card>
    </div>
  );

  const RoutesContent = () => {
    const [routes, setRoutes] = useState([
      { id: 1, driver: 'John Smith', stops: 5, distance: '12.3 mi', eta: '2:45 PM', status: 'active' },
      { id: 2, driver: 'Sarah Johnson', stops: 3, distance: '8.7 mi', eta: '3:15 PM', status: 'pending' },
      { id: 3, driver: 'Mike Wilson', stops: 7, distance: '15.2 mi', eta: '4:00 PM', status: 'completed' }
    ]);

    const optimizeRoutes = async () => {
      setIsUpdating(true);
      // Simulate route optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRoutes(prev => prev.map(route => ({
        ...route,
        distance: `${(parseFloat(route.distance) * 0.9).toFixed(1)} mi`,
        eta: route.status === 'active' ? '2:30 PM' : route.eta
      })));
      setIsUpdating(false);
    };

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-amber-900 text-xl">Route Optimization</CardTitle>
            <Button 
              onClick={optimizeRoutes}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-optimize-routes"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
              Optimize Routes
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routes.map(route => (
                <div key={route.id} className="flex items-center justify-between p-4 border border-amber-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-amber-900">{route.driver}</p>
                    <p className="text-sm text-amber-600">{route.stops} stops • {route.distance} • ETA: {route.eta}</p>
                  </div>
                  <Badge className={
                    route.status === 'active' ? 'bg-green-100 text-green-800' :
                    route.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {route.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const QualityContent = () => {
    const [qualityMetrics, setQualityMetrics] = useState({
      averageRating: 4.7,
      completedDeliveries: 1247,
      onTimeRate: 89,
      customerSatisfaction: 92,
      issueReports: 8
    });

    const [recentIssues, setRecentIssues] = useState([
      { id: 1, type: 'delivery_delay', driver: 'John Smith', customer: 'Alice Johnson', status: 'resolved', time: '2 hours ago' },
      { id: 2, type: 'damaged_item', driver: 'Sarah Wilson', customer: 'Bob Davis', status: 'investigating', time: '4 hours ago' },
      { id: 3, type: 'wrong_address', driver: 'Mike Chen', customer: 'Carol White', status: 'resolved', time: '6 hours ago' }
    ]);

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Quality Assurance Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <p className="text-2xl font-bold text-green-700">{qualityMetrics.averageRating}</p>
                  <p className="text-sm text-amber-600">Avg Rating</p>
                </div>
                <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <p className="text-2xl font-bold text-blue-700">{qualityMetrics.completedDeliveries}</p>
                  <p className="text-sm text-amber-600">Completed</p>
                </div>
                <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <p className="text-2xl font-bold text-amber-700">{qualityMetrics.onTimeRate}%</p>
                  <p className="text-sm text-amber-600">On Time</p>
                </div>
                <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <p className="text-2xl font-bold text-green-700">{qualityMetrics.customerSatisfaction}%</p>
                  <p className="text-sm text-amber-600">Satisfaction</p>
                </div>
                <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <p className="text-2xl font-bold text-red-700">{qualityMetrics.issueReports}</p>
                  <p className="text-sm text-amber-600">Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Recent Quality Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentIssues.map(issue => (
                  <div key={issue.id} className="flex items-center justify-between p-4 border border-amber-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-amber-900">{issue.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-sm text-amber-600">Driver: {issue.driver} • Customer: {issue.customer}</p>
                      <p className="text-xs text-amber-500">{issue.time}</p>
                    </div>
                    <Badge className={
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      issue.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {issue.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const IncentivesContent = () => {
    const [incentives, setIncentives] = useState([
      { id: 1, name: 'Peak Hours Bonus', amount: '$2.50', active: true, description: 'Extra pay during 5-7 PM rush' },
      { id: 2, name: 'Weekend Warrior', amount: '$5.00', active: true, description: 'Saturday & Sunday premium' },
      { id: 3, name: 'Multi-Stop Master', amount: '$1.00', active: false, description: 'Per additional stop after 3' },
      { id: 4, name: 'Perfect Rating', amount: '$10.00', active: true, description: 'Monthly bonus for 5-star ratings' }
    ]);

    const toggleIncentive = (id) => {
      setIncentives(prev => prev.map(inc => 
        inc.id === id ? { ...inc, active: !inc.active } : inc
      ));
    };

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-amber-900 text-xl">Driver Incentive Programs</CardTitle>
              <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-add-incentive">
                <Trophy className="h-4 w-4 mr-2" />
                Add New Incentive
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incentives.map(incentive => (
                  <div key={incentive.id} className="flex items-center justify-between p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-amber-900">{incentive.name}</p>
                        <Trophy className="h-4 w-4 text-yellow-600" />
                      </div>
                      <p className="text-sm text-amber-600 mb-2">{incentive.description}</p>
                      <p className="text-lg font-bold text-green-700">{incentive.amount} per delivery</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={incentive.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {incentive.active ? 'Active' : 'Disabled'}
                      </Badge>
                      <Button 
                        onClick={() => toggleIncentive(incentive.id)}
                        variant="outline"
                        size="sm"
                        className={incentive.active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}
                        data-testid={`button-toggle-incentive-${incentive.id}`}
                      >
                        {incentive.active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Incentive Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600">Active Incentives</p>
                    <p className="text-2xl font-bold text-amber-900">{incentives.filter(i => i.active).length}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600">Monthly Bonus Paid</p>
                    <p className="text-2xl font-bold text-green-700">${(Math.random() * 2000 + 1500).toFixed(0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600">Drivers Earning Bonuses</p>
                    <p className="text-2xl font-bold text-blue-700">{Math.floor(Math.random() * 15 + 8)}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const ReportingContent = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportStatus, setReportStatus] = useState('');

    // Function to convert data to CSV format
    const convertToCSV = (data: any[], headers: string[]) => {
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(','))
      ].join('\n');
      return csvContent;
    };

    // Function to trigger download
    const downloadFile = (content: string, filename: string, type: string = 'text/csv') => {
      const blob = new Blob([content], { type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    };

    const generateReport = async (reportType: string) => {
      setIsGenerating(true);
      setReportStatus(`Generating ${reportType} report...`);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let data: any[] = [];
        let headers: string[] = [];
        let filename = '';

        switch (reportType) {
          case 'Daily Operations':
            data = [
              { date: '2024-01-22', orders: 45, completed: 42, completion_rate: '93%', avg_delivery_time: '32 min', revenue: '$1,240' },
              { date: '2024-01-21', orders: 38, completed: 36, completion_rate: '95%', avg_delivery_time: '28 min', revenue: '$1,052' },
              { date: '2024-01-20', orders: 52, completed: 49, completion_rate: '94%', avg_delivery_time: '31 min', revenue: '$1,436' },
              { date: '2024-01-19', orders: 41, completed: 40, completion_rate: '98%', avg_delivery_time: '26 min', revenue: '$1,133' },
              { date: '2024-01-18', orders: 47, completed: 44, completion_rate: '94%', avg_delivery_time: '29 min', revenue: '$1,299' }
            ];
            headers = ['date', 'orders', 'completed', 'completion_rate', 'avg_delivery_time', 'revenue'];
            filename = `operations_report_${new Date().toISOString().split('T')[0]}.csv`;
            break;

          case 'Financial Summary':
            data = [
              { date: '2024-01-22', gross_revenue: '$1,240', driver_payouts: '$868', platform_fee: '$372', net_profit: '$372' },
              { date: '2024-01-21', gross_revenue: '$1,052', driver_payouts: '$737', platform_fee: '$315', net_profit: '$315' },
              { date: '2024-01-20', gross_revenue: '$1,436', driver_payouts: '$1,005', platform_fee: '$431', net_profit: '$431' },
              { date: '2024-01-19', gross_revenue: '$1,133', driver_payouts: '$793', platform_fee: '$340', net_profit: '$340' },
              { date: '2024-01-18', gross_revenue: '$1,299', driver_payouts: '$909', platform_fee: '$390', net_profit: '$390' }
            ];
            headers = ['date', 'gross_revenue', 'driver_payouts', 'platform_fee', 'net_profit'];
            filename = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
            break;

          case 'Driver Performance':
            data = [
              { driver_name: 'John Smith', completed_orders: 247, rating: 4.8, punctuality: '95%', earnings: '$2,847', status: 'Active' },
              { driver_name: 'Sarah Wilson', completed_orders: 189, rating: 4.6, punctuality: '92%', earnings: '$2,178', status: 'Active' },
              { driver_name: 'Mike Chen', completed_orders: 156, rating: 4.7, punctuality: '94%', earnings: '$1,798', status: 'Active' },
              { driver_name: 'Lisa Rodriguez', completed_orders: 203, rating: 4.9, punctuality: '97%', earnings: '$2,341', status: 'Active' },
              { driver_name: 'David Kim', completed_orders: 134, rating: 4.5, punctuality: '89%', earnings: '$1,544', status: 'Active' }
            ];
            headers = ['driver_name', 'completed_orders', 'rating', 'punctuality', 'earnings', 'status'];
            filename = `driver_performance_${new Date().toISOString().split('T')[0]}.csv`;
            break;

          case 'Customer Analytics':
            data = [
              { customer_name: 'Alice Johnson', total_orders: 12, avg_rating: 4.8, last_order: '2024-01-22', total_spent: '$330', customer_type: 'Regular' },
              { customer_name: 'Bob Davis', total_orders: 8, avg_rating: 4.6, last_order: '2024-01-21', total_spent: '$220', customer_type: 'New' },
              { customer_name: 'Carol White', total_orders: 15, avg_rating: 4.9, last_order: '2024-01-20', total_spent: '$425', customer_type: 'VIP' },
              { customer_name: 'David Brown', total_orders: 6, avg_rating: 4.7, last_order: '2024-01-19', total_spent: '$165', customer_type: 'New' },
              { customer_name: 'Emma Wilson', total_orders: 22, avg_rating: 4.8, last_order: '2024-01-18', total_spent: '$605', customer_type: 'VIP' }
            ];
            headers = ['customer_name', 'total_orders', 'avg_rating', 'last_order', 'total_spent', 'customer_type'];
            filename = `customer_analytics_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        }

        const csvContent = convertToCSV(data, headers);
        downloadFile(csvContent, filename);
        
        setReportStatus(`✅ ${reportType} report downloaded successfully`);
        setTimeout(() => setReportStatus(''), 3000);
      } catch (error) {
        setReportStatus(`❌ Failed to generate ${reportType} report`);
        setTimeout(() => setReportStatus(''), 3000);
      }
      setIsGenerating(false);
    };

    const reports = [
      { name: 'Daily Operations', description: 'Orders, deliveries, and performance metrics', icon: BarChart3 },
      { name: 'Financial Summary', description: 'Revenue, payouts, and profit analysis', icon: DollarSign },
      { name: 'Driver Performance', description: 'Individual driver statistics and ratings', icon: Users },
      { name: 'Customer Analytics', description: 'Customer behavior and satisfaction data', icon: Star }
    ];

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        {reportStatus && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">{reportStatus}</p>
          </div>
        )}

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Report Generation Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((report, index) => {
                  const IconComponent = report.icon;
                  return (
                    <div key={index} className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-amber-600" />
                          <p className="font-medium text-amber-900">{report.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-amber-600 mb-3">{report.description}</p>
                      <Button 
                        onClick={() => generateReport(report.name)}
                        disabled={isGenerating}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        data-testid={`button-generate-${report.name.toLowerCase().replace(' ', '-')}`}
                      >
                        {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PieChart className="h-4 w-4 mr-2" />}
                        Generate Report
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-amber-200 rounded-lg">
                  <div>
                    <p className="font-medium text-amber-900">Daily Operations Report - Jan 22</p>
                    <p className="text-sm text-amber-600">Generated 2 hours ago • 847 KB</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-amber-200 rounded-lg">
                  <div>
                    <p className="font-medium text-amber-900">Weekly Financial Summary</p>
                    <p className="text-sm text-amber-600">Generated yesterday • 1.2 MB</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const TicketsContent = () => {
    const [tickets, setTickets] = useState([
      { id: 1, customer: 'Alice Johnson', issue: 'Package not delivered', status: 'open', priority: 'high', time: '1 hour ago', assigned: 'Support Team' },
      { id: 2, customer: 'Bob Davis', issue: 'Damaged item received', status: 'in_progress', priority: 'medium', time: '3 hours ago', assigned: 'Sarah M.' },
      { id: 3, customer: 'Carol White', issue: 'Wrong pickup time', status: 'resolved', priority: 'low', time: '5 hours ago', assigned: 'Mike R.' },
      { id: 4, customer: 'David Brown', issue: 'Driver was rude', status: 'open', priority: 'high', time: '6 hours ago', assigned: 'Unassigned' }
    ]);

    const [filterStatus, setFilterStatus] = useState('all');

    const updateTicketStatus = (id, newStatus) => {
      setTickets(prev => prev.map(ticket => 
        ticket.id === id ? { ...ticket, status: newStatus } : ticket
      ));
    };

    const filteredTickets = filterStatus === 'all' 
      ? tickets 
      : tickets.filter(ticket => ticket.status === filterStatus);

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-amber-900 text-xl">Support Ticket Management</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilterStatus('all')}
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                >
                  All ({tickets.length})
                </Button>
                <Button
                  onClick={() => setFilterStatus('open')}
                  variant={filterStatus === 'open' ? 'default' : 'outline'}
                  size="sm"
                >
                  Open ({tickets.filter(t => t.status === 'open').length})
                </Button>
                <Button
                  onClick={() => setFilterStatus('in_progress')}
                  variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                  size="sm"
                >
                  In Progress ({tickets.filter(t => t.status === 'in_progress').length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTickets.map(ticket => (
                  <div key={ticket.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-amber-900">#{ticket.id} - {ticket.customer}</p>
                          <Badge className={
                            ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-amber-700 mb-1">{ticket.issue}</p>
                        <div className="flex items-center gap-4 text-xs text-amber-600">
                          <span>{ticket.time}</span>
                          <span>Assigned: {ticket.assigned}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                          ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        {ticket.status !== 'resolved' && (
                          <Button
                            onClick={() => updateTicketStatus(ticket.id, 
                              ticket.status === 'open' ? 'in_progress' : 'resolved'
                            )}
                            variant="outline"
                            size="sm"
                            data-testid={`button-update-ticket-${ticket.id}`}
                          >
                            {ticket.status === 'open' ? 'Start Work' : 'Resolve'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ticket Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-700">{tickets.filter(t => t.status === 'open').length}</p>
                  <p className="text-sm text-amber-600">Open Tickets</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-700">{tickets.filter(t => t.status === 'in_progress').length}</p>
                  <p className="text-sm text-amber-600">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">{tickets.filter(t => t.status === 'resolved').length}</p>
                  <p className="text-sm text-amber-600">Resolved</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-700">{Math.round((tickets.filter(t => t.status === 'resolved').length / tickets.length) * 100)}%</p>
                  <p className="text-sm text-amber-600">Resolution Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const ChatContent = () => {
    const [activeChats, setActiveChats] = useState([
      { id: 1, customer: 'Alice Johnson', lastMessage: 'When will my package be delivered?', status: 'active', time: '2 min ago', unread: 2 },
      { id: 2, customer: 'Bob Davis', lastMessage: 'The driver was very helpful!', status: 'resolved', time: '15 min ago', unread: 0 },
      { id: 3, customer: 'Carol White', lastMessage: 'I need to reschedule my pickup', status: 'waiting', time: '1 hour ago', unread: 1 }
    ]);

    const [selectedChat, setSelectedChat] = useState(null);

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-amber-900 text-xl">Live Chat Center</CardTitle>
              <Badge variant="outline" className="text-green-700">
                {activeChats.filter(chat => chat.status === 'active').length} Active
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chat List */}
                <div className="space-y-3">
                  <h3 className="font-medium text-amber-900 mb-3">Active Conversations</h3>
                  {activeChats.map(chat => (
                    <div 
                      key={chat.id} 
                      className="p-4 border border-amber-200 rounded-lg bg-amber-50/30 cursor-pointer hover:bg-amber-50/50"
                      onClick={() => setSelectedChat(chat)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-amber-900">{chat.customer}</p>
                            {chat.unread > 0 && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                {chat.unread} new
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-amber-700 mb-1">{chat.lastMessage}</p>
                          <p className="text-xs text-amber-500">{chat.time}</p>
                        </div>
                        <Badge className={
                          chat.status === 'active' ? 'bg-green-100 text-green-800' :
                          chat.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {chat.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Window */}
                <div className="border border-amber-200 rounded-lg bg-amber-50/30 p-4 h-96">
                  {selectedChat ? (
                    <div className="flex flex-col h-full">
                      <div className="border-b border-amber-200 pb-2 mb-4">
                        <h4 className="font-medium text-amber-900">{selectedChat.customer}</h4>
                        <p className="text-sm text-amber-600">Status: {selectedChat.status}</p>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                        <div className="text-right">
                          <div className="inline-block bg-blue-100 text-blue-800 p-2 rounded-lg text-sm max-w-xs">
                            How can I help you today?
                          </div>
                          <p className="text-xs text-amber-500 mt-1">Support Agent</p>
                        </div>
                        <div className="text-left">
                          <div className="inline-block bg-amber-100 text-amber-800 p-2 rounded-lg text-sm max-w-xs">
                            {selectedChat.lastMessage}
                          </div>
                          <p className="text-xs text-amber-500 mt-1">{selectedChat.customer}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Type your response..." 
                          className="flex-1 px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-amber-400" />
                        <p className="text-amber-700">Select a conversation to start chatting</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">{activeChats.filter(c => c.status === 'active').length}</p>
                  <p className="text-sm text-amber-600">Active Chats</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-700">{activeChats.filter(c => c.status === 'waiting').length}</p>
                  <p className="text-sm text-amber-600">Waiting</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">{activeChats.reduce((total, chat) => total + chat.unread, 0)}</p>
                  <p className="text-sm text-amber-600">Unread Messages</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-700">2.3 min</p>
                  <p className="text-sm text-amber-600">Avg Response</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const RatingsContent = () => {
    const [ratingStats, setRatingStats] = useState({
      averageRating: 4.7,
      totalReviews: 1247,
      fiveStars: 876,
      fourStars: 245,
      threeStars: 89,
      twoStars: 25,
      oneStars: 12
    });

    const [recentRatings, setRecentRatings] = useState([
      { id: 1, customer: 'Alice Johnson', driver: 'John Smith', rating: 5, comment: 'Excellent service! Very professional.', time: '2 hours ago' },
      { id: 2, customer: 'Bob Davis', driver: 'Sarah Wilson', rating: 4, comment: 'Good delivery, on time.', time: '4 hours ago' },
      { id: 3, customer: 'Carol White', driver: 'Mike Chen', rating: 5, comment: 'Great communication and care with package.', time: '6 hours ago' },
      { id: 4, customer: 'David Brown', driver: 'Lisa Park', rating: 3, comment: 'Package was slightly damaged but service was okay.', time: '8 hours ago' }
    ]);

    const renderStars = (rating) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star 
          key={i} 
          className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      ));
    };

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {/* Rating Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 text-xl">Rating Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-amber-900 mb-2">{ratingStats.averageRating}</p>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(ratingStats.averageRating))}
                  </div>
                  <p className="text-amber-600">Based on {ratingStats.totalReviews} reviews</p>
                </div>
                
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = ratingStats[`${['', 'one', 'two', 'three', 'four', 'five'][stars]}Stars`];
                    const percentage = Math.round((count / ratingStats.totalReviews) * 100);
                    
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-sm text-amber-700 w-8">{stars}★</span>
                        <div className="flex-1 bg-amber-100 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-amber-600 w-12">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 text-xl">Rating Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <p className="text-2xl font-bold text-green-700">{Math.round((ratingStats.fiveStars / ratingStats.totalReviews) * 100)}%</p>
                    <p className="text-sm text-amber-600">5-Star Ratings</p>
                  </div>
                  <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <p className="text-2xl font-bold text-blue-700">{Math.round(((ratingStats.fiveStars + ratingStats.fourStars) / ratingStats.totalReviews) * 100)}%</p>
                    <p className="text-sm text-amber-600">4+ Star Ratings</p>
                  </div>
                  <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <p className="text-2xl font-bold text-amber-700">{Math.round(((ratingStats.oneStars + ratingStats.twoStars) / ratingStats.totalReviews) * 100)}%</p>
                    <p className="text-sm text-amber-600">Low Ratings</p>
                  </div>
                  <div className="text-center p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <p className="text-2xl font-bold text-purple-700">4.2</p>
                    <p className="text-sm text-amber-600">Driver Avg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Ratings */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Recent Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRatings.map(rating => (
                  <div key={rating.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-amber-900">{rating.customer}</p>
                          <div className="flex">
                            {renderStars(rating.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-amber-700 mb-1">"{rating.comment}"</p>
                        <div className="flex items-center gap-4 text-xs text-amber-600">
                          <span>Driver: {rating.driver}</span>
                          <span>{rating.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const NotificationsContent = () => {
    const [notifications, setNotifications] = useState([
      { id: 1, type: 'system', title: 'Server Maintenance Scheduled', message: 'Planned maintenance window on Sunday 3 AM', priority: 'medium', time: '2 hours ago', read: false },
      { id: 2, type: 'alert', title: 'High Order Volume Alert', message: '15% increase in orders vs last week', priority: 'high', time: '4 hours ago', read: false },
      { id: 3, type: 'info', title: 'New Driver Application', message: 'Sarah Miller applied for driver position', priority: 'low', time: '6 hours ago', read: true },
      { id: 4, type: 'warning', title: 'Payment Processing Delay', message: 'Stripe API experiencing delays', priority: 'high', time: '1 day ago', read: true }
    ]);

    const markAsRead = (id) => {
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    };

    const markAllAsRead = () => {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    };

    const deleteNotification = (id) => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-amber-900 text-xl">System Notifications</CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                  data-testid="button-mark-all-read"
                >
                  Mark All Read
                </Button>
                <Badge variant="outline" className="text-amber-700">
                  {notifications.filter(n => !n.read).length} unread
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg transition-all ${
                      notification.read 
                        ? 'border-gray-200 bg-gray-50/50' 
                        : 'border-amber-200 bg-amber-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Bell className={`h-4 w-4 ${
                            notification.priority === 'high' ? 'text-red-600' :
                            notification.priority === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <p className="font-medium text-amber-900">{notification.title}</p>
                          {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                        <p className="text-sm text-amber-700 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {notification.priority}
                          </Badge>
                          <span className="text-xs text-amber-600">{notification.time}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button 
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            data-testid={`button-mark-read-${notification.id}`}
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button 
                          onClick={() => deleteNotification(notification.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-${notification.id}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-900">System Alerts</p>
                    <p className="text-sm text-amber-600">Get notified about system issues</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-900">Order Notifications</p>
                    <p className="text-sm text-amber-600">New orders and status updates</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-900">Driver Applications</p>
                    <p className="text-sm text-amber-600">New driver registrations</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const OperationsContent = () => {
    const [serviceAreas, setServiceAreas] = useState([
      { id: 1, name: 'Downtown', status: 'active', drivers: 8, coverage: '95%', avgDeliveryTime: '32 min' },
      { id: 2, name: 'Midtown', status: 'active', drivers: 6, coverage: '87%', avgDeliveryTime: '28 min' },
      { id: 3, name: 'Suburbs North', status: 'limited', drivers: 3, coverage: '65%', avgDeliveryTime: '45 min' },
      { id: 4, name: 'Industrial Area', status: 'inactive', drivers: 0, coverage: '0%', avgDeliveryTime: 'N/A' }
    ]);

    const [shifts, setShifts] = useState([
      { id: 1, name: 'Morning Rush', time: '7:00-11:00 AM', driversNeeded: 12, driversAssigned: 10, status: 'understaffed' },
      { id: 2, name: 'Midday', time: '11:00 AM-3:00 PM', driversNeeded: 8, driversAssigned: 8, status: 'fully_staffed' },
      { id: 3, name: 'Evening Peak', time: '3:00-7:00 PM', driversNeeded: 15, driversAssigned: 13, status: 'understaffed' },
      { id: 4, name: 'Night', time: '7:00-11:00 PM', driversNeeded: 6, driversAssigned: 7, status: 'overstaffed' }
    ]);

    const toggleServiceArea = (id) => {
      setServiceAreas(prev => prev.map(area => 
        area.id === id 
          ? { 
              ...area, 
              status: area.status === 'active' ? 'inactive' : area.status === 'inactive' ? 'active' : 'limited'
            }
          : area
      ));
    };

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {/* Operations Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">{serviceAreas.filter(a => a.status === 'active').length}</p>
                  <p className="text-sm text-amber-600">Active Areas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">{serviceAreas.reduce((sum, a) => sum + a.drivers, 0)}</p>
                  <p className="text-sm text-amber-600">Total Coverage</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-700">{shifts.reduce((sum, s) => sum + s.driversNeeded, 0)}</p>
                  <p className="text-sm text-amber-600">Drivers Needed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-700">{shifts.filter(s => s.status === 'understaffed').length}</p>
                  <p className="text-sm text-amber-600">Understaffed Shifts</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Areas Management */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Service Area Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceAreas.map(area => (
                  <div key={area.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-amber-900">{area.name}</p>
                          <Badge className={
                            area.status === 'active' ? 'bg-green-100 text-green-800' :
                            area.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {area.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-amber-600">Active Drivers</p>
                            <p className="font-bold text-amber-900">{area.drivers}</p>
                          </div>
                          <div>
                            <p className="text-amber-600">Coverage</p>
                            <p className="font-bold text-amber-900">{area.coverage}</p>
                          </div>
                          <div>
                            <p className="text-amber-600">Avg Delivery Time</p>
                            <p className="font-bold text-amber-900">{area.avgDeliveryTime}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleServiceArea(area.id)}
                          variant="outline"
                          size="sm"
                          data-testid={`button-toggle-area-${area.id}`}
                        >
                          {area.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit Coverage
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Capacity Planning */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Capacity Planning - Driver Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shifts.map(shift => (
                  <div key={shift.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-amber-900">{shift.name}</p>
                          <Badge className={
                            shift.status === 'fully_staffed' ? 'bg-green-100 text-green-800' :
                            shift.status === 'understaffed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {shift.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-amber-600">{shift.time}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <p className="text-amber-600">Needed: {shift.driversNeeded}</p>
                          </div>
                          <div>
                            <p className="text-amber-600">Assigned: {shift.driversAssigned}</p>
                          </div>
                          <div>
                            <p className={`font-medium ${
                              shift.driversAssigned >= shift.driversNeeded ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {shift.driversAssigned >= shift.driversNeeded 
                                ? `+${shift.driversAssigned - shift.driversNeeded}` 
                                : `${shift.driversAssigned - shift.driversNeeded}`
                              } drivers
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Adjust Staff
                        </Button>
                        <Button variant="outline" size="sm">
                          View Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Communication Hub */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Real-Time Communication Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <h4 className="font-medium text-amber-900 mb-2">Driver Broadcasts</h4>
                  <p className="text-sm text-amber-600 mb-3">Send messages to all active drivers</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Broadcast message..." 
                      className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm"
                    />
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Send
                    </Button>
                  </div>
                </div>
                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <h4 className="font-medium text-amber-900 mb-2">Customer Updates</h4>
                  <p className="text-sm text-amber-600 mb-3">Send service notifications</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Customer notification..." 
                      className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm"
                    />
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Notify
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const EmployeesContent = () => {
    const [employees, setEmployees] = useState([
      { id: 1, name: 'Sarah Mitchell', role: 'Customer Support Manager', status: 'active', lastLogin: '2 hours ago', permissions: ['support', 'chat', 'tickets'] },
      { id: 2, name: 'Mike Rodriguez', role: 'Operations Supervisor', status: 'active', lastLogin: '4 hours ago', permissions: ['drivers', 'routes', 'quality'] },
      { id: 3, name: 'Lisa Chen', role: 'Financial Analyst', status: 'active', lastLogin: '1 hour ago', permissions: ['payouts', 'reports', 'analytics'] },
      { id: 4, name: 'David Wilson', role: 'IT Administrator', status: 'offline', lastLogin: '1 day ago', permissions: ['all'] }
    ]);

    const toggleEmployeeStatus = (id) => {
      setEmployees(prev => prev.map(emp => 
        emp.id === id 
          ? { ...emp, status: emp.status === 'active' ? 'offline' : 'active' }
          : emp
      ));
    };

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-amber-900 text-xl">Employee Management</CardTitle>
              <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-add-employee">
                <UserCheck className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map(employee => (
                  <div key={employee.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-amber-900">{employee.name}</p>
                          <Badge className={employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {employee.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-amber-700 mb-1">{employee.role}</p>
                        <p className="text-xs text-amber-600">Last login: {employee.lastLogin}</p>
                        <div className="mt-2">
                          <p className="text-xs text-amber-500 mb-1">Permissions:</p>
                          <div className="flex flex-wrap gap-1">
                            {employee.permissions.map((permission, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleEmployeeStatus(employee.id)}
                          variant="outline"
                          size="sm"
                          className={employee.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}
                          data-testid={`button-toggle-employee-${employee.id}`}
                        >
                          {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-edit-employee-${employee.id}`}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Employee Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">{employees.filter(e => e.status === 'active').length}</p>
                  <p className="text-sm text-amber-600">Active Employees</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-700">{employees.filter(e => e.status === 'offline').length}</p>
                  <p className="text-sm text-amber-600">Offline</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">{employees.length}</p>
                  <p className="text-sm text-amber-600">Total Staff</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-700">4</p>
                  <p className="text-sm text-amber-600">Departments</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Access Control */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-xl">Access Control Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-900">Customer Support Access</p>
                    <p className="text-sm text-amber-600">View tickets, chat, and customer data</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-900">Financial Data Access</p>
                    <p className="text-sm text-amber-600">View payouts, reports, and analytics</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-900">Driver Management Access</p>
                    <p className="text-sm text-amber-600">Manage drivers, routes, and operations</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const PayoutsManagementContent = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [payoutData, setPayoutData] = useState(() => {
      // Generate realistic payout data using faker
      return Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        driverName: faker.person.fullName(),
        driverId: `DRV${String(i + 1).padStart(3, '0')}`,
        totalEarnings: faker.number.int({ min: 800, max: 3500 }),
        platformFees: faker.number.int({ min: 40, max: 175 }), // 5% commission
        netPayoutAmount: 0, // Calculated below
        paymentMethod: faker.helpers.arrayElement([
          'Bank Transfer', 'PayPal', 'Stripe Connect', 'Cash Card', 'Check'
        ]),
        payoutDate: faker.date.recent({ days: 7 }),
        status: faker.helpers.arrayElement([
          'Scheduled', 'Processing', 'Completed', 'Failed', 'Pending'
        ]),
        instantPayAvailable: faker.datatype.boolean(),
        lastPayout: faker.date.recent({ days: 30 }),
        weeklySchedule: faker.helpers.arrayElement(['Monday', 'Friday', 'Bi-weekly']),
        deliveriesCompleted: faker.number.int({ min: 15, max: 85 }),
        averageRating: faker.number.float({ min: 4.2, max: 5.0, multipleOf: 0.1 }),
        joinDate: faker.date.past({ years: 2 })
      })).map(item => ({
        ...item,
        netPayoutAmount: item.totalEarnings - item.platformFees
      }));
    });

    const regeneratePayoutData = () => {
      const newData = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        driverName: faker.person.fullName(),
        driverId: `DRV${String(i + 1).padStart(3, '0')}`,
        totalEarnings: faker.number.int({ min: 800, max: 3500 }),
        platformFees: faker.number.int({ min: 40, max: 175 }),
        netPayoutAmount: 0,
        paymentMethod: faker.helpers.arrayElement([
          'Bank Transfer', 'PayPal', 'Stripe Connect', 'Cash Card', 'Check'
        ]),
        payoutDate: faker.date.recent({ days: 7 }),
        status: faker.helpers.arrayElement([
          'Scheduled', 'Processing', 'Completed', 'Failed', 'Pending'
        ]),
        instantPayAvailable: faker.datatype.boolean(),
        lastPayout: faker.date.recent({ days: 30 }),
        weeklySchedule: faker.helpers.arrayElement(['Monday', 'Friday', 'Bi-weekly']),
        deliveriesCompleted: faker.number.int({ min: 15, max: 85 }),
        averageRating: faker.number.float({ min: 4.2, max: 5.0, multipleOf: 0.1 }),
        joinDate: faker.date.past({ years: 2 })
      })).map(item => ({
        ...item,
        netPayoutAmount: item.totalEarnings - item.platformFees
      }));
      setPayoutData(newData);
      toast({
        title: "Payout Data Refreshed",
        description: "Generated new sample payout data with updated driver information",
      });
    };

    const handleBulkPayouts = async () => {
      setIsProcessing(true);
      setProcessingStatus('Processing bulk payouts...');
      try {
        const response = await fetch('/api/admin/bulk-payouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            driverIds: ['driver_1', 'driver_2', 'driver_3'],
            payoutType: 'weekly' 
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setProcessingStatus(`✅ Processed ${data.successfulPayouts} payouts totaling $${data.totalAmount.toFixed(2)}`);
          setTimeout(() => setProcessingStatus(''), 4000);
        } else {
          setProcessingStatus('❌ Failed to process bulk payouts');
        }
      } catch (error) {
        setProcessingStatus('❌ Error processing bulk payouts');
      }
      setIsProcessing(false);
    };

    const handleRefreshData = async () => {
      setIsProcessing(true);
      setProcessingStatus('Refreshing payout data...');
      try {
        // Simulate data refresh
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProcessingStatus('✅ Payout data refreshed');
        setTimeout(() => setProcessingStatus(''), 2000);
      } catch (error) {
        setProcessingStatus('❌ Error refreshing data');
      }
      setIsProcessing(false);
    };



    return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      {navigationHistory.length > 1 && (
        <div className="mb-4">
          <Button 
            onClick={goBack}
            variant="outline"
            className="border-amber-200 hover:bg-amber-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
          </Button>
        </div>
      )}

      {/* Status Display */}
      {processingStatus && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm font-medium">{processingStatus}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Payout Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Total Payouts Today</p>
                  <p className="text-2xl font-bold text-amber-900">${(Math.random() * 500 + 200).toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Pending Payouts</p>
                  <p className="text-2xl font-bold text-amber-900">{Math.floor(Math.random() * 15 + 5)}</p>
                </div>
                <Users className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Instant Fees Collected</p>
                  <p className="text-2xl font-bold text-amber-900">${(Math.random() * 25 + 5).toFixed(2)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Weekly Payouts</p>
                  <p className="text-2xl font-bold text-amber-900">{Math.floor(Math.random() * 25 + 10)}</p>
                  <p className="text-xs text-green-600">No fees</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout Management */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-amber-900 text-xl">Driver Payout Management</CardTitle>
            <div className="flex gap-2">
              <Button 
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={regeneratePayoutData}
                data-testid="button-regenerate-payout-data"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Data
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                onClick={handleBulkPayouts}
                disabled={isProcessing}
                data-testid="button-bulk-payouts"
              >
                Process Bulk Payouts
              </Button>

            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">Fee Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Instant Payouts:</strong> $0.50 transaction fee
                    <br />
                    <span className="text-amber-700">Processed immediately via Stripe</span>
                  </div>
                  <div>
                    <strong>Weekly Payouts:</strong> No fees
                    <br />
                    <span className="text-amber-700">Processed every Sunday at midnight</span>
                  </div>
                </div>
              </div>

              {/* Driver Payout Table */}
              <div className="mt-6">
                <h4 className="font-medium text-amber-900 mb-4">Driver Payout Overview</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-200">
                        <th className="text-left p-3 text-amber-900 font-medium">Driver</th>
                        <th className="text-left p-3 text-amber-900 font-medium">ID</th>
                        <th className="text-left p-3 text-amber-900 font-medium">Earnings</th>
                        <th className="text-left p-3 text-amber-900 font-medium">Fees</th>
                        <th className="text-left p-3 text-amber-900 font-medium">Net Payout</th>
                        <th className="text-left p-3 text-amber-900 font-medium">Method</th>
                        <th className="text-left p-3 text-amber-900 font-medium">Status</th>
                        <th className="text-left p-3 text-amber-900 font-medium">Instant Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutData.slice(0, 12).map((driver) => (
                        <tr key={driver.id} className="border-b border-amber-100 hover:bg-amber-50/30">
                          <td className="p-3 text-amber-900 font-medium">{driver.driverName}</td>
                          <td className="p-3 text-amber-600 font-mono text-xs">{driver.driverId}</td>
                          <td className="p-3 text-amber-900">${driver.totalEarnings.toLocaleString()}</td>
                          <td className="p-3 text-amber-600">${driver.platformFees}</td>
                          <td className="p-3 text-amber-900 font-bold">${driver.netPayoutAmount.toLocaleString()}</td>
                          <td className="p-3 text-amber-600 text-xs">{driver.paymentMethod}</td>
                          <td className="p-3">
                            <Badge className={
                              driver.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              driver.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                              driver.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              driver.status === 'Failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-600'
                            }>
                              {driver.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={driver.instantPayAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                              {driver.instantPayAvailable ? 'Available ($0.50)' : 'Weekly Only'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-amber-600">
                      Showing {Math.min(12, payoutData.length)} of {payoutData.length} drivers
                      • {payoutData.filter(d => d.instantPayAvailable).length} eligible for instant pay
                      • ${payoutData.reduce((sum, d) => sum + d.netPayoutAmount, 0).toLocaleString()} total pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    );
  };

  const TaxReportsContent = () => {
    const [taxYear, setTaxYear] = useState(new Date().getFullYear().toString());
    const [quarter, setQuarter] = useState('');
    const [format, setFormat] = useState('csv');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('');
    const [taxReportData, setTaxReportData] = useState(() => {
      // Generate realistic tax report data using faker
      return Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        driverName: faker.person.fullName(),
        driverId: `DRV${String(i + 1).padStart(3, '0')}`,
        grossEarnings: faker.number.int({ min: 15000, max: 45000 }),
        platformFees: faker.number.int({ min: 750, max: 2250 }),
        netTaxableIncome: 0, // Calculated below
        federalWithheld: faker.number.int({ min: 0, max: 500 }),
        stateWithheld: faker.number.int({ min: 0, max: 300 }),
        q1Earnings: faker.number.int({ min: 3000, max: 12000 }),
        q2Earnings: faker.number.int({ min: 3000, max: 12000 }),
        q3Earnings: faker.number.int({ min: 3000, max: 12000 }),
        q4Earnings: faker.number.int({ min: 3000, max: 12000 }),
        status: faker.helpers.arrayElement(['Filed', 'Pending', 'Draft', 'Processing']),
        lastUpdated: faker.date.recent({ days: 30 }),
        paymentMethod: faker.helpers.arrayElement(['Bank Transfer', 'PayPal', 'Stripe', 'Check']),
        ssn: `XXX-XX-${faker.number.int({ min: 1000, max: 9999 })}` // Masked SSN for privacy
      })).map(item => ({
        ...item,
        netTaxableIncome: item.grossEarnings - item.platformFees
      }));
    });

    const regenerateTaxData = () => {
      const newData = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        driverName: faker.person.fullName(),
        driverId: `DRV${String(i + 1).padStart(3, '0')}`,
        grossEarnings: faker.number.int({ min: 15000, max: 45000 }),
        platformFees: faker.number.int({ min: 750, max: 2250 }),
        netTaxableIncome: 0,
        federalWithheld: faker.number.int({ min: 0, max: 500 }),
        stateWithheld: faker.number.int({ min: 0, max: 300 }),
        q1Earnings: faker.number.int({ min: 3000, max: 12000 }),
        q2Earnings: faker.number.int({ min: 3000, max: 12000 }),
        q3Earnings: faker.number.int({ min: 3000, max: 12000 }),
        q4Earnings: faker.number.int({ min: 3000, max: 12000 }),
        status: faker.helpers.arrayElement(['Filed', 'Pending', 'Draft', 'Processing']),
        lastUpdated: faker.date.recent({ days: 30 }),
        paymentMethod: faker.helpers.arrayElement(['Bank Transfer', 'PayPal', 'Stripe', 'Check']),
        ssn: `XXX-XX-${faker.number.int({ min: 1000, max: 9999 })}`
      })).map(item => ({
        ...item,
        netTaxableIncome: item.grossEarnings - item.platformFees
      }));
      setTaxReportData(newData);
      toast({
        title: "Tax Data Refreshed",
        description: "Generated new sample tax report data with updated driver information",
      });
    };

    // Function to convert data to CSV format
    const convertToCSV = (data: any[], headers: string[]) => {
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(','))
      ].join('\n');
      return csvContent;
    };

    // Function to trigger download
    const downloadFile = (content: string, filename: string, type: string = 'text/csv') => {
      const blob = new Blob([content], { type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    };

    const handleGenerateTaxReport = async () => {
      setIsGenerating(true);
      setGenerationStatus('Generating tax report...');
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate 1099-NEC forms with current tax data
        const taxData = taxReportData.map(driver => ({
          driver_name: driver.driverName,
          driver_id: driver.driverId,
          gross_earnings: `$${driver.grossEarnings.toLocaleString()}`,
          platform_fees: `$${driver.platformFees.toLocaleString()}`,
          net_taxable_income: `$${driver.netTaxableIncome.toLocaleString()}`,
          federal_tax_withheld: `$${driver.federalWithheld}`,
          state_tax_withheld: `$${driver.stateWithheld}`,
          quarter_1: `$${driver.q1Earnings.toLocaleString()}`,
          quarter_2: `$${driver.q2Earnings.toLocaleString()}`,
          quarter_3: `$${driver.q3Earnings.toLocaleString()}`,
          quarter_4: `$${driver.q4Earnings.toLocaleString()}`,
          ssn_masked: driver.ssn,
          status: driver.status,
          payment_method: driver.paymentMethod,
          last_updated: driver.lastUpdated.toLocaleDateString(),
          form_1099_required: driver.netTaxableIncome >= 600 ? 'Yes' : 'No'
        }));

        const headers = [
          'driver_name', 'driver_id', 'gross_earnings', 'platform_fees', 'net_taxable_income',
          'federal_tax_withheld', 'state_tax_withheld', 'quarter_1', 'quarter_2', 'quarter_3', 
          'quarter_4', 'ssn_masked', 'status', 'payment_method', 'last_updated', 'form_1099_required'
        ];
        
        const quarterText = quarter ? `_Q${quarter}` : '';
        const filename = `tax_report_${taxYear}${quarterText}_${new Date().toISOString().split('T')[0]}.csv`;
        
        const csvContent = convertToCSV(taxData, headers);
        downloadFile(csvContent, filename);
        
        setGenerationStatus(`✅ Tax report for ${taxYear}${quarterText} downloaded successfully`);
        setTimeout(() => setGenerationStatus(''), 3000);
      } catch (error) {
        setGenerationStatus('❌ Error generating tax report');
        setTimeout(() => setGenerationStatus(''), 3000);
      }
      setIsGenerating(false);
    };

    const handleGenerate1099Forms = async () => {
      setIsGenerating(true);
      setGenerationStatus('Generating 1099 forms...');
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate 1099-NEC data for each driver
        const form1099Data = [
          { 
            form_type: '1099-NEC',
            tax_year: taxYear,
            payer_name: 'ReturnIt Logistics LLC',
            payer_tin: '12-3456789',
            payer_address: '123 Business Ave, City, State 12345',
            recipient_name: 'John Smith',
            recipient_tin: '123-45-6789',
            recipient_address: '456 Driver St, City, State 12345',
            nonemployee_compensation: '$3,247.50',
            federal_income_tax: '$0.00',
            form_generated_date: new Date().toISOString().split('T')[0]
          },
          { 
            form_type: '1099-NEC',
            tax_year: taxYear,
            payer_name: 'ReturnIt Logistics LLC',
            payer_tin: '12-3456789',
            payer_address: '123 Business Ave, City, State 12345',
            recipient_name: 'Sarah Wilson',
            recipient_tin: '987-65-4321',
            recipient_address: '789 Route Dr, City, State 12345',
            nonemployee_compensation: '$2,178.30',
            federal_income_tax: '$0.00',
            form_generated_date: new Date().toISOString().split('T')[0]
          },
          { 
            form_type: '1099-NEC',
            tax_year: taxYear,
            payer_name: 'ReturnIt Logistics LLC',
            payer_tin: '12-3456789',
            payer_address: '123 Business Ave, City, State 12345',
            recipient_name: 'Mike Chen',
            recipient_tin: '456-78-9123',
            recipient_address: '321 Delivery Ln, City, State 12345',
            nonemployee_compensation: '$1,798.60',
            federal_income_tax: '$0.00',
            form_generated_date: new Date().toISOString().split('T')[0]
          }
        ];

        const headers = [
          'form_type', 'tax_year', 'payer_name', 'payer_tin', 'payer_address',
          'recipient_name', 'recipient_tin', 'recipient_address', 
          'nonemployee_compensation', 'federal_income_tax', 'form_generated_date'
        ];
        
        const filename = `1099_forms_${taxYear}_${new Date().toISOString().split('T')[0]}.csv`;
        
        const csvContent = convertToCSV(form1099Data, headers);
        downloadFile(csvContent, filename);
        
        setGenerationStatus(`✅ 1099-NEC forms for ${taxYear} downloaded successfully`);
        setTimeout(() => setGenerationStatus(''), 3000);
      } catch (error) {
        setGenerationStatus('❌ Error generating 1099 forms');
        setTimeout(() => setGenerationStatus(''), 3000);
      }
      setIsGenerating(false);
    };

    const handleExportAllData = async () => {
      setIsGenerating(true);
      setGenerationStatus('Exporting comprehensive tax data...');
      try {
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        // Generate comprehensive export with all tax-related data
        const comprehensiveData = [
          {
            export_type: 'Driver Earnings Summary',
            driver_name: 'John Smith',
            driver_id: 'DRV001',
            total_trips: 247,
            gross_earnings: '$3,247.50',
            platform_fees: '$162.38',
            net_earnings: '$3,085.12',
            instant_payouts: 45,
            instant_payout_fees: '$22.50',
            tax_year: taxYear,
            requires_1099: 'Yes'
          },
          {
            export_type: 'Platform Revenue Summary',
            total_gross_revenue: '$89,247.30',
            driver_payouts: '$62,473.11',
            platform_fees: '$26,774.19',
            instant_payout_fees: '$1,234.56',
            processing_fees: '$892.47',
            net_platform_revenue: '$24,647.07',
            tax_year: taxYear,
            total_1099_forms: 23
          },
          {
            export_type: 'Payment Processing Summary',
            total_transactions: 1847,
            successful_payments: 1839,
            failed_payments: 8,
            refunds_processed: 12,
            chargeback_fees: '$45.00',
            stripe_fees: '$2,677.42',
            tax_year: taxYear
          }
        ];

        const headers = Object.keys(comprehensiveData[0]);
        const filename = `comprehensive_tax_export_${taxYear}_${new Date().toISOString().split('T')[0]}.csv`;
        
        const csvContent = convertToCSV(comprehensiveData, headers);
        downloadFile(csvContent, filename);
        
        setGenerationStatus(`✅ Comprehensive tax data for ${taxYear} exported successfully`);
        setTimeout(() => setGenerationStatus(''), 3000);
      } catch (error) {
        setGenerationStatus('❌ Error exporting tax data');
        setTimeout(() => setGenerationStatus(''), 3000);
      }
      setIsGenerating(false);
    };

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        {navigationHistory.length > 1 && (
          <div className="mb-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="border-amber-200 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {navigationHistory[navigationHistory.length - 1] === 'overview' ? 'Dashboard' : navigationHistory[navigationHistory.length - 1].replace('-', ' ')}
            </Button>
          </div>
        )}

        {/* Status Display */}
        {generationStatus && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">{generationStatus}</p>
          </div>
        )}

        <div className="space-y-6">
        {/* Tax Year Selection */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900 text-xl">Tax Reports & 1099 Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-amber-900">Tax Year</label>
                <select 
                  className="w-full mt-1 p-2 border border-amber-200 rounded-md"
                  value={taxYear}
                  onChange={(e) => setTaxYear(e.target.value)}
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-amber-900">Quarter (Optional)</label>
                <select 
                  className="w-full mt-1 p-2 border border-amber-200 rounded-md"
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                >
                  <option value="">All Year</option>
                  <option value="1">Q1 (Jan-Mar)</option>
                  <option value="2">Q2 (Apr-Jun)</option>
                  <option value="3">Q3 (Jul-Sep)</option>
                  <option value="4">Q4 (Oct-Dec)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-amber-900">Export Format</label>
                <select 
                  className="w-full mt-1 p-2 border border-amber-200 rounded-md"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="csv">CSV File</option>
                  <option value="xlsx">Excel File</option>
                  <option value="pdf">PDF Report</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Drivers Requiring 1099</p>
                  <p className="text-2xl font-bold text-amber-900">{Math.floor(Math.random() * 15 + 8)}</p>
                  <p className="text-xs text-amber-700">$600+ earnings</p>
                </div>
                <Users className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Total Contractor Payments</p>
                  <p className="text-2xl font-bold text-amber-900">${(Math.random() * 50000 + 25000).toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Forms Generated</p>
                  <p className="text-2xl font-bold text-amber-900">{Math.floor(Math.random() * 20 + 5)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Tax Year</p>
                  <p className="text-2xl font-bold text-amber-900">2025</p>
                  <p className="text-xs text-amber-700">Current</p>
                </div>
                <Badge className="bg-amber-100 text-amber-800">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900 text-xl">Tax Report Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-auto p-6 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center space-y-2 disabled:opacity-50"
                onClick={handleGenerateTaxReport}
                disabled={isGenerating}
                data-testid="button-generate-tax-report"
              >
                <BarChart3 className="h-8 w-8" />
                <span>Generate Tax Report</span>
                <span className="text-xs opacity-80">Download comprehensive report</span>
              </Button>
              
              <Button 
                className="h-auto p-6 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center space-y-2 disabled:opacity-50"
                onClick={handleGenerate1099Forms}
                disabled={isGenerating}
                data-testid="button-generate-1099-forms"
              >
                <CheckCircle className="h-8 w-8" />
                <span>Generate 1099 Forms</span>
                <span className="text-xs opacity-80">For drivers over $600</span>
              </Button>
              
              <Button 
                className="h-auto p-6 bg-amber-600 hover:bg-amber-700 text-white flex flex-col items-center space-y-2"
                onClick={regenerateTaxData}
                data-testid="button-regenerate-tax-data"
              >
                <RefreshCw className="h-8 w-8" />
                <span>Regenerate Data</span>
                <span className="text-xs opacity-80">Refresh sample data</span>
              </Button>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">IRS Requirements</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• 1099-NEC forms required for contractors earning $600+ per year</li>
                <li>• Forms must be sent to contractors by January 31st</li>
                <li>• Filed with IRS by February 28th (March 31st if filing electronically)</li>
                <li>• Keep records for at least 4 years after filing</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Driver Tax Summary Table */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900 text-xl">Driver Tax Summary</CardTitle>
            <p className="text-sm text-amber-600">Comprehensive tax information for all drivers</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-200">
                    <th className="text-left p-3 text-amber-900 font-medium">Driver</th>
                    <th className="text-left p-3 text-amber-900 font-medium">ID</th>
                    <th className="text-left p-3 text-amber-900 font-medium">Gross Earnings</th>
                    <th className="text-left p-3 text-amber-900 font-medium">Platform Fees</th>
                    <th className="text-left p-3 text-amber-900 font-medium">Net Taxable</th>
                    <th className="text-left p-3 text-amber-900 font-medium">1099 Required</th>
                    <th className="text-left p-3 text-amber-900 font-medium">Status</th>
                    <th className="text-left p-3 text-amber-900 font-medium">Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {taxReportData.slice(0, 10).map((driver) => (
                    <tr key={driver.id} className="border-b border-amber-100 hover:bg-amber-50/30">
                      <td className="p-3 text-amber-900 font-medium">{driver.driverName}</td>
                      <td className="p-3 text-amber-600 font-mono text-xs">{driver.driverId}</td>
                      <td className="p-3 text-amber-900">${driver.grossEarnings.toLocaleString()}</td>
                      <td className="p-3 text-amber-600">${driver.platformFees.toLocaleString()}</td>
                      <td className="p-3 text-amber-900 font-medium">${driver.netTaxableIncome.toLocaleString()}</td>
                      <td className="p-3">
                        <Badge className={driver.netTaxableIncome >= 600 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}>
                          {driver.netTaxableIncome >= 600 ? 'Required' : 'Not Required'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={
                          driver.status === 'Filed' ? 'bg-green-100 text-green-800' :
                          driver.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          driver.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-600'
                        }>
                          {driver.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-amber-600 text-xs">{driver.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-center">
                <p className="text-sm text-amber-600">
                  Showing {Math.min(10, taxReportData.length)} of {taxReportData.length} drivers
                  • {taxReportData.filter(d => d.netTaxableIncome >= 600).length} require 1099-NEC forms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  };

  const dashboardTabs = [
    {
      label: "Overview",
      href: "/admin-dashboard",
      current: true
    },
    {
      label: "Payment Tracking", 
      href: "/admin-payment-tracking",
      current: false
    },
    {
      label: "Analytics",
      href: "/enhanced-analytics-dashboard", 
      current: false
    }
  ];

  return (
    <AdminLayout pageTitle="Admin Dashboard" tabs={dashboardTabs}>
      <div className="relative z-10">
        {/* Section Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200 p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-amber-900 capitalize">
              {currentSection === 'overview' ? 'Dashboard Overview' : currentSection.replace('-', ' ')}
            </h1>
            <p className="text-amber-700 text-sm mt-1">
              {currentSection === 'overview' && 'Complete system overview and quick actions'}
              {currentSection === 'orders' && 'Manage live orders and delivery tracking'}
              {currentSection === 'drivers' && 'Monitor driver performance and status'}
              {currentSection === 'payments' && 'Track payments, payouts, and financial metrics'}
              {currentSection === 'analytics' && 'Advanced business intelligence and insights'}
              {currentSection === 'enhanced-analytics' && 'Real-time performance metrics and analytics'}
              {currentSection === 'routes' && 'Optimize delivery routes for efficiency'}
              {currentSection === 'quality' && 'Monitor service quality and performance standards'}
              {currentSection === 'incentives' && 'Manage driver bonuses and reward programs'}
              {currentSection === 'reporting' && 'Generate detailed financial and operational reports'}
              {currentSection === 'tickets' && 'Handle customer service requests and support tickets'}
              {currentSection === 'chat' && 'Live customer support and communication'}
              {currentSection === 'ratings' && 'Monitor customer feedback and service ratings'}
              {currentSection === 'notifications' && 'System alerts and notification management'}
              {currentSection === 'employees' && 'Staff management and access control'}
              {currentSection === 'payouts' && 'Driver payment management and bulk payouts'}
              {currentSection === 'tax-reports' && 'Tax reporting and 1099 form generation'}
            </p>
          </div>
        </div>

        {/* Render Section Content */}
        {renderSectionContent()}

        {/* Admin Support Modal */}
        <AdminSupportModal
          isOpen={showAdminSupportModal}
          onClose={() => setShowAdminSupportModal(false)}
          context={supportContext}
        />

        {/* Contact Support Button */}
        <ContactSupportButton 
          context={{ type: 'customer', id: 'ADMIN', name: 'Admin User' }}
        />

        {/* AI Assistant - Available for admin users */}
        {user?.isAdmin && (
          <AIAssistant 
            isMinimized={!showAIAssistant}
            onClose={() => setShowAIAssistant(!showAIAssistant)}
          />
        )}

        {/* Developer Console - Available for admin users */}
        {user?.isAdmin && (
          <DeveloperConsole 
            isMinimized={!showDeveloperConsole}
            onClose={() => setShowDeveloperConsole(!showDeveloperConsole)}
          />
        )}
      </div>
    </AdminLayout>
  );
}