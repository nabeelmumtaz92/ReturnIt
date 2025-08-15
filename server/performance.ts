import { LRUCache } from 'lru-cache';

// Performance optimization utilities
export class PerformanceService {
  private static cache = new LRUCache<string, any>({
    max: 500, // Maximum number of items
    ttl: 1000 * 60 * 5, // 5 minutes TTL
  });

  private static queryCache = new LRUCache<string, any>({
    max: 100,
    ttl: 1000 * 60 * 2, // 2 minutes for database queries
  });

  // Cache frequently accessed data
  static cacheSet(key: string, value: any, ttl?: number): void {
    if (ttl) {
      this.cache.set(key, value, { ttl });
    } else {
      this.cache.set(key, value);
    }
  }

  static cacheGet(key: string): any {
    return this.cache.get(key);
  }

  // Database query caching
  static cacheQuery(key: string, value: any): void {
    this.queryCache.set(key, value);
  }

  static getCachedQuery(key: string): any {
    return this.queryCache.get(key);
  }

  // Performance metrics tracking
  static trackMetric(name: string, value: number): void {
    const metrics = this.cacheGet('performance_metrics') || {};
    if (!metrics[name]) {
      metrics[name] = {
        count: 0,
        total: 0,
        average: 0,
        min: Infinity,
        max: 0,
      };
    }
    
    metrics[name].count++;
    metrics[name].total += value;
    metrics[name].average = metrics[name].total / metrics[name].count;
    metrics[name].min = Math.min(metrics[name].min, value);
    metrics[name].max = Math.max(metrics[name].max, value);
    
    this.cacheSet('performance_metrics', metrics, 1000 * 60 * 30); // 30 minutes
  }

  static getMetrics(): any {
    return this.cacheGet('performance_metrics') || {};
  }

  // Query optimization helpers
  static async withCache<T>(
    key: string, 
    fn: () => Promise<T>, 
    ttl: number = 1000 * 60 * 5
  ): Promise<T> {
    const cached = this.getCachedQuery(key);
    if (cached !== undefined) {
      return cached;
    }

    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    
    this.trackMetric('db_query_time', duration);
    this.cacheQuery(key);
    
    return result;
  }

  // Memory usage monitoring
  static getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  // Clear caches when needed
  static clearCache(): void {
    this.cache.clear();
    this.queryCache.clear();
  }

  // Health check endpoint data
  static getHealthStats(): any {
    const memUsage = this.getMemoryUsage();
    const metrics = this.getMetrics();
    
    return {
      uptime: process.uptime(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
      },
      cache: {
        mainCache: this.cache.size,
        queryCache: this.queryCache.size,
      },
      metrics,
    };
  }
}

// Middleware for response time tracking
export function performanceMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    PerformanceService.trackMetric('request_time', duration);
    PerformanceService.trackMetric(`${req.method}_${req.route?.path || 'unknown'}`, duration);
  });
  
  next();
}

// Database connection pool optimization
export const dbConfig = {
  max: 20, // Maximum number of connections
  min: 2,  // Minimum number of connections
  idle: 30000, // Close connections after 30 seconds of inactivity
  acquire: 60000, // Maximum time to get connection
  evict: 1000, // Check for idle connections every second
};