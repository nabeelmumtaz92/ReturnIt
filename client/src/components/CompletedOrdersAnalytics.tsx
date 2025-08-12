import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock,
  Package,
  Target,
  PieChart,
  Calendar,
  MapPin,
  Truck,
  Star
} from "lucide-react";

interface Order {
  id: string;
  customer: string;
  status: 'delivered' | 'refunded';
  driver?: string;
  amount: number;
  pickupAddress: string;
  destination: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface CompletedOrdersAnalyticsProps {
  completedOrders: Order[];
}

export default function CompletedOrdersAnalytics({ completedOrders }: CompletedOrdersAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [analyticsView, setAnalyticsView] = useState<'overview' | 'drivers' | 'customers' | 'locations'>('overview');

  // Calculate key metrics
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.amount - 3.99), 0);
  const totalServiceFees = completedOrders.length * 3.99;
  const totalDriverEarnings = completedOrders.reduce((sum, order) => sum + (order.amount * 0.7), 0);
  const averageOrderValue = completedOrders.length > 0 ? completedOrders.reduce((sum, order) => sum + order.amount, 0) / completedOrders.length : 0;
  
  // Driver performance analysis
  const driverStats = completedOrders.reduce((stats, order) => {
    if (order.driver) {
      if (!stats[order.driver]) {
        stats[order.driver] = {
          name: order.driver,
          orders: 0,
          earnings: 0,
          avgOrderValue: 0,
          deliveredCount: 0,
          refundedCount: 0
        };
      }
      stats[order.driver].orders++;
      stats[order.driver].earnings += order.amount * 0.7;
      if (order.status === 'delivered') {
        stats[order.driver].deliveredCount++;
      } else {
        stats[order.driver].refundedCount++;
      }
    }
    return stats;
  }, {} as Record<string, any>);

  // Calculate average order values for drivers
  Object.keys(driverStats).forEach(driverName => {
    const driver = driverStats[driverName];
    driver.avgOrderValue = driver.orders > 0 ? driver.earnings / driver.orders * (10/7) : 0; // Convert back to order value
    driver.successRate = driver.orders > 0 ? (driver.deliveredCount / driver.orders) * 100 : 0;
  });

  const topDrivers = Object.values(driverStats).sort((a: any, b: any) => b.earnings - a.earnings).slice(0, 5);

  // Location analysis
  const locationStats = completedOrders.reduce((stats, order) => {
    const destination = order.destination;
    if (!stats[destination]) {
      stats[destination] = {
        location: destination,
        orders: 0,
        revenue: 0,
        avgOrderValue: 0
      };
    }
    stats[destination].orders++;
    stats[destination].revenue += order.amount - 3.99;
    return stats;
  }, {} as Record<string, any>);

  Object.keys(locationStats).forEach(location => {
    const stat = locationStats[location];
    stat.avgOrderValue = stat.orders > 0 ? (stat.revenue / stat.orders) + 3.99 : 0;
  });

  const topLocations = Object.values(locationStats).sort((a: any, b: any) => b.orders - a.orders).slice(0, 5);

  // Priority distribution
  const priorityStats = completedOrders.reduce((stats, order) => {
    stats[order.priority] = (stats[order.priority] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);

  // Status distribution
  const statusStats = completedOrders.reduce((stats, order) => {
    stats[order.status] = (stats[order.status] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Advanced Analytics</h2>
          <p className="text-amber-700">Comprehensive completed orders analysis</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Net Revenue</p>
                <p className="text-3xl font-bold text-green-700">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">After service fees</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Service Fees</p>
                <p className="text-3xl font-bold text-blue-700">${totalServiceFees.toFixed(2)}</p>
                <p className="text-xs text-blue-600 mt-1">${completedOrders.length} × $3.99</p>
              </div>
              <Target className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Driver Payouts</p>
                <p className="text-3xl font-bold text-purple-700">${totalDriverEarnings.toFixed(2)}</p>
                <p className="text-xs text-purple-600 mt-1">70% commission</p>
              </div>
              <Users className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-amber-700">${averageOrderValue.toFixed(2)}</p>
                <p className="text-xs text-amber-600 mt-1">Per completed order</p>
              </div>
              <TrendingUp className="h-10 w-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={analyticsView} onValueChange={setAnalyticsView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Order Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statusStats).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">{count} orders</span>
                      </div>
                      <div className="text-sm font-semibold">
                        {((count / completedOrders.length) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(priorityStats).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          priority === 'high' ? 'bg-red-100 text-red-800' :
                          priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }>
                          {priority.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">{count} orders</span>
                      </div>
                      <div className="text-sm font-semibold">
                        {((count / completedOrders.length) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Top Performing Drivers
              </CardTitle>
              <CardDescription>Driver performance metrics and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDrivers.map((driver: any, index) => (
                  <div key={driver.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                        <span className="text-sm font-semibold text-amber-700">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{driver.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{driver.orders} orders</span>
                          <span>{driver.successRate.toFixed(1)}% success rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-700">${driver.earnings.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">earned</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Customer Insights
              </CardTitle>
              <CardDescription>Customer behavior and order patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-700">{completedOrders.length}</p>
                  <p className="text-sm text-gray-600">Total Customers Served</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-700">{((statusStats.delivered || 0) / completedOrders.length * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Successful Deliveries</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-700">${averageOrderValue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Average Spend</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Top Destinations
              </CardTitle>
              <CardDescription>Most popular pickup and drop-off locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topLocations.map((location: any, index) => (
                  <div key={location.location} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-semibold text-blue-700">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{location.location}</h4>
                        <p className="text-sm text-gray-600">{location.orders} orders completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-700">${location.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}