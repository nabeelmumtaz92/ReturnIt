import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  MemoryStick, 
  Server, 
  TrendingUp,
  Zap,
  Users,
  Package,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  environment: string;
}

interface PerformanceMetrics {
  request_time: {
    count: number;
    average: number;
    min: number;
    max: number;
  };
  db_query_time: {
    count: number;
    average: number;
    min: number;
    max: number;
  };
  memory_usage: NodeJS.MemoryUsage;
}

interface AlertConfig {
  responseTime: number;
  errorRate: number;
  memoryThreshold: number;
  enableSlackAlerts: boolean;
  enableEmailAlerts: boolean;
}

export default function MonitoringDashboard() {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    responseTime: 1000, // 1 second
    errorRate: 5, // 5%
    memoryThreshold: 80, // 80%
    enableSlackAlerts: true,
    enableEmailAlerts: true
  });
  
  const [alerts, setAlerts] = useState<any[]>([]);

  // Real-time health monitoring
  const { data: health, isLoading: healthLoading } = useQuery<HealthStatus>({
    queryKey: ['/api/health'],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Performance metrics
  const { data: metrics } = useQuery<PerformanceMetrics>({
    queryKey: ['/api/admin/monitoring/metrics'],
    refetchInterval: 10000, // Update every 10 seconds
  });

  // Real-time analytics
  const { data: analytics } = useQuery<{
    activeUsers?: number;
    todayOrders?: number;
    todayRevenue?: number;
    performanceHistory?: Array<{ timestamp: string; avgResponseTime: number }>;
    memoryHistory?: Array<{ timestamp: string; memoryPercent: number }>;
  }>({
    queryKey: ['/api/admin/analytics/realtime'],
    refetchInterval: 15000, // Update every 15 seconds
  });

  // Error logs
  const { data: errorLogs } = useQuery<Array<{
    message: string;
    timestamp: string;
    stack?: string;
  }>>({
    queryKey: ['/api/admin/monitoring/errors'],
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Alert management
  const { data: activeAlerts } = useQuery({
    queryKey: ['/api/admin/monitoring/alerts'],
    refetchInterval: 5000,
  });

  // Calculate memory usage percentage
  const getMemoryUsagePercent = () => {
    if (!health?.memory) return 0;
    return Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100);
  };

  // Check for threshold violations
  useEffect(() => {
    if (metrics && health) {
      const newAlerts: any[] = [];
      
      // Check response time
      if (metrics.request_time?.average > alertConfig.responseTime) {
        newAlerts.push({
          type: 'performance',
          severity: 'warning',
          message: `Average response time (${metrics.request_time.average}ms) exceeds threshold (${alertConfig.responseTime}ms)`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check memory usage
      const memoryPercent = getMemoryUsagePercent();
      if (memoryPercent > alertConfig.memoryThreshold) {
        newAlerts.push({
          type: 'memory',
          severity: 'critical',
          message: `Memory usage (${memoryPercent}%) exceeds threshold (${alertConfig.memoryThreshold}%)`,
          timestamp: new Date().toISOString()
        });
      }
      
      setAlerts(newAlerts);
    }
  }, [metrics, health, alertConfig]);

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Format memory size
  const formatMemory = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  if (healthLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="h-8 w-8 text-primary mx-auto animate-pulse" />
          <p className="text-foreground font-medium">Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Infrastructure Monitoring</h1>
            <p className="text-muted-foreground mt-1">Real-time system health and performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={health?.status === 'healthy' ? 'default' : 'destructive'} className="text-lg px-3 py-1">
              {health?.status === 'healthy' ? (
                <><CheckCircle className="h-4 w-4 mr-1" /> System Healthy</>
              ) : (
                <><AlertTriangle className="h-4 w-4 mr-1" /> System Issues</>
              )}
            </Badge>
          </div>
        </div>

        {/* Alert Banner */}
        {alerts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-800">{alert.message}</span>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* System Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Server className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {health?.status === 'healthy' ? 'Healthy' : 'Issues'}
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime: {health ? formatUptime(health.uptime) : 'Loading...'}
              </p>
            </CardContent>
          </Card>

          {/* Database Health */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {health?.database === 'connected' ? 'Connected' : 'Error'}
              </div>
              <p className="text-xs text-muted-foreground">
                PostgreSQL (Neon)
              </p>
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <MemoryStick className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getMemoryUsagePercent()}%
              </div>
              <p className="text-xs text-muted-foreground">
                {health ? formatMemory(health.memory.heapUsed) : 'Loading...'}
              </p>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.request_time?.average ? Math.round(metrics.request_time.average) : 0}ms
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics?.request_time?.count || 0} requests tracked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Response Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Response Time Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.performanceHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgResponseTime" stroke="#D97706" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MemoryStick className="h-5 w-5 text-primary" />
                Memory Usage Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.memoryHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="memoryPercent" stroke="#D97706" fill="#FED7AA" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics?.request_time && (
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Request Time</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(metrics.request_time.average)}ms avg
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Min: {Math.round(metrics.request_time.min)}ms | Max: {Math.round(metrics.request_time.max)}ms
                  </div>
                </div>
              )}
              
              {metrics?.db_query_time && (
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">DB Query Time</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(metrics.db_query_time.average)}ms avg
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {metrics.db_query_time.count} queries tracked
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Business Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Active Users
                </span>
                <span className="text-sm font-semibold">{analytics?.activeUsers || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Today's Orders
                </span>
                <span className="text-sm font-semibold">{analytics?.todayOrders || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Revenue Today
                </span>
                <span className="text-sm font-semibold">${analytics?.todayRevenue || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Alert Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Response Time Threshold</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={alertConfig.responseTime}
                    onChange={(e) => setAlertConfig(prev => ({ ...prev, responseTime: parseInt(e.target.value) }))}
                    className="w-20 px-2 py-1 text-sm border rounded"
                  />
                  <span className="text-sm text-muted-foreground">ms</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Memory Threshold</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={alertConfig.memoryThreshold}
                    onChange={(e) => setAlertConfig(prev => ({ ...prev, memoryThreshold: parseInt(e.target.value) }))}
                    className="w-20 px-2 py-1 text-sm border rounded"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Slack Alerts</span>
                <Switch
                  checked={alertConfig.enableSlackAlerts}
                  onCheckedChange={(checked) => setAlertConfig(prev => ({ ...prev, enableSlackAlerts: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Alerts</span>
                <Switch
                  checked={alertConfig.enableEmailAlerts}
                  onCheckedChange={(checked) => setAlertConfig(prev => ({ ...prev, enableEmailAlerts: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Logs */}
        {errorLogs && Array.isArray(errorLogs) && errorLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Recent Error Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {errorLogs.slice(0, 10).map((error, index: number) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-800">{error.message}</span>
                      <span className="text-xs text-red-600">{new Date(error.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {error.stack && (
                      <pre className="text-xs text-red-700 mt-2 overflow-x-auto">{error.stack}</pre>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}