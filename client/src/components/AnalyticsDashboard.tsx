import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Truck, 
  Users, 
  Clock,
  Star,
  MapPin,
  Target,
  BarChart3,
  Calendar
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
  };
  orders: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
  drivers: {
    total: number;
    active: number;
    onBreak: number;
    offline: number;
    avgRating: number;
    newThisWeek: number;
  };
  performance: {
    avgPickupTime: number;
    avgDeliveryTime: number;
    customerSatisfaction: number;
    driverSatisfaction: number;
  };
}

export default function AnalyticsDashboard() {
  const analyticsData: AnalyticsData = {
    revenue: {
      today: 1247,
      yesterday: 1150,
      thisWeek: 7800,
      lastWeek: 7200,
      thisMonth: 31200,
      lastMonth: 28900
    },
    orders: {
      today: 47,
      thisWeek: 312,
      thisMonth: 1285,
      completed: 1156,
      cancelled: 89,
      pending: 40
    },
    drivers: {
      total: 156,
      active: 28,
      onBreak: 3,
      offline: 125,
      avgRating: 4.7,
      newThisWeek: 8
    },
    performance: {
      avgPickupTime: 14,
      avgDeliveryTime: 32,
      customerSatisfaction: 4.6,
      driverSatisfaction: 4.4
    }
  };

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change),
      isPositive: change >= 0
    };
  };

  const revenueChange = calculateChange(analyticsData.revenue.today, analyticsData.revenue.yesterday);
  const weeklyRevenueChange = calculateChange(analyticsData.revenue.thisWeek, analyticsData.revenue.lastWeek);

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-amber-900 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">${analyticsData.revenue.today.toLocaleString()}</div>
            <div className="flex items-center mt-2">
              {revenueChange.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={`text-xs ${revenueChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {revenueChange.percentage.toFixed(1)}% from yesterday
              </span>
            </div>
            <div className="text-xs text-amber-700 mt-1">
              Yesterday: ${analyticsData.revenue.yesterday.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-amber-900 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Weekly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">${analyticsData.revenue.thisWeek.toLocaleString()}</div>
            <div className="flex items-center mt-2">
              {weeklyRevenueChange.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={`text-xs ${weeklyRevenueChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {weeklyRevenueChange.percentage.toFixed(1)}% from last week
              </span>
            </div>
            <div className="text-xs text-amber-700 mt-1">
              Last week: ${analyticsData.revenue.lastWeek.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-amber-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">${analyticsData.revenue.thisMonth.toLocaleString()}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">
                +8.0% from last month
              </span>
            </div>
            <div className="text-xs text-amber-700 mt-1">
              Last month: ${analyticsData.revenue.lastMonth.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="bg-white border-amber-200">
          <TabsTrigger value="orders" className="data-[state=active]:bg-amber-100">
            <Package className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-amber-100">
            <Truck className="h-4 w-4 mr-2" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-amber-100">
            <Target className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/90">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-xl font-bold">{analyticsData.orders.thisMonth}</p>
                  </div>
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-xl font-bold text-green-600">{analyticsData.orders.completed}</p>
                  </div>
                  <div className="text-green-600">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">✓</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">90% completion rate</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-xl font-bold text-yellow-600">{analyticsData.orders.pending}</p>
                  </div>
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Awaiting pickup</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-xl font-bold text-red-600">{analyticsData.orders.cancelled}</p>
                  </div>
                  <div className="text-red-600">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">✕</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">7% cancellation rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="drivers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/90">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Drivers</p>
                    <p className="text-xl font-bold">{analyticsData.drivers.total}</p>
                  </div>
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">+{analyticsData.drivers.newThisWeek} this week</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Now</p>
                    <p className="text-xl font-bold text-green-600">{analyticsData.drivers.active}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{analyticsData.drivers.onBreak} on break</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-xl font-bold text-yellow-600">{analyticsData.drivers.avgRating}</p>
                  </div>
                  <Star className="h-6 w-6 text-yellow-600 fill-current" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on customer reviews</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Utilization</p>
                    <p className="text-xl font-bold text-purple-600">82%</p>
                  </div>
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Driver efficiency</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-base">Service Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Pickup Time</span>
                  <div className="flex items-center">
                    <span className="font-medium">{analyticsData.performance.avgPickupTime} min</span>
                    <Badge className="ml-2 bg-green-100 text-green-800">Good</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Delivery Time</span>
                  <div className="flex items-center">
                    <span className="font-medium">{analyticsData.performance.avgDeliveryTime} min</span>
                    <Badge className="ml-2 bg-yellow-100 text-yellow-800">Fair</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">On-Time Delivery</span>
                  <div className="flex items-center">
                    <span className="font-medium">94%</span>
                    <Badge className="ml-2 bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-base">Satisfaction Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <div className="flex items-center">
                    <span className="font-medium">{analyticsData.performance.customerSatisfaction}/5.0</span>
                    <Star className="ml-1 h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Driver Satisfaction</span>
                  <div className="flex items-center">
                    <span className="font-medium">{analyticsData.performance.driverSatisfaction}/5.0</span>
                    <Star className="ml-1 h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Repeat Customers</span>
                  <div className="flex items-center">
                    <span className="font-medium">67%</span>
                    <Badge className="ml-2 bg-blue-100 text-blue-800">Strong</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}