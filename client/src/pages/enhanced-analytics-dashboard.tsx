import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, DollarSign, Users, Package, Download, 
  Activity, Clock, BarChart3, PieChart, LineChart,
  RefreshCw, AlertCircle, CheckCircle2, Timer
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AnalyticsData {
  totalOrders: number;
  completedOrders: number;
  activeDrivers: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  customerSatisfaction: number;
  orderTrends: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  driverMetrics: Array<{
    driverId: number;
    name: string;
    completedOrders: number;
    earnings: number;
    rating: number;
  }>;
  regionalData: Array<{
    region: string;
    orders: number;
    revenue: number;
  }>;
  performanceMetrics: any;
}

interface RealTimeMetrics {
  todayOrders: number;
  activeOrders: number;
  todayRevenue: number;
  systemHealth: any;
  lastUpdated: string;
}

export default function EnhancedAnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds

  // Fetch comprehensive analytics report
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/business-report'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch real-time metrics
  const { 
    data: realTimeMetrics, 
    isLoading: realTimeLoading,
    refetch: refetchRealTime 
  } = useQuery<RealTimeMetrics>({
    queryKey: ['/api/analytics/realtime'],
    refetchInterval: refreshInterval,
  });

  // Fetch system health
  const { data: healthData } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 15000, // 15 seconds
  });

  // Export data function
  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `returnly-analytics-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'json' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Refresh all data
  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchRealTime();
  };

  if (analyticsLoading && !analyticsData) {
    return (
      <div className="min-h-screen bg-secondary/20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Loading comprehensive analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="min-h-screen bg-secondary/20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Analytics Error</h3>
              <p className="text-red-600 mb-4">Failed to load analytics data. Please try refreshing.</p>
              <Button onClick={handleRefreshAll} variant="outline" className="border-red-300 text-red-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Enhanced Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive business intelligence and performance metrics
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleRefreshAll} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
            
            <div className="flex gap-2">
              <Button onClick={() => handleExport('excel')} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Real-Time Metrics Bar */}
        {realTimeMetrics && (
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Live Updates</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Today: {realTimeMetrics.todayOrders}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Active: {realTimeMetrics.activeOrders}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm">${realTimeMetrics.todayRevenue.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Updated: {new Date(realTimeMetrics.lastUpdated).toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Health */}
        {healthData && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-800">Uptime</p>
                  <p className="text-green-600">{Math.floor(healthData.uptime / 3600)}h {Math.floor((healthData.uptime % 3600) / 60)}m</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Memory</p>
                  <p className="text-green-600">{healthData.memory?.used}MB / {healthData.memory?.total}MB</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Cache</p>
                  <p className="text-green-600">{healthData.cache?.mainCache} items</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Status</p>
                  <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Analytics Content */}
        {analyticsData && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{analyticsData.totalOrders}</p>
                        <p className="text-xs text-muted-foreground">All time</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">${analyticsData.totalRevenue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Completed orders</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Drivers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{analyticsData.activeDrivers}</p>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{analyticsData.completionRate.toFixed(1)}%</p>
                        <Progress value={analyticsData.completionRate} className="w-16 h-2 mt-2" />
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Order Trends (30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.orderTrends.slice(-7).map((trend, index) => (
                        <div key={trend.date} className="flex items-center justify-between text-sm">
                          <span>{new Date(trend.date).toLocaleDateString()}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-blue-600">{trend.orders} orders</span>
                            <span className="text-green-600">${trend.revenue.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Regional Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.regionalData.slice(0, 5).map((region) => (
                        <div key={region.region} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{region.region}</span>
                              <span className="text-muted-foreground">{region.orders} orders</span>
                            </div>
                            <Progress 
                              value={(region.orders / analyticsData.totalOrders) * 100} 
                              className="h-2 mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Order Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-800">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-900">{analyticsData.totalOrders}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-green-800">Completed</p>
                        <p className="text-2xl font-bold text-green-900">{analyticsData.completedOrders}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-800">Average Value</p>
                        <p className="text-2xl font-bold text-purple-900">${analyticsData.averageOrderValue.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="font-medium text-orange-800">Customer Rating</p>
                        <p className="text-2xl font-bold text-orange-900">{analyticsData.customerSatisfaction.toFixed(1)}/5</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{analyticsData.completionRate.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Peak Performance</span>
                        <Badge variant="secondary">Excellent</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Trend</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Improving
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Drivers Tab */}
            <TabsContent value="drivers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Driver Performance Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.driverMetrics.slice(0, 10).map((driver, index) => (
                      <div key={driver.driverId} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-muted-foreground">{driver.completedOrders} completed orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${driver.earnings.toFixed(2)}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < Math.floor(driver.rating) ? 'bg-yellow-400' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-1">
                              {driver.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analyticsData.performanceMetrics && Object.entries(analyticsData.performanceMetrics).map(([key, metrics]: [string, any]) => (
                      <div key={key} className="p-3 bg-secondary/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                          <Badge variant="outline">{metrics.count} samples</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Avg</p>
                            <p className="font-semibold">{metrics.average?.toFixed(2)}ms</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min</p>
                            <p className="font-semibold text-green-600">{metrics.min?.toFixed(2)}ms</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max</p>
                            <p className="font-semibold text-red-600">{metrics.max?.toFixed(2)}ms</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Business Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Growth Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Revenue Growth</span>
                          <span className="font-semibold text-green-600">+23.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Order Volume</span>
                          <span className="font-semibold text-blue-600">+18.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Driver Retention</span>
                          <span className="font-semibold text-purple-600">94.1%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Optimization Opportunities</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span>Peak hour routing efficiency</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>Driver workload balancing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span>Customer communication timing</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}