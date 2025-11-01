import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, RefreshCcw, Activity, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import PerformanceCard from "@/components/admin/PerformanceCard";
import { Badge } from "@/components/ui/badge";

interface MetricDataPoint {
  time: string;
  load: number;
  requests: number;
}

interface SystemService {
  name: string;
  status: 'operational' | 'degraded' | 'down';
}

interface SystemMetricsData {
  uptime: number;
  errorRate: number;
  avgResponseTime: number;
  metrics: MetricDataPoint[];
  services: SystemService[];
  lastUpdated: string;
}

export default function SystemMetrics() {
  const { data: systemMetrics, isLoading, isError, refetch } = useQuery<SystemMetricsData>({
    queryKey: ['/api/admin/system-metrics'],
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetch();
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'down':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getServiceTextColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-700';
      case 'degraded':
        return 'text-yellow-700';
      case 'down':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">System Metrics</h1>
          <p className="text-muted-foreground">Platform performance and health monitoring</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" data-testid="button-refresh-metrics">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Health Metrics */}
      {isError ? (
        <Card className="border-red-200" data-testid="error-metrics">
          <CardContent className="text-center py-8">
            <Monitor className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 font-medium mb-2">Failed to load system metrics</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PerformanceCard
            title="API Uptime"
            value={isLoading ? "..." : systemMetrics ? `${systemMetrics.uptime}%` : "N/A"}
            icon={Activity}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            testId="metric-uptime"
          />
          <PerformanceCard
            title="Error Rate"
            value={isLoading ? "..." : systemMetrics ? `${systemMetrics.errorRate}%` : "N/A"}
            icon={AlertCircle}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
            testId="metric-error-rate"
          />
          <PerformanceCard
            title="Avg Response"
            value={isLoading ? "..." : systemMetrics ? `${systemMetrics.avgResponseTime}ms` : "N/A"}
            icon={Monitor}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            testId="metric-response-time"
          />
        </div>
      )}

      {/* System Load Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            System Load Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-system-load">
              <p className="text-muted-foreground">Loading system metrics...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8" data-testid="error-system-load">
              <Monitor className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 font-medium mb-2">Failed to load system metrics</p>
              <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
            </div>
          ) : !systemMetrics?.metrics || systemMetrics.metrics.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-system-load">
              <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No system load data available</p>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemMetrics.metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    domain={[0, 1]}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="load" 
                    stroke="#B8956A" 
                    strokeWidth={2}
                    name="CPU Load"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Request Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Request Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-request-volume">
              <p className="text-muted-foreground">Loading request metrics...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8" data-testid="error-request-volume">
              <Activity className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 font-medium mb-2">Failed to load request metrics</p>
              <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
            </div>
          ) : !systemMetrics?.metrics || systemMetrics.metrics.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-request-volume">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No request volume data available</p>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemMetrics.metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#8B6F47" 
                    strokeWidth={2}
                    name="Requests/Hour"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-[#B8956A]">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-system-status">
              <p className="text-muted-foreground">Loading system status...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8" data-testid="error-system-status">
              <Monitor className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 font-medium mb-2">Failed to load system status</p>
              <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
            </div>
          ) : (
            <div className="space-y-3">
              {systemMetrics?.services && systemMetrics.services.length > 0 ? (
                systemMetrics.services.map((service) => (
                  <Card key={service.name} className={getServiceStatusColor(service.status)} data-testid={`service-${service.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${service.status === 'operational' ? 'bg-green-500 animate-pulse' : service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <Badge variant="outline" className={getServiceTextColor(service.status)}>
                        {service.status === 'operational' ? 'Operational' : service.status === 'degraded' ? 'Degraded' : 'Down'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Database</span>
                      </div>
                      <Badge variant="outline" className="text-green-700">Operational</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">API Server</span>
                      </div>
                      <Badge variant="outline" className="text-green-700">Operational</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">WebSocket Service</span>
                      </div>
                      <Badge variant="outline" className="text-green-700">Operational</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Stripe Integration</span>
                      </div>
                      <Badge variant="outline" className="text-green-700">Operational</Badge>
                    </CardContent>
                  </Card>
                </>
              )}

              <div className="text-xs text-muted-foreground text-center pt-2">
                Last updated: {systemMetrics?.lastUpdated ? new Date(systemMetrics.lastUpdated).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
