import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, RefreshCcw, Activity, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import PerformanceCard from "@/components/admin/PerformanceCard";

export default function SystemMetrics() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [uptime, setUptime] = useState(99.9);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = () => {
    setMetrics([
      { time: '1AM', load: 0.3, requests: 120 },
      { time: '3AM', load: 0.4, requests: 140 },
      { time: '5AM', load: 0.35, requests: 130 },
      { time: '7AM', load: 0.5, requests: 250 },
      { time: '9AM', load: 0.7, requests: 420 },
      { time: '11AM', load: 0.6, requests: 380 },
      { time: '1PM', load: 0.8, requests: 550 },
      { time: '3PM', load: 0.9, requests: 620 },
    ]);
    setLastRefresh(new Date());
  };

  const handleRefresh = () => {
    loadMetrics();
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PerformanceCard
          title="API Uptime"
          value={`${uptime}%`}
          icon={Activity}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          testId="metric-uptime"
        />
        <PerformanceCard
          title="Error Rate"
          value="0.4%"
          icon={AlertCircle}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          testId="metric-error-rate"
        />
        <PerformanceCard
          title="Avg Response"
          value="220ms"
          icon={Monitor}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          testId="metric-response-time"
        />
      </div>

      {/* System Load Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            System Load Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
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
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
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
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-[#B8956A]">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Database</span>
              </div>
              <span className="text-sm text-green-700">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">API Server</span>
              </div>
              <span className="text-sm text-green-700">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">WebSocket Service</span>
              </div>
              <span className="text-sm text-green-700">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Stripe Integration</span>
              </div>
              <span className="text-sm text-green-700">Operational</span>
            </div>

            <div className="text-xs text-muted-foreground text-center pt-2">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
