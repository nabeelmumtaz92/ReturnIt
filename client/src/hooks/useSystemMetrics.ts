import { useQuery } from '@tanstack/react-query';

export interface SystemHealth {
  uptime: number;
  memory: {
    used: number;
    total: number;
    external: number;
  };
  cache: {
    mainCache: number;
    queryCache: number;
  };
  metrics: any;
}

export interface PerformanceMetrics {
  request_time?: {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
  };
  db_query_time?: {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
  };
  db_health_check?: {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
  };
  [key: string]: any;
}

export function useSystemHealth() {
  return useQuery<SystemHealth>({
    queryKey: ['/api/health'],
    refetchInterval: 15000, // 15 seconds
  });
}

export function usePerformanceMetrics() {
  return useQuery<PerformanceMetrics>({
    queryKey: ['/api/performance/metrics'],
    refetchInterval: 30000, // 30 seconds
  });
}

// Hook for visitor analytics
export function useVisitorAnalytics() {
  return useQuery({
    queryKey: ['/api/analytics/visitors'],
    refetchInterval: 60000, // 1 minute
    retry: false, // Don't retry if endpoint doesn't exist yet
  });
}

export function useSystemMetrics() {
  const healthQuery = useSystemHealth();
  const performanceQuery = usePerformanceMetrics();
  const visitorQuery = useVisitorAnalytics();

  return {
    health: healthQuery.data,
    performance: performanceQuery.data,
    visitors: visitorQuery.data,
    isLoading: healthQuery.isLoading || performanceQuery.isLoading,
    isError: healthQuery.isError || performanceQuery.isError,
    refetch: () => {
      healthQuery.refetch();
      performanceQuery.refetch();
      visitorQuery.refetch();
    }
  };
}