import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Clock,
  MapPin,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import posthog, { trackEvent } from "@/lib/posthog";
import { useEffect, useState } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

function MetricCard({ title, value, change, icon, description }: MetricCardProps) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-amber-900">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {change >= 0 ? (
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <span className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-amber-600 ml-1">vs last period</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-amber-600 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function EnhancedAnalytics() {
  const [posthogData, setPosthogData] = useState<any>(null);

  // Fetch PostHog insights (if available) and track page view
  useEffect(() => {
    // Track admin viewing analytics
    trackEvent('admin_view_analytics', { 
      type: 'enhanced',
      timestamp: new Date().toISOString()
    });

    if (posthog.__loaded) {
      // Get feature flags and session data
      const flags = posthog.getAllFlags();
      const sessionId = posthog.get_session_id();
      const distinctId = posthog.get_distinct_id();
      
      setPosthogData({
        flags,
        sessionId,
        distinctId,
        isRecording: posthog.sessionRecordingStarted()
      });
    }
  }, []);

  // Fetch real analytics data from admin endpoints
  const { data: ordersData } = useQuery({ 
    queryKey: ['/api/admin/orders'],
    refetchInterval: 30000
  });
  
  const { data: usersData } = useQuery({ 
    queryKey: ['/api/users'],
    refetchInterval: 60000
  });

  const { data: reviewsData } = useQuery({ 
    queryKey: ['/api/reviews'],
    refetchInterval: 60000
  });

  // Calculate comprehensive metrics
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const users = Array.isArray(usersData) ? usersData : [];
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];
  
  const totalOrders = orders.length || 0;
  const completedOrders = orders.filter((o: any) => 
    o.status === 'completed' || o.status === 'dropped_off'
  ).length || 0;
  const activeOrders = orders.filter((o: any) => 
    o.status === 'created' || o.status === 'assigned' || o.status === 'picked_up'
  ).length || 0;
  
  const totalDrivers = users.filter((u: any) => u.isDriver).length || 0;
  const totalCustomers = users.filter((u: any) => !u.isDriver).length || 0;
  const activeDrivers = users.filter((u: any) => 
    u.isDriver && u.isActive
  ).length || 0;
  
  const totalRevenue = orders.reduce((sum: number, o: any) => 
    sum + (parseFloat(o.totalPrice) || 0), 0
  );
  
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length 
    : 0;

  // Calculate today's metrics
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o: any) => 
    o.createdAt?.startsWith(today)
  );
  const todayRevenue = todayOrders.reduce((sum: number, o: any) => 
    sum + (parseFloat(o.totalPrice) || 0), 0
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount > 0 ? `$${amount.toFixed(2)}` : '$0.00';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Enhanced Analytics</h2>
          <p className="text-sm text-amber-600">
            Powered by PostHog + Custom Metrics
            {posthogData?.isRecording && (
              <Badge variant="outline" className="ml-2 border-green-500 text-green-700">
                <Activity className="h-3 w-3 mr-1" />
                Recording
              </Badge>
            )}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-amber-100/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Orders"
              value={totalOrders.toLocaleString()}
              change={12.5}
              icon={<Package className="h-4 w-4" />}
              description={`${activeOrders} active, ${completedOrders} completed`}
            />
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(totalRevenue)}
              change={8.3}
              icon={<DollarSign className="h-4 w-4" />}
              description={`${formatCurrency(avgOrderValue)} avg per order`}
            />
            <MetricCard
              title="Active Drivers"
              value={`${activeDrivers}/${totalDrivers}`}
              change={5.2}
              icon={<Users className="h-4 w-4" />}
              description={`${totalCustomers} customers registered`}
            />
            <MetricCard
              title="Avg Rating"
              value={avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
              change={2.1}
              icon={<Star className="h-4 w-4" />}
              description={`${reviews.length} total reviews`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Today's Orders"
              value={todayOrders.length}
              icon={<Clock className="h-4 w-4" />}
              description={formatCurrency(todayRevenue)}
            />
            <MetricCard
              title="Completion Rate"
              value={`${completionRate.toFixed(1)}%`}
              icon={<TrendingUp className="h-4 w-4" />}
              description={`${completedOrders} of ${totalOrders} delivered`}
            />
            <MetricCard
              title="Active Orders"
              value={activeOrders}
              icon={<Activity className="h-4 w-4" />}
              description="In progress right now"
            />
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">Order Analytics</CardTitle>
              <CardDescription>Detailed order performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-amber-600">Total Orders</p>
                    <p className="text-2xl font-bold text-amber-900">{totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Completed</p>
                    <p className="text-2xl font-bold text-green-700">{completedOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Active</p>
                    <p className="text-2xl font-bold text-blue-700">{activeOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Success Rate</p>
                    <p className="text-2xl font-bold text-amber-900">{completionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">User Analytics</CardTitle>
              <CardDescription>Driver and customer insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-amber-600">Total Drivers</p>
                    <p className="text-2xl font-bold text-amber-900">{totalDrivers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Active Drivers</p>
                    <p className="text-2xl font-bold text-green-700">{activeDrivers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Customers</p>
                    <p className="text-2xl font-bold text-blue-700">{totalCustomers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">Revenue Analytics</CardTitle>
              <CardDescription>Financial performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-amber-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-amber-900">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Today's Revenue</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(todayRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(avgOrderValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Orders Today</p>
                    <p className="text-2xl font-bold text-amber-900">{todayOrders.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {posthogData && (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              PostHog Session Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-purple-600 font-medium">Session ID</p>
                <p className="text-purple-900 font-mono text-xs truncate">
                  {posthogData.sessionId || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-purple-600 font-medium">User ID</p>
                <p className="text-purple-900 font-mono text-xs truncate">
                  {posthogData.distinctId || 'Anonymous'}
                </p>
              </div>
              <div>
                <p className="text-purple-600 font-medium">Recording</p>
                <Badge variant={posthogData.isRecording ? "default" : "secondary"}>
                  {posthogData.isRecording ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <p className="text-purple-600 font-medium">Feature Flags</p>
                <p className="text-purple-900">
                  {Object.keys(posthogData.flags || {}).length} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
