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
  driverEarning: number;
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
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportExcel = async () => {
    setIsExporting(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate comprehensive analytics data for export
      const analyticsData = [
        // Summary metrics
        {
          sheet: 'Summary',
          metric: 'Total Orders',
          value: completedOrders.length,
          details: 'All completed orders',
          time_range: timeRange,
          export_date: new Date().toISOString().split('T')[0]
        },
        {
          sheet: 'Summary',
          metric: 'Net Revenue',
          value: `$${totalRevenue.toFixed(2)}`,
          details: 'Revenue after service fees',
          time_range: timeRange,
          export_date: new Date().toISOString().split('T')[0]
        },
        {
          sheet: 'Summary',
          metric: 'Service Fees',
          value: `$${totalServiceFees.toFixed(2)}`,
          details: `${completedOrders.length} orders × $3.99`,
          time_range: timeRange,
          export_date: new Date().toISOString().split('T')[0]
        },
        {
          sheet: 'Summary',
          metric: 'Driver Payouts',
          value: `$${totalDriverEarnings.toFixed(2)}`,
          details: '70% commission to drivers',
          time_range: timeRange,
          export_date: new Date().toISOString().split('T')[0]
        },
        {
          sheet: 'Summary',
          metric: 'Average Order Value',
          value: `$${averageOrderValue.toFixed(2)}`,
          details: 'Per completed order',
          time_range: timeRange,
          export_date: new Date().toISOString().split('T')[0]
        },
        // Individual orders data
        ...completedOrders.map(order => ({
          sheet: 'Orders',
          order_id: order.id,
          customer: order.customer,
          driver: order.driver || 'Unassigned',
          status: order.status,
          amount: `$${order.amount.toFixed(2)}`,
          driver_earning: `$${(order.driverEarning || order.amount * 0.7).toFixed(2)}`,
          service_fee: '$3.99',
          net_revenue: `$${(order.amount - 3.99).toFixed(2)}`,
          priority: order.priority,
          pickup_address: order.pickupAddress,
          destination: order.destination,
          created_date: new Date(order.createdAt).toLocaleDateString(),
          time_range: timeRange,
          export_date: new Date().toISOString().split('T')[0]
        })),
        // Driver performance data
        ...Object.values(driverStats).map((driver: any) => ({
          sheet: 'Drivers',
          driver_name: driver.name,
          total_orders: driver.orders,
          delivered_orders: driver.deliveredCount,
          refunded_orders: driver.refundedCount,
          success_rate: `${driver.successRate.toFixed(1)}%`,
          total_earnings: `$${driver.earnings.toFixed(2)}`,
          average_order_value: `$${driver.avgOrderValue.toFixed(2)}`,
          time_range: timeRange,
          export_date: new Date().toISOString().split('T')[0]
        })),
        // Location performance data
        ...Object.values(locationStats).map((location: any) => ({
          sheet: 'Locations',
          location_name: location.location,
          total_orders: location.orders,
          total_revenue: `$${location.revenue.toFixed(2)}`,
          average_order_value: `$${location.avgOrderValue.toFixed(2)}`,
          time_range: timeRange,
          export_date: new Date().toISOString().split('T')[0]
        }))
      ];

      const headers = Object.keys(analyticsData[0]);
      const filename = `analytics_export_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
      
      const csvContent = convertToCSV(analyticsData, headers);
      downloadFile(csvContent, filename);
      
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate key metrics
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.amount - 3.99), 0);
  const totalServiceFees = completedOrders.length * 3.99;
  const totalDriverEarnings = completedOrders.reduce((sum, order) => sum + (order.driverEarning || order.amount * 0.7), 0);
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
      stats[order.driver].earnings += order.driverEarning || order.amount * 0.7;
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
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-export-analytics-excel"
          >
            {isExporting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Excel
              </>
            )}
          </Button>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
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
      <Tabs value={analyticsView} onValueChange={(value: any) => setAnalyticsView(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
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

        {/* Detailed Orders Table */}
        <TabsContent value="orders" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Individual Order Details
              </CardTitle>
              <CardDescription>Complete breakdown of return amounts and driver earnings per order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Customer</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Driver</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Return Amount</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Driver Earnings</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedOrders.slice(0, 50).map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50" data-testid={`order-row-${order.id}`}>
                        <td className="p-3 text-sm font-mono text-blue-600" data-testid={`text-order-id-${order.id}`}>
                          #{order.id}
                        </td>
                        <td className="p-3 text-sm text-gray-700" data-testid={`text-customer-${order.id}`}>
                          {order.customer}
                        </td>
                        <td className="p-3 text-sm text-gray-700" data-testid={`text-driver-${order.id}`}>
                          {order.driver || 'N/A'}
                        </td>
                        <td className="p-3 text-sm text-right font-semibold text-green-700" data-testid={`text-amount-${order.id}`}>
                          ${order.amount.toFixed(2)}
                        </td>
                        <td className="p-3 text-sm text-right font-semibold text-purple-700" data-testid={`text-driver-earning-${order.id}`}>
                          ${(order.driverEarning || order.amount * 0.7).toFixed(2)}
                        </td>
                        <td className="p-3 text-sm" data-testid={`status-${order.id}`}>
                          <Badge className={order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-600" data-testid={`text-date-${order.id}`}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {completedOrders.length > 50 && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Showing first 50 orders of {completedOrders.length} total completed orders
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}