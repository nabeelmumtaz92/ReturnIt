import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { AdminNavigation } from '@/components/AdminNavigation';
import { 
  Bell, MessageSquare, Mail, Phone, Send, Settings, 
  Clock, CheckCircle, AlertCircle, Star, MapPin,
  User, Package, Truck, Calendar, Filter
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'sms' | 'email' | 'push' | 'call';
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  recipient: string;
  message: string;
  timestamp: Date;
  orderId?: string;
  automated: boolean;
  templateUsed?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'push';
  trigger: string;
  subject?: string;
  content: string;
  variables: string[];
  active: boolean;
}

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'sms',
      status: 'delivered',
      recipient: '+1-314-555-0123',
      message: 'Your driver Mike is 5 minutes away! Track live: returnit.online/track/RTN12345',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      orderId: 'RTN12345',
      automated: true,
      templateUsed: 'driver_approaching'
    },
    {
      id: '2',
      type: 'email',
      status: 'delivered',
      recipient: 'customer@example.com',
      message: 'Your return pickup has been completed successfully!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      orderId: 'RTN12344',
      automated: true,
      templateUsed: 'pickup_complete'
    },
    {
      id: '3',
      type: 'push',
      status: 'delivered',
      recipient: 'Driver App User #23',
      message: 'New pickup available nearby - $8.50 payout',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      automated: true,
      templateUsed: 'new_job_alert'
    },
    {
      id: '4',
      type: 'sms',
      status: 'failed',
      recipient: '+1-314-555-0456',
      message: 'Unable to complete pickup. Driver will retry in 30 minutes.',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      orderId: 'RTN12343',
      automated: false
    },
    {
      id: '5',
      type: 'email',
      status: 'sent',
      recipient: 'sarah.wilson@email.com',
      message: 'Thank you for using Return It! Please rate your experience.',
      timestamp: new Date(Date.now() - 120 * 60 * 1000),
      orderId: 'RTN12342',
      automated: true,
      templateUsed: 'review_request'
    }
  ]);

  const [templates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Driver Approaching',
      type: 'sms',
      trigger: 'driver_within_5_minutes',
      content: 'Your driver {{driverName}} is {{eta}} away! Track live: {{trackingUrl}}',
      variables: ['driverName', 'eta', 'trackingUrl'],
      active: true
    },
    {
      id: '2',
      name: 'Pickup Complete',
      type: 'email',
      trigger: 'pickup_completed',
      subject: 'Your return pickup is complete!',
      content: 'Hi {{customerName}}, your return pickup has been completed successfully. Tracking: {{trackingNumber}}',
      variables: ['customerName', 'trackingNumber'],
      active: true
    },
    {
      id: '3',
      name: 'New Job Alert',
      type: 'push',
      trigger: 'new_job_available',
      content: 'New pickup available {{distance}} away - ${{payout}} payout',
      variables: ['distance', 'payout'],
      active: true
    },
    {
      id: '4',
      name: 'Review Request',
      type: 'email',
      trigger: 'delivery_complete_24h',
      subject: 'How was your Return It experience?',
      content: 'Hi {{customerName}}, please take a moment to rate your recent return experience.',
      variables: ['customerName', 'orderId'],
      active: true
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'email': return <Mail className="h-4 w-4 text-green-500" />;
      case 'push': return <Bell className="h-4 w-4 text-purple-500" />;
      case 'call': return <Phone className="h-4 w-4 text-orange-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedType !== 'all' && notification.type !== selectedType) return false;
    if (selectedStatus !== 'all' && notification.status !== selectedStatus) return false;
    return true;
  });

  const stats = {
    totalSent: notifications.length,
    delivered: notifications.filter(n => n.status === 'delivered').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    deliveryRate: Math.round((notifications.filter(n => n.status === 'delivered').length / notifications.length) * 100)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent to-transparent py-8">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notification Center</h1>
            <p className="text-muted-foreground">Automated customer communications</p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4 mr-2" />
              Send Manual Message
            </Button>
            <Link href="/admin-dashboard">
              <Button variant="outline" className="border-border text-muted-foreground">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
                </div>
                <Send className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.deliveryRate}%</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Recent Activity</TabsTrigger>
            <TabsTrigger value="templates">Message Templates</TabsTrigger>
            <TabsTrigger value="compose">Compose Message</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                  </div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bell className="h-5 w-5" />
                  Recent Notifications ({filteredNotifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(notification.type)}
                          <div>
                            <p className="font-medium text-gray-900">{notification.recipient}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(notification.status)}
                          <Badge variant={
                            notification.status === 'delivered' ? 'default' :
                            notification.status === 'failed' ? 'destructive' : 'secondary'
                          }>
                            {notification.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>{notification.timestamp.toLocaleString()}</span>
                          {notification.orderId && (
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {notification.orderId}
                            </span>
                          )}
                          {notification.automated && (
                            <Badge variant="secondary" className="text-xs">
                              Automated
                            </Badge>
                          )}
                        </div>
                        {notification.templateUsed && (
                          <span className="text-xs text-blue-600">
                            Template: {notification.templateUsed}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="h-5 w-5" />
                  Message Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(template.type)}
                          <div>
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600">Trigger: {template.trigger}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={template.active} />
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                      {template.subject && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Subject: {template.subject}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mb-2">{template.content}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Variables:</span>
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Send className="h-5 w-5" />
                  Compose Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                    <Input placeholder="Phone number or email" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject (Email only)</label>
                  <Input placeholder="Message subject" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <Textarea 
                    placeholder="Type your message here..." 
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline">
                    Save as Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Send SMS updates to customers</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send email updates to customers</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Send push notifications to drivers</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Review Requests</p>
                      <p className="text-sm text-gray-600">Automatically request reviews after delivery</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Delivery Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMS Retry Attempts
                    </label>
                    <Select defaultValue="3">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 attempt</SelectItem>
                        <SelectItem value="2">2 attempts</SelectItem>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Retry Attempts
                    </label>
                    <Select defaultValue="2">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 attempt</SelectItem>
                        <SelectItem value="2">2 attempts</SelectItem>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Request Delay
                    </label>
                    <Select defaultValue="24">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                      </SelectContent>
                    </Select>
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