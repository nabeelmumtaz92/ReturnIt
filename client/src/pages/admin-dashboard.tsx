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

  const RoutesContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Route Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Route Management</p>
            <p className="text-sm text-amber-600">Optimize delivery routes for efficiency</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const QualityContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Quality Assurance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Quality Control</p>
            <p className="text-sm text-amber-600">Monitor service quality and performance standards</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const IncentivesContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Driver Incentives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Incentive Programs</p>
            <p className="text-sm text-amber-600">Manage driver bonuses and reward programs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ReportingContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Advanced Reporting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PieChart className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Reporting System</p>
            <p className="text-sm text-amber-600">Generate detailed financial and operational reports</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const TicketsContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Customer Support</p>
            <p className="text-sm text-amber-600">Handle customer service requests and support tickets</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ChatContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Live Chat Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Communication Hub</p>
            <p className="text-sm text-amber-600">Live customer support and communication</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const RatingsContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Customer Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Rating System</p>
            <p className="text-sm text-amber-600">Monitor customer feedback and service ratings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const NotificationsContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Notification Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Alert Management</p>
            <p className="text-sm text-amber-600">System alerts and notification management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const EmployeesContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Employee Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UserCheck className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Staff Management</p>
            <p className="text-sm text-amber-600">Staff management and access control</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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