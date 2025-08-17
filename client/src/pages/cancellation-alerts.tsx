import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, TrendingUp, TrendingDown, Bell, Settings,
  User, Calendar, BarChart3, Filter, Search, Mail, Phone,
  ExternalLink, Clock, MapPin, Package, Target
} from 'lucide-react';
import { ReturnItLogo } from '@/components/LogoIcon';
import { useToast } from '@/hooks/use-toast';

interface CancellationAlert {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalOrders: number;
  cancelledOrders: number;
  cancellationRate: number;
  lastCancellation: string;
  consecutiveCancellations: number;
  alertTriggered: string;
  status: 'active' | 'investigating' | 'resolved';
  assignedTo?: string;
  notes?: string;
  tier: 'high' | 'medium' | 'low';
}

interface CancellationSettings {
  thresholdPercentage: number;
  minimumOrders: number;
  timeWindowDays: number;
  consecutiveLimit: number;
  autoNotifyAdmin: boolean;
  emailNotifications: boolean;
}

export default function CancellationAlerts() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('alerts');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [settings, setSettings] = useState<CancellationSettings>({
    thresholdPercentage: 20,
    minimumOrders: 5,
    timeWindowDays: 30,
    consecutiveLimit: 3,
    autoNotifyAdmin: true,
    emailNotifications: true
  });

  // Sample cancellation alerts data
  const [alerts] = useState<CancellationAlert[]>([
    {
      id: 'alert001',
      customerId: 'cust001',
      customerName: 'Sarah Williams',
      customerEmail: 'sarah.w@email.com',
      customerPhone: '(555) 123-4567',
      totalOrders: 12,
      cancelledOrders: 5,
      cancellationRate: 41.7,
      lastCancellation: '2024-01-15T14:30:00Z',
      consecutiveCancellations: 3,
      alertTriggered: '2024-01-15T15:00:00Z',
      status: 'active',
      tier: 'high'
    },
    {
      id: 'alert002',
      customerId: 'cust002',
      customerName: 'Michael Chen',
      customerEmail: 'mchen@email.com',
      customerPhone: '(555) 234-5678',
      totalOrders: 8,
      cancelledOrders: 3,
      cancellationRate: 37.5,
      lastCancellation: '2024-01-14T10:15:00Z',
      consecutiveCancellations: 2,
      alertTriggered: '2024-01-14T10:30:00Z',
      status: 'investigating',
      assignedTo: 'Customer Service Team',
      tier: 'high'
    },
    {
      id: 'alert003',
      customerId: 'cust003',
      customerName: 'Emily Rodriguez',
      customerEmail: 'emily.rod@email.com',
      customerPhone: '(555) 345-6789',
      totalOrders: 15,
      cancelledOrders: 4,
      cancellationRate: 26.7,
      lastCancellation: '2024-01-13T16:45:00Z',
      consecutiveCancellations: 1,
      alertTriggered: '2024-01-13T17:00:00Z',
      status: 'resolved',
      assignedTo: 'Operations Manager',
      notes: 'Resolved - Customer had scheduling conflicts. Provided flexible pickup options.',
      tier: 'medium'
    },
    {
      id: 'alert004',
      customerId: 'cust004',
      customerName: 'David Johnson',
      customerEmail: 'djohnson@email.com',
      customerPhone: '(555) 456-7890',
      totalOrders: 10,
      cancelledOrders: 3,
      cancellationRate: 30.0,
      lastCancellation: '2024-01-12T13:20:00Z',
      consecutiveCancellations: 2,
      alertTriggered: '2024-01-12T13:35:00Z',
      status: 'active',
      tier: 'medium'
    }
  ]);

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesTier = filterTier === 'all' || alert.tier === filterTier;
    const matchesSearch = searchTerm === '' || 
      alert.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesTier && matchesSearch;
  });

  // Calculate summary statistics
  const summaryStats = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter(a => a.status === 'active').length,
    highPriorityAlerts: alerts.filter(a => a.tier === 'high').length,
    averageCancellationRate: alerts.reduce((sum, a) => sum + a.cancellationRate, 0) / alerts.length
  };

  // Handle alert status update
  const updateAlertStatus = async (alertId: string, newStatus: string, assignee?: string, notes?: string) => {
    try {
      // In real app, this would be an API call
      toast({
        title: "Alert Updated",
        description: `Alert status changed to ${newStatus}${assignee ? ` and assigned to ${assignee}` : ''}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alert status.",
        variant: "destructive",
      });
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      // In real app, this would be an API call
      toast({
        title: "Settings Saved",
        description: "Cancellation alert settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  // Render alert priority badge
  const getPriorityBadge = (tier: string) => {
    switch (tier) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-300">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Medium Priority</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Active</Badge>;
      case 'investigating':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Investigating</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Dashboard Overview
  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Active Alerts</p>
                <p className="text-3xl font-bold text-red-900">{summaryStats.activeAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">High Priority</p>
                <p className="text-3xl font-bold text-orange-900">{summaryStats.highPriorityAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Alerts</p>
                <p className="text-3xl font-bold text-blue-900">{summaryStats.totalAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Cancel Rate</p>
                <p className="text-3xl font-bold text-purple-900">{summaryStats.averageCancellationRate.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-amber-300 focus:border-amber-500"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 border-amber-300 focus:border-amber-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-40 border-amber-300 focus:border-amber-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className={`bg-white border transition-all hover:shadow-md ${
            alert.tier === 'high' ? 'border-red-200' : 
            alert.tier === 'medium' ? 'border-yellow-200' : 'border-green-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    alert.tier === 'high' ? 'bg-red-100 text-red-600' :
                    alert.tier === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">{alert.customerName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {alert.customerEmail}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {alert.customerPhone}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(alert.tier)}
                  {getStatusBadge(alert.status)}
                </div>
              </div>
              
              {/* Alert Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Cancellation Rate</p>
                  <p className={`text-xl font-bold ${
                    alert.cancellationRate >= 40 ? 'text-red-600' :
                    alert.cancellationRate >= 25 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {alert.cancellationRate.toFixed(1)}%
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{alert.totalOrders}</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-xl font-bold text-red-600">{alert.cancelledOrders}</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Consecutive</p>
                  <p className="text-xl font-bold text-orange-600">{alert.consecutiveCancellations}</p>
                </div>
              </div>
              
              {/* Alert Details */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                <div className="flex items-start justify-between">
                  <div className="text-sm text-amber-800">
                    <p><strong>Alert Triggered:</strong> {new Date(alert.alertTriggered).toLocaleString()}</p>
                    <p><strong>Last Cancellation:</strong> {new Date(alert.lastCancellation).toLocaleString()}</p>
                    {alert.assignedTo && <p><strong>Assigned To:</strong> {alert.assignedTo}</p>}
                    {alert.notes && <p><strong>Notes:</strong> {alert.notes}</p>}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      toast({
                        title: "Viewing Customer Profile",
                        description: `Opening profile for ${alert.customerName}...`,
                      });
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      toast({
                        title: "Contacting Customer",
                        description: `Initiating contact with ${alert.customerName}...`,
                      });
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => {
                      toast({
                        title: "Order History",
                        description: `Viewing order history for ${alert.customerName}...`,
                      });
                    }}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Orders
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  {alert.status === 'active' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => updateAlertStatus(alert.id, 'investigating', 'Customer Service Team')}
                      >
                        Start Investigation
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateAlertStatus(alert.id, 'resolved', 'System', 'Resolved via automated process')}
                      >
                        Mark Resolved
                      </Button>
                    </>
                  )}
                  
                  {alert.status === 'investigating' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateAlertStatus(alert.id, 'resolved', alert.assignedTo)}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredAlerts.length === 0 && (
        <Card className="bg-white border-gray-200">
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts Found</h3>
            <p className="text-gray-600">No cancellation alerts match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Settings Panel
  const SettingsPanel = () => (
    <div className="space-y-6">
      <Card className="bg-white border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">Alert Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="threshold" className="text-amber-800 font-medium">
                Cancellation Rate Threshold (%)
              </Label>
              <Input
                id="threshold"
                type="number"
                value={settings.thresholdPercentage}
                onChange={(e) => setSettings(prev => ({...prev, thresholdPercentage: parseInt(e.target.value) || 0}))}
                className="border-amber-300 focus:border-amber-500"
                min="1"
                max="100"
              />
              <p className="text-sm text-amber-600">
                Alert triggered when cancellation rate exceeds this percentage
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minOrders" className="text-amber-800 font-medium">
                Minimum Orders Required
              </Label>
              <Input
                id="minOrders"
                type="number"
                value={settings.minimumOrders}
                onChange={(e) => setSettings(prev => ({...prev, minimumOrders: parseInt(e.target.value) || 0}))}
                className="border-amber-300 focus:border-amber-500"
                min="1"
              />
              <p className="text-sm text-amber-600">
                Customer must have at least this many orders before alerts trigger
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeWindow" className="text-amber-800 font-medium">
                Time Window (Days)
              </Label>
              <Input
                id="timeWindow"
                type="number"
                value={settings.timeWindowDays}
                onChange={(e) => setSettings(prev => ({...prev, timeWindowDays: parseInt(e.target.value) || 0}))}
                className="border-amber-300 focus:border-amber-500"
                min="1"
              />
              <p className="text-sm text-amber-600">
                Consider orders within this time period for rate calculation
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="consecutive" className="text-amber-800 font-medium">
                Consecutive Cancellation Limit
              </Label>
              <Input
                id="consecutive"
                type="number"
                value={settings.consecutiveLimit}
                onChange={(e) => setSettings(prev => ({...prev, consecutiveLimit: parseInt(e.target.value) || 0}))}
                className="border-amber-300 focus:border-amber-500"
                min="1"
              />
              <p className="text-sm text-amber-600">
                Alert for consecutive cancellations above this number
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <input
              type="checkbox"
              id="autoNotify"
              checked={settings.autoNotifyAdmin}
              onChange={(e) => setSettings(prev => ({...prev, autoNotifyAdmin: e.target.checked}))}
              className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
            />
            <div className="flex-1">
              <Label htmlFor="autoNotify" className="text-amber-900 font-medium">
                Auto-notify Administrators
              </Label>
              <p className="text-sm text-amber-700">
                Automatically send notifications to admin users when new alerts are created
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings(prev => ({...prev, emailNotifications: e.target.checked}))}
              className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
            />
            <div className="flex-1">
              <Label htmlFor="emailNotifications" className="text-amber-900 font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-amber-700">
                Send email alerts to designated team members for high-priority cancellations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ReturnItLogo className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold text-amber-900">Cancellation Alert System</h1>
                <p className="text-amber-700">Monitor and manage high cancellation rate customers</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`px-3 py-1 ${
                summaryStats.activeAlerts > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                <AlertTriangle className="h-4 w-4 mr-1" />
                {summaryStats.activeAlerts} Active Alerts
              </Badge>
              <Badge className="bg-amber-100 text-amber-800 px-3 py-1">
                <Target className="h-4 w-4 mr-1" />
                {settings.thresholdPercentage}% Threshold
              </Badge>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-amber-200 mb-6">
          <div className="flex">
            {[
              { id: 'alerts', label: 'Alert Dashboard', icon: <Bell className="h-4 w-4" /> },
              { id: 'settings', label: 'Alert Settings', icon: <Settings className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 p-4 text-center border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'alerts' && <DashboardOverview />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}