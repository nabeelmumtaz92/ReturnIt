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
  Terminal
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
  
  // State for various features
  const [showAdminSupportModal, setShowAdminSupportModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showDeveloperConsole, setShowDeveloperConsole] = useState(false);
  const [supportContext, setSupportContext] = useState<{type: 'driver' | 'customer', id: string, name: string} | null>(null);
  
  // Function to change sections
  const changeSection = (newSection: string) => {
    const url = new URL(window.location.href);
    if (newSection === 'overview') {
      url.searchParams.delete('section');
    } else {
      url.searchParams.set('section', newSection);
    }
    window.history.pushState({}, '', url.toString());
    // Force a re-render by reloading
    window.location.reload();
  };

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
      case 'overview':
      default:
        return <OverviewContent />;
    }
  };

  // Individual section components
  const OverviewContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Overview dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Active Orders</p>
                <p className="text-2xl font-bold text-amber-900">24</p>
              </div>
              <Package className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Active Drivers</p>
                <p className="text-2xl font-bold text-amber-900">12</p>
              </div>
              <Truck className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-amber-900">$486</p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Completion Rate</p>
                <p className="text-2xl font-bold text-amber-900">94%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          onClick={() => changeSection('orders')}
          className="h-auto p-6 bg-white/90 backdrop-blur-sm border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 flex flex-col items-center space-y-2"
          variant="outline"
        >
          <Package className="h-8 w-8" />
          <span>Manage Orders</span>
        </Button>
        
        <Button 
          onClick={() => changeSection('drivers')}
          className="h-auto p-6 bg-white/90 backdrop-blur-sm border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 flex flex-col items-center space-y-2"
          variant="outline"
        >
          <Truck className="h-8 w-8" />
          <span>Driver Management</span>
        </Button>
        
        <Button 
          onClick={() => changeSection('analytics')}
          className="h-auto p-6 bg-white/90 backdrop-blur-sm border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 flex flex-col items-center space-y-2"
          variant="outline"
        >
          <BarChart3 className="h-8 w-8" />
          <span>Analytics</span>
        </Button>
        
        <Button 
          onClick={() => changeSection('chat')}
          className="h-auto p-6 bg-white/90 backdrop-blur-sm border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 flex flex-col items-center space-y-2"
          variant="outline"
        >
          <MessageCircle className="h-8 w-8" />
          <span>Support Chat</span>
        </Button>
      </div>
    </div>
  );

  const OrdersContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Live Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">Monitor and manage all active orders in real-time.</p>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Live Orders Dashboard</p>
            <p className="text-sm text-amber-600">Real-time order tracking and management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DriversContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Driver Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">Monitor driver performance, status, and manage driver operations.</p>
          <div className="text-center py-8">
            <Truck className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Driver Operations Center</p>
            <p className="text-sm text-amber-600">Driver monitoring, performance tracking, and management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PaymentsContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Payment Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">Monitor payments, payouts, and financial metrics.</p>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium text-amber-900">Payment System</p>
            <p className="text-sm text-amber-600">Track payments and manage driver payouts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Business Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">Advanced business analytics and insights.</p>
          <AnalyticsDashboard />
        </CardContent>
      </Card>
    </div>
  );

  const EnhancedAnalyticsContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-xl">Enhanced Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">Real-time performance metrics and comprehensive analytics.</p>
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