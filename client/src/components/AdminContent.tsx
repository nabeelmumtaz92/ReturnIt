import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Package, Truck, DollarSign, Clock, Users, BarChart3, 
  MessageSquare, Settings, CheckCircle, Search, Eye, Edit, MapPin,
  Bell, Calendar, CreditCard, HeadphonesIcon, Target, Trophy, Shield
} from 'lucide-react';
// Import pages for content switching
const BusinessIntelligence = () => (
  <div className="text-center py-8">
    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-amber-400" />
    <p className="text-lg font-medium text-amber-900">Business Intelligence Dashboard</p>
    <p className="text-sm text-amber-600">Advanced analytics and insights</p>
  </div>
);

const PaymentTracking = () => (
  <div className="text-center py-8">
    <CreditCard className="h-12 w-12 mx-auto mb-4 text-amber-400" />
    <p className="text-lg font-medium text-amber-900">Payment Tracking System</p>
    <p className="text-sm text-amber-600">Monitor payments and driver payouts</p>
  </div>
);

const RealTimeTracking = () => (
  <div className="text-center py-8">
    <MapPin className="h-12 w-12 mx-auto mb-4 text-amber-400" />
    <p className="text-lg font-medium text-amber-900">Real-Time Tracking</p>
    <p className="text-sm text-amber-600">Live driver locations and order status</p>
  </div>
);

const CustomerSupport = () => (
  <div className="text-center py-8">
    <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 text-amber-400" />
    <p className="text-lg font-medium text-amber-900">Customer Support Center</p>
    <p className="text-sm text-amber-600">Manage tickets and customer communications</p>
  </div>
);

const Analytics = () => (
  <div className="text-center py-8">
    <Target className="h-12 w-12 mx-auto mb-4 text-amber-400" />
    <p className="text-lg font-medium text-amber-900">Enhanced Analytics</p>
    <p className="text-sm text-amber-600">Comprehensive business insights and reports</p>
  </div>
);

interface AdminContentProps {
  section?: string;
  splitView?: boolean;
  primarySection?: string;
  secondarySection?: string;
}

export function AdminContent({ section, splitView, primarySection, secondarySection }: AdminContentProps) {
  const [location, setLocation] = useLocation();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  // Back to main dashboard
  const handleBack = () => {
    setLocation('/admin-dashboard');
  };

  // Toggle split view for a section
  const toggleSplitView = (sectionName: string) => {
    if (selectedSections.includes(sectionName)) {
      setSelectedSections(selectedSections.filter(s => s !== sectionName));
    } else if (selectedSections.length < 2) {
      setSelectedSections([...selectedSections, sectionName]);
    } else {
      // Replace the first section if we already have 2
      setSelectedSections([selectedSections[1], sectionName]);
    }
  };

  // Main dashboard content (Live Orders)
  const renderMainDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white border-amber-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-xs sm:text-sm font-medium">Today's Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-900">47</p>
              </div>
              <Package className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 mt-2">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-amber-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-xs sm:text-sm font-medium">Active Drivers</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-900">28</p>
              </div>
              <Truck className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 mt-2">3 on break</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-amber-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-xs sm:text-sm font-medium">Revenue Today</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-900">$1,247</p>
              </div>
              <DollarSign className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 mt-2">+8% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-amber-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-xs sm:text-sm font-medium">Avg Pickup Time</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-900">14min</p>
              </div>
              <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 mt-2">-2min from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Orders Table */}
      <Card className="bg-white border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Live Orders Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-amber-600">
            <Package className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <p className="text-lg font-medium">Live Orders System</p>
            <p className="text-sm">Real-time order management and tracking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Driver Management Content
  const renderDriverManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-amber-900">Driver Management</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white border-amber-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <Truck className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="font-semibold text-amber-900 mb-2">Active Drivers</h3>
            <p className="text-2xl font-bold text-amber-900">28</p>
            <p className="text-sm text-amber-600">Currently online</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-amber-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <Users className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="font-semibold text-amber-900 mb-2">Total Drivers</h3>
            <p className="text-2xl font-bold text-amber-900">156</p>
            <p className="text-sm text-amber-600">Registered drivers</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-amber-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <Trophy className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="font-semibold text-amber-900 mb-2">Top Performer</h3>
            <p className="text-lg font-bold text-amber-900">John Smith</p>
            <p className="text-sm text-amber-600">47 deliveries today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render section content with optional split view controls
  const renderSectionContent = (sectionName: string, showHeader: boolean = true) => {
    const getSectionTitle = (name: string) => {
      const titles: Record<string, string> = {
        'driver-management': 'Driver Management',
        'business-intelligence': 'Business Intelligence', 
        'payment-tracking': 'Payment Tracking',
        'real-time-tracking': 'Real-Time Tracking',
        'customer-support': 'Customer Support',
        'analytics': 'Analytics Dashboard',
        'order-management': 'Order Management',
        'route-optimization': 'Route Optimization',
        'quality-assurance': 'Quality Assurance',
        'driver-incentives': 'Driver Incentives',
        'multi-city': 'Multi-City Management',
        'notifications': 'Notification Center',
        'admin-access': 'Admin Access Control',
        'settings': 'System Settings',
        'business-profile': 'Business Profile'
      };
      return titles[name] || name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getSectionComponent = (name: string) => {
      switch (name) {
        case 'driver-management':
          return renderDriverManagement();
        case 'business-intelligence':
          return <Card className="bg-white border-amber-200"><CardContent className="p-8"><BusinessIntelligence /></CardContent></Card>;
        case 'payment-tracking':
          return <Card className="bg-white border-amber-200"><CardContent className="p-8"><PaymentTracking /></CardContent></Card>;
        case 'real-time-tracking':
          return <Card className="bg-white border-amber-200"><CardContent className="p-8"><RealTimeTracking /></CardContent></Card>;
        case 'customer-support':
          return <Card className="bg-white border-amber-200"><CardContent className="p-8"><CustomerSupport /></CardContent></Card>;
        case 'analytics':
          return <Card className="bg-white border-amber-200"><CardContent className="p-8"><Analytics /></CardContent></Card>;
        default:
          return <Card className="bg-white border-amber-200"><CardContent className="p-8">
            <div className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto mb-4 text-amber-400" />
              <p className="text-lg font-medium text-amber-900">{getSectionTitle(name)}</p>
              <p className="text-sm text-amber-600">Section content coming soon</p>
            </div>
          </CardContent></Card>;
      }
    };

    return (
      <div className="h-full">
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900">{getSectionTitle(sectionName)}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSplitView(sectionName)}
              className="border-amber-300"
            >
              {selectedSections.includes(sectionName) ? 'Remove Split' : 'Add Split'}
            </Button>
          </div>
        )}
        {getSectionComponent(sectionName)}
      </div>
    );
  };

  // Content router based on section
  const renderContent = () => {
    // Split view mode
    if (selectedSections.length === 2) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-amber-900">Split View Mode</h1>
            <Button
              variant="outline"
              onClick={() => setSelectedSections([])}
              className="border-amber-300"
            >
              Exit Split View
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
            <div className="border border-amber-200 rounded-lg p-4 overflow-y-auto">
              {renderSectionContent(selectedSections[0], true)}
            </div>
            <div className="border border-amber-200 rounded-lg p-4 overflow-y-auto">
              {renderSectionContent(selectedSections[1], true)}
            </div>
          </div>
        </div>
      );
    }

    // Single section view
    if (section && section !== 'main') {
      return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-amber-900">
              {section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <Button
              variant="outline"
              onClick={() => toggleSplitView(section)}
              className="border-amber-300"
            >
              Add to Split View
            </Button>
          </div>
          {renderSectionContent(section, false)}
        </div>
      );
    }

    // Default main dashboard
    return renderMainDashboard();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {renderContent()}
    </div>
  );
}