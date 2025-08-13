import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Filter,
  FileText,
  Clock,
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ReportFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  city: string;
  driverType: string;
  orderStatus: string;
  reportType: string;
}

interface ReportData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    activeDrivers: number;
    avgOrderValue: number;
    completionRate: number;
    customerSatisfaction: number;
  };
  trends: {
    date: string;
    revenue: number;
    orders: number;
    drivers: number;
  }[];
  driverPerformance: {
    driverId: number;
    name: string;
    city: string;
    totalEarnings: number;
    completedOrders: number;
    avgRating: number;
    onlineHours: number;
    completionRate: number;
  }[];
  cityBreakdown: {
    city: string;
    revenue: number;
    orders: number;
    drivers: number;
    growthRate: number;
  }[];
  orderAnalytics: {
    status: string;
    count: number;
    percentage: number;
    avgValue: number;
  }[];
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    customerLifetimeValue: number;
    avgOrdersPerCustomer: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdvancedReporting() {
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date(),
    },
    city: 'all',
    driverType: 'all',
    orderStatus: 'all',
    reportType: 'overview',
  });

  const { data: reportData, isLoading, refetch } = useQuery<ReportData>({
    queryKey: ['/api/reports/advanced', filters],
  });

  const exportToExcel = () => {
    if (!reportData) return;

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Overview sheet
    const overviewData = [
      ['Metric', 'Value'],
      ['Total Revenue', `$${reportData.overview.totalRevenue.toLocaleString()}`],
      ['Total Orders', reportData.overview.totalOrders.toLocaleString()],
      ['Active Drivers', reportData.overview.activeDrivers.toLocaleString()],
      ['Average Order Value', `$${reportData.overview.avgOrderValue.toFixed(2)}`],
      ['Completion Rate', `${reportData.overview.completionRate}%`],
      ['Customer Satisfaction', `${reportData.overview.customerSatisfaction}%`],
    ];
    
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

    // Driver Performance sheet
    const driverHeaders = ['Driver ID', 'Name', 'City', 'Total Earnings', 'Completed Orders', 'Avg Rating', 'Online Hours', 'Completion Rate'];
    const driverData = [
      driverHeaders,
      ...reportData.driverPerformance.map(driver => [
        driver.driverId,
        driver.name,
        driver.city,
        driver.totalEarnings,
        driver.completedOrders,
        driver.avgRating,
        driver.onlineHours,
        `${driver.completionRate}%`
      ])
    ];
    
    const driverSheet = XLSX.utils.aoa_to_sheet(driverData);
    XLSX.utils.book_append_sheet(workbook, driverSheet, 'Driver Performance');

    // City Breakdown sheet
    const cityHeaders = ['City', 'Revenue', 'Orders', 'Drivers', 'Growth Rate'];
    const cityData = [
      cityHeaders,
      ...reportData.cityBreakdown.map(city => [
        city.city,
        city.revenue,
        city.orders,
        city.drivers,
        `${city.growthRate}%`
      ])
    ];
    
    const citySheet = XLSX.utils.aoa_to_sheet(cityData);
    XLSX.utils.book_append_sheet(workbook, citySheet, 'City Analysis');

    // Trends sheet
    const trendsHeaders = ['Date', 'Revenue', 'Orders', 'Active Drivers'];
    const trendsData = [
      trendsHeaders,
      ...reportData.trends.map(trend => [
        trend.date,
        trend.revenue,
        trend.orders,
        trend.drivers
      ])
    ];
    
    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Trends');

    // Export the file
    const fileName = `returnly-advanced-report-${filters.dateRange.from.toISOString().split('T')[0]}-to-${filters.dateRange.to.toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Generating advanced reports...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No report data available for the selected filters.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Business Intelligence</h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics and performance insights</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} className="flex items-center gap-2" data-testid="button-export">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh">
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(dateRange) => handleFilterChange('dateRange', dateRange)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>City</Label>
              <Select 
                value={filters.city} 
                onValueChange={(value) => handleFilterChange('city', value)}
              >
                <SelectTrigger data-testid="select-city">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="st-louis">St. Louis</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="kansas-city">Kansas City</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Driver Type</Label>
              <Select 
                value={filters.driverType} 
                onValueChange={(value) => handleFilterChange('driverType', value)}
              >
                <SelectTrigger data-testid="select-driver-type">
                  <SelectValue placeholder="Driver type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contractor">Independent Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select 
                value={filters.orderStatus} 
                onValueChange={(value) => handleFilterChange('orderStatus', value)}
              >
                <SelectTrigger data-testid="select-order-status">
                  <SelectValue placeholder="Order status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${reportData.overview.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{reportData.overview.totalOrders.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold">{reportData.overview.activeDrivers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">${reportData.overview.avgOrderValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{reportData.overview.completionRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{reportData.overview.customerSatisfaction}%</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
          <TabsTrigger value="drivers" data-testid="tab-drivers">Driver Performance</TabsTrigger>
          <TabsTrigger value="cities" data-testid="tab-cities">City Analysis</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">Order Analytics</TabsTrigger>
          <TabsTrigger value="customers" data-testid="tab-customers">Customer Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Revenue and Order Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.6}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#3b82f6"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Driver Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Completion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.driverPerformance.map((driver) => (
                      <TableRow key={driver.driverId}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.city}</TableCell>
                        <TableCell>${driver.totalEarnings.toLocaleString()}</TableCell>
                        <TableCell>{driver.completedOrders}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {driver.avgRating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>{Math.round(driver.onlineHours)}h</TableCell>
                        <TableCell>
                          <Badge variant={driver.completionRate >= 90 ? 'default' : 'secondary'}>
                            {driver.completionRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>City Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.cityBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Rate by City</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.cityBreakdown.map((city) => (
                    <div key={city.city} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{city.city}</p>
                        <p className="text-sm text-gray-600">
                          {city.orders} orders • {city.drivers} drivers
                        </p>
                      </div>
                      <Badge variant={city.growthRate > 0 ? 'default' : 'secondary'}>
                        {city.growthRate > 0 ? '+' : ''}{city.growthRate}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.orderAnalytics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentage }) => `${status}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {reportData.orderAnalytics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Value Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.orderAnalytics.map((status) => (
                    <div key={status.status} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium capitalize">{status.status}</p>
                        <p className="text-sm text-gray-600">{status.count} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${status.avgValue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">avg value</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{reportData.customerMetrics.newCustomers}</p>
                <p className="text-sm text-gray-600">New Customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{reportData.customerMetrics.returningCustomers}</p>
                <p className="text-sm text-gray-600">Returning Customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">${reportData.customerMetrics.customerLifetimeValue.toFixed(0)}</p>
                <p className="text-sm text-gray-600">Avg Lifetime Value</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{reportData.customerMetrics.avgOrdersPerCustomer.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Avg Orders per Customer</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}