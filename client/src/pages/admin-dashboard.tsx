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
      
      setDashboardStats({
        activeOrders: Math.floor(Math.random() * 20) + 15, // 15-35
        activeDrivers: Math.floor(Math.random() * 10) + 8, // 8-18
        todayRevenue: Math.floor(Math.random() * 300) + 300, // $300-600
        completionRate: Math.floor(Math.random() * 10) + 90, // 90-100%
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

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && currentSection === 'overview') {
      interval = setInterval(() => {
        updateDashboardStats();
      }, 30000); // Update every 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, currentSection]);

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

  const OrdersContent = () => (
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
          <CardTitle className="text-amber-900 text-xl">Live Orders Management</CardTitle>
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
              Refresh Orders
            </Button>
            <Badge variant="outline" className="text-green-600 border-green-200">
              Live Updates
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">Monitor and manage all active orders with real-time updates.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-900">{dashboardStats.activeOrders}</p>
                  <p className="text-sm text-amber-600">Active Orders</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {Math.floor(dashboardStats.activeOrders * 0.8)}
                  </p>
                  <p className="text-sm text-green-600">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {Math.floor(dashboardStats.activeOrders * 0.2)}
                  </p>
                  <p className="text-sm text-blue-600">Pending Assignment</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Live Orders Dashboard</p>
            <p className="text-sm text-amber-600">Real-time order tracking and management with automatic updates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DriversContent = () => (
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
          <CardTitle className="text-amber-900 text-xl">Driver Management</CardTitle>
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
              Update Driver Data
            </Button>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {dashboardStats.activeDrivers} Online
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">Monitor driver performance, status, and manage driver operations with live tracking.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">{dashboardStats.activeDrivers}</p>
                  <p className="text-sm text-green-600">Active Drivers</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {Math.floor(dashboardStats.activeDrivers * 0.75)}
                  </p>
                  <p className="text-sm text-blue-600">On Delivery</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-700">
                    {Math.floor(dashboardStats.activeDrivers * 0.2)}
                  </p>
                  <p className="text-sm text-yellow-600">Available</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-900">{dashboardStats.completionRate}%</p>
                  <p className="text-sm text-amber-600">Success Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center py-8">
            <Truck className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Driver Operations Center</p>
            <p className="text-sm text-amber-600">Driver monitoring, performance tracking, and management with real-time updates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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

    const generateReport = async (reportType: string) => {
      setIsGenerating(true);
      setReportStatus(`Generating ${reportType} report...`);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setReportStatus(`✅ ${reportType} report generated successfully`);
        setTimeout(() => setReportStatus(''), 3000);
      } catch (error) {
        setReportStatus(`❌ Failed to generate ${reportType} report`);
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
                className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                onClick={handleRefreshData}
                disabled={isProcessing}
                data-testid="button-refresh-payouts"
              >
                {isProcessing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh Data
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

              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-amber-900">Payout Management System</p>
                <p className="text-sm text-amber-600 mt-2">
                  Track all driver payments, fees, and manage bulk payouts efficiently
                </p>
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

    const handleGenerateTaxReport = async () => {
      setIsGenerating(true);
      setGenerationStatus('Generating tax report...');
      try {
        const response = await fetch('/api/admin/generate-tax-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taxYear, quarter, format })
        });
        
        if (response.ok) {
          const data = await response.json();
          setGenerationStatus(`✅ Tax report generated: ${data.report.fileName}`);
          // In a real app, you'd trigger a download here
          setTimeout(() => setGenerationStatus(''), 3000);
        } else {
          setGenerationStatus('❌ Failed to generate tax report');
        }
      } catch (error) {
        setGenerationStatus('❌ Error generating tax report');
      }
      setIsGenerating(false);
    };

    const handleGenerate1099Forms = async () => {
      setIsGenerating(true);
      setGenerationStatus('Generating 1099 forms...');
      try {
        const response = await fetch('/api/admin/generate-1099-forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taxYear })
        });
        
        if (response.ok) {
          const data = await response.json();
          setGenerationStatus(`✅ ${data.message}`);
          setTimeout(() => setGenerationStatus(''), 3000);
        } else {
          setGenerationStatus('❌ Failed to generate 1099 forms');
        }
      } catch (error) {
        setGenerationStatus('❌ Error generating 1099 forms');
      }
      setIsGenerating(false);
    };

    const handleExportAllData = async () => {
      setIsGenerating(true);
      setGenerationStatus('Exporting tax data...');
      try {
        const response = await fetch('/api/admin/export-tax-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taxYear, format })
        });
        
        if (response.ok) {
          const data = await response.json();
          setGenerationStatus(`✅ Export completed: ${data.export.fileName} (${data.export.fileSize})`);
          setTimeout(() => setGenerationStatus(''), 3000);
        } else {
          setGenerationStatus('❌ Failed to export tax data');
        }
      } catch (error) {
        setGenerationStatus('❌ Error exporting tax data');
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
                className="h-auto p-6 bg-amber-600 hover:bg-amber-700 text-white flex flex-col items-center space-y-2 disabled:opacity-50"
                onClick={handleExportAllData}
                disabled={isGenerating}
                data-testid="button-export-tax-data"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span>Export All Data</span>
                <span className="text-xs opacity-80">CSV/Excel export</span>
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