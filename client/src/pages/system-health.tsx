import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth-simple';
import { Link } from 'wouter';
import { 
  Activity, 
  Database, 
  Wifi, 
  Server,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HealthCheckResponse {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    api: { status: string; responseTime: number };
    database: { status: string; responseTime: number };
    websocket: { status: string; connections: number };
    storage: { status: string };
  };
}

export default function SystemHealth() {
  const { user, isAuthenticated } = useAuth();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: healthData, isLoading, refetch } = useQuery<HealthCheckResponse>({
    queryKey: ['/api/admin/system-health'],
    refetchInterval: autoRefresh ? 5000 : false,
    enabled: isAuthenticated && user?.isAdmin,
  });

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F4] to-[#E8E3D6] flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Admin access required</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F4] to-[#E8E3D6] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin-dashboard">
              <Button variant="ghost" size="sm" className="text-[#8B6F47]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#8B6F47]">System Health</h1>
              <p className="text-sm text-[#A0805A]">Real-time monitoring dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 text-green-700 border-green-200' : ''}
              data-testid="button-toggle-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="button-manual-refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        {healthData && (
          <Card className="mb-6 bg-white border-[#D4C4A8]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(healthData.status)}
                  <div>
                    <CardTitle>Overall System Status</CardTitle>
                    <CardDescription>
                      Last checked: {new Date(healthData.timestamp).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(healthData.status)}>
                  {healthData.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Service Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* API Service */}
          <Card className="bg-white border-[#D4C4A8]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Server className="h-8 w-8 text-[#B8956A]" />
                {healthData && getStatusIcon(healthData.services.api.status)}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-1">API Service</h3>
              <div className="space-y-1">
                <Badge className={healthData ? getStatusColor(healthData.services.api.status) : ''}>
                  {healthData?.services.api.status || 'Unknown'}
                </Badge>
                {healthData && (
                  <p className="text-sm text-gray-600">
                    Response time: {healthData.services.api.responseTime}ms
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Database Service */}
          <Card className="bg-white border-[#D4C4A8]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Database className="h-8 w-8 text-[#B8956A]" />
                {healthData && getStatusIcon(healthData.services.database.status)}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-1">Database</h3>
              <div className="space-y-1">
                <Badge className={healthData ? getStatusColor(healthData.services.database.status) : ''}>
                  {healthData?.services.database.status || 'Unknown'}
                </Badge>
                {healthData && (
                  <p className="text-sm text-gray-600">
                    Query time: {healthData.services.database.responseTime}ms
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* WebSocket Service */}
          <Card className="bg-white border-[#D4C4A8]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Wifi className="h-8 w-8 text-[#B8956A]" />
                {healthData && getStatusIcon(healthData.services.websocket.status)}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-1">WebSocket</h3>
              <div className="space-y-1">
                <Badge className={healthData ? getStatusColor(healthData.services.websocket.status) : ''}>
                  {healthData?.services.websocket.status || 'Unknown'}
                </Badge>
                {healthData && (
                  <p className="text-sm text-gray-600">
                    {healthData.services.websocket.connections} active connections
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Storage Service */}
          <Card className="bg-white border-[#D4C4A8]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-[#B8956A]" />
                {healthData && getStatusIcon(healthData.services.storage.status)}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-1">Storage</h3>
              <div className="space-y-1">
                <Badge className={healthData ? getStatusColor(healthData.services.storage.status) : ''}>
                  {healthData?.services.storage.status || 'Unknown'}
                </Badge>
                <p className="text-sm text-gray-600">Object storage service</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        {healthData && (
          <Card className="mt-6 bg-white border-[#D4C4A8]">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Environment</p>
                  <p className="font-semibold">Production</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Platform</p>
                  <p className="font-semibold">Replit</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Database</p>
                  <p className="font-semibold">PostgreSQL (Neon)</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Last Updated</p>
                  <p className="font-semibold">{new Date(healthData.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
