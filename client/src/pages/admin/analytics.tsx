import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package, DollarSign, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import PerformanceCard from "@/components/admin/PerformanceCard";

interface AnalyticsData {
  totalRevenue: number;
  ordersThisWeek: number;
  avgTipPercentage: number;
  customerRetention: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function Analytics() {
  const { data: analytics, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics'],
    refetchInterval: 60000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Performance metrics and data insights</p>
      </div>

      {/* Key Metrics */}
      {isError ? (
        <Card className="border-red-200" data-testid="error-metrics">
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 font-medium mb-2">Failed to load analytics metrics</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PerformanceCard
            title="Total Revenue"
            value={isLoading ? "..." : analytics ? formatCurrency(analytics.totalRevenue) : "N/A"}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            testId="metric-total-revenue"
          />
          <PerformanceCard
            title="Orders This Week"
            value={isLoading ? "..." : analytics ? analytics.ordersThisWeek : "N/A"}
            icon={Package}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            testId="metric-orders-week"
          />
          <PerformanceCard
            title="Avg Tip %"
            value={isLoading ? "..." : analytics ? `${analytics.avgTipPercentage}%` : "N/A"}
            icon={Percent}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            testId="metric-avg-tip"
          />
          <PerformanceCard
            title="Customer Retention"
            value={isLoading ? "..." : analytics ? `${analytics.customerRetention}%` : "N/A"}
            icon={TrendingUp}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
            testId="metric-retention"
          />
        </div>
      )}

      {/* Monthly Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monthly Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-revenue-chart">
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8" data-testid="error-revenue-chart">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 font-medium mb-2">Failed to load revenue data</p>
              <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
            </div>
          ) : !analytics?.monthlyRevenue || analytics.monthlyRevenue.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-revenue-chart">
              <p className="text-muted-foreground">No revenue data available</p>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="revenue" fill="#B8956A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="bg-blue-500 text-white rounded-full p-2">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Revenue Growth</h4>
                <p className="text-sm text-muted-foreground">
                  Revenue has increased by 14% compared to last month. Customer-paid premium pricing tiers are driving growth.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="bg-green-500 text-white rounded-full p-2">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Order Volume</h4>
                <p className="text-sm text-muted-foreground">
                  Weekly orders are up 12%. Priority and Instant tiers account for 35% of all bookings.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="bg-purple-500 text-white rounded-full p-2">
                <Percent className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Driver Earnings</h4>
                <p className="text-sm text-muted-foreground">
                  Average driver earnings increased by 18% thanks to enhanced tip encouragement and higher service tier payouts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
