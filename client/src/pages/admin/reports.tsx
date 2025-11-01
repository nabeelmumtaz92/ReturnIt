import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Users, Package, Download, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PerformanceCard from "@/components/admin/PerformanceCard";
import { Separator } from "@/components/ui/separator";

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  activeDrivers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  driverGrowth: number;
  topDrivers: Array<{
    id: number;
    name: string;
    earnings: number;
    orders: number;
  }>;
  revenueByTier: Array<{
    tier: string;
    revenue: number;
    orders: number;
  }>;
  monthlyStats: Array<{
    month: string;
    revenue: number;
    orders: number;
    drivers: number;
  }>;
}

export default function Reports() {
  const [timeRange, setTimeRange] = useState("30");
  const [reportType, setReportType] = useState("overview");

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['/api/admin/reports', { days: timeRange, type: reportType }],
    refetchInterval: 60000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleExportReport = () => {
    // In production, this would generate a comprehensive PDF/Excel report
    const csvData = [
      'Report Type,Time Range,Generated Date',
      `${reportType},${timeRange} days,${new Date().toISOString()}`,
      '',
      'Metric,Value',
      `Total Revenue,${reportData?.totalRevenue || 0}`,
      `Total Orders,${reportData?.totalOrders || 0}`,
      `Active Drivers,${reportData?.activeDrivers || 0}`,
      `Average Order Value,${reportData?.averageOrderValue || 0}`,
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Reports</h1>
          <p className="text-muted-foreground">Analytics, insights, and performance metrics</p>
        </div>
        <Button onClick={handleExportReport} data-testid="button-export-report">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Report Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-report-type">
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="drivers">Drivers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-time-range">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PerformanceCard
          title="Total Revenue"
          value={isLoading ? "..." : formatCurrency(reportData?.totalRevenue || 0)}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          trend={reportData?.revenueGrowth ? {
            value: reportData.revenueGrowth,
            isPositive: reportData.revenueGrowth > 0
          } : undefined}
          testId="metric-total-revenue"
        />
        <PerformanceCard
          title="Total Orders"
          value={isLoading ? "..." : reportData?.totalOrders || 0}
          icon={Package}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={reportData?.orderGrowth ? {
            value: reportData.orderGrowth,
            isPositive: reportData.orderGrowth > 0
          } : undefined}
          testId="metric-total-orders"
        />
        <PerformanceCard
          title="Active Drivers"
          value={isLoading ? "..." : reportData?.activeDrivers || 0}
          icon={Users}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          trend={reportData?.driverGrowth ? {
            value: reportData.driverGrowth,
            isPositive: reportData.driverGrowth > 0
          } : undefined}
          testId="metric-active-drivers"
        />
        <PerformanceCard
          title="Avg Order Value"
          value={isLoading ? "..." : formatCurrency(reportData?.averageOrderValue || 0)}
          icon={TrendingUp}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          testId="metric-avg-order-value"
        />
      </div>

      {/* Revenue by Service Tier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue by Service Tier
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading revenue data...</p>
            </div>
          ) : !reportData?.revenueByTier || reportData.revenueByTier.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No revenue data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportData.revenueByTier.map((tier, index) => {
                const percentage = (tier.revenue / reportData.totalRevenue) * 100;
                return (
                  <div key={tier.tier} data-testid={`revenue-tier-${tier.tier.toLowerCase()}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tier.tier}</span>
                        <span className="text-sm text-muted-foreground">({tier.orders} orders)</span>
                      </div>
                      <span className="font-bold">{formatCurrency(tier.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          tier.tier === 'Standard' ? 'bg-blue-500' :
                          tier.tier === 'Priority' ? 'bg-purple-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% of total revenue</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performing Drivers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Performing Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading driver data...</p>
            </div>
          ) : !reportData?.topDrivers || reportData.topDrivers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No driver data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportData.topDrivers.map((driver, index) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`top-driver-${driver.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">{driver.orders} orders completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(driver.earnings)}</p>
                    <p className="text-xs text-muted-foreground">Total earnings</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading monthly data...</p>
            </div>
          ) : !reportData?.monthlyStats || reportData.monthlyStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No monthly data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportData.monthlyStats.map((month) => (
                <div key={month.month} className="border-b pb-4 last:border-0">
                  <h4 className="font-medium mb-2">{month.month}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-bold text-green-600">{formatCurrency(month.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Orders</p>
                      <p className="font-bold">{month.orders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Drivers</p>
                      <p className="font-bold">{month.drivers}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Summary */}
      <Card className="border-[#B8956A]">
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Report Type:</span>
              <span className="font-medium capitalize">{reportType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Range:</span>
              <span className="font-medium">Last {timeRange} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Generated:</span>
              <span className="font-medium">{new Date().toLocaleString()}</span>
            </div>
            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground">
              Reports are generated in real-time based on current database values. 
              Data is refreshed automatically every 60 seconds.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
