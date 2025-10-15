import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Calendar,
  TrendingUp,
  DollarSign,
  MapPin,
  Clock,
  Star,
  Users,
  Package,
  Truck,
  BarChart3,
  PieChart,
  Filter,
  FileText
} from 'lucide-react';
import { useState } from 'react';

interface ReportData {
  financial: {
    totalRevenue: number;
    driverPayouts: number;
    platformFees: number;
    refunds: number;
    averageOrderValue: number;
    revenueGrowth: number;
  };
  operational: {
    totalOrders: number;
    completionRate: number;
    averagePickupTime: number;
    averageDeliveryTime: number;
    customerSatisfaction: number;
    driverUtilization: number;
  };
  geographic: {
    topZips: Array<{
      zip: string;
      orders: number;
      revenue: number;
    }>;
    coverage: number;
    averageDistance: number;
  };
}

export default function AdvancedReporting() {
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('overview');

  const reportData: ReportData = {
    financial: {
      totalRevenue: 87650,
      driverPayouts: 61355,
      platformFees: 26295,
      refunds: 1240,
      averageOrderValue: 28.45,
      revenueGrowth: 23.5
    },
    operational: {
      totalOrders: 3082,
      completionRate: 94.2,
      averagePickupTime: 14,
      averageDeliveryTime: 32,
      customerSatisfaction: 4.6,
      driverUtilization: 82.3
    },
    geographic: {
      topZips: [
        { zip: '63101', orders: 245, revenue: 6970 },
        { zip: '63108', orders: 198, revenue: 5634 },
        { zip: '63110', orders: 167, revenue: 4752 },
        { zip: '63130', orders: 143, revenue: 4065 },
        { zip: '63104', orders: 134, revenue: 3808 }
      ],
      coverage: 85.7,
      averageDistance: 4.2
    }
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    // Simulate export functionality
    console.log(`Exporting ${reportType} report as ${format.toUpperCase()} for ${dateRange}`);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white/90 backdrop-blur-sm rounded-lg border border-amber-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-amber-700" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-amber-700" />
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="geographic">Geographic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => exportReport('csv')}
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Download className="h-3 w-3 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => exportReport('pdf')}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <FileText className="h-3 w-3 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="bg-white border-amber-200">
          <TabsTrigger value="financial" className="data-[state=active]:bg-amber-100">
            <DollarSign className="h-4 w-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="operational" className="data-[state=active]:bg-amber-100">
            <BarChart3 className="h-4 w-4 mr-2" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="geographic" className="data-[state=active]:bg-amber-100">
            <MapPin className="h-4 w-4 mr-2" />
            Geographic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/90">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-900">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <span className="font-bold text-green-600">${reportData.financial.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Driver Payouts</span>
                    <span className="font-medium text-blue-600">${reportData.financial.driverPayouts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Platform Fees</span>
                    <span className="font-medium text-amber-600">${reportData.financial.platformFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Refunds</span>
                    <span className="font-medium text-red-600">${reportData.financial.refunds.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Net Profit</span>
                      <span className="font-bold text-green-700">
                        ${(reportData.financial.platformFees - reportData.financial.refunds).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-900">Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      +{reportData.financial.revenueGrowth}%
                    </div>
                    <p className="text-sm text-gray-600">Revenue Growth</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Order Value</span>
                    <span className="font-medium">${reportData.financial.averageOrderValue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Order Volume</span>
                    <span className="font-medium text-blue-600">+18.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Customer LTV</span>
                    <span className="font-medium text-purple-600">$142.80</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-900">Payout Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Instant Payouts</span>
                    <span className="font-medium text-green-600">67%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Weekly Payouts</span>
                    <span className="font-medium text-blue-600">33%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Payout</span>
                    <span className="font-medium">$18.45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing Fees</span>
                    <span className="font-medium text-amber-600">$2,180</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-amber-900">Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Orders</span>
                    <span className="font-bold text-blue-900">{reportData.operational.totalOrders.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <div className="flex items-center">
                      <span className="font-medium">{reportData.operational.completionRate}%</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Pickup Time</span>
                    <span className="font-medium">{reportData.operational.averagePickupTime} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Delivery Time</span>
                    <span className="font-medium">{reportData.operational.averageDeliveryTime} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Customer Rating</span>
                    <div className="flex items-center">
                      <span className="font-medium">{reportData.operational.customerSatisfaction}</span>
                      <Star className="h-4 w-4 text-yellow-500 fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-amber-900">Driver Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Driver Utilization</span>
                    <span className="font-bold text-purple-600">{reportData.operational.driverUtilization}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Peak Hours</span>
                    <span className="font-medium">11 AM - 3 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Jobs/Driver</span>
                    <span className="font-medium">8.3/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">No-shows</span>
                    <span className="font-medium text-red-600">2.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Driver Retention</span>
                    <span className="font-medium text-green-600">89%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic">
          <div className="space-y-6">
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-amber-900">Service Area Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Coverage Area</span>
                      <span className="font-medium">{reportData.geographic.coverage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${reportData.geographic.coverage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Distance</span>
                      <span className="font-medium">{reportData.geographic.averageDistance} mi</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Service Zones</span>
                      <span className="font-medium">12 active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-amber-900">Top Performing ZIP Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.geographic.topZips.map((zip, index) => (
                    <div key={zip.zip} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-amber-100 text-amber-800">#{index + 1}</Badge>
                        <div>
                          <span className="font-medium text-gray-900">{zip.zip}</span>
                          <p className="text-xs text-gray-600">St. Louis Metro</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{zip.orders} orders</div>
                        <div className="text-sm text-green-600">${zip.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}