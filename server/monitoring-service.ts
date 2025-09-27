/**
 * Advanced Monitoring Service
 * 
 * Provides real-time system monitoring, alerting, and performance tracking
 * for ReturnIt's infrastructure scaling needs.
 */

import { EventEmitter } from 'events';
import { PerformanceService } from './performance.js';
import { checkDatabaseHealth } from './db.js';

export interface Alert {
  id: string;
  type: 'performance' | 'memory' | 'database' | 'error' | 'business';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  metadata?: any;
}

export interface SystemMetrics {
  timestamp: string;
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  memory: {
    usedPercent: number;
    heapUsed: number;
    heapTotal: number;
  };
  database: {
    healthy: boolean;
    responseTime: number;
    connectionCount?: number;
  };
  requests: {
    total: number;
    errorRate: number;
    rps: number; // requests per second
  };
  business: {
    activeUsers: number;
    ordersToday: number;
    revenueToday: number;
  };
}

export interface AlertThresholds {
  responseTime: number; // milliseconds
  memoryUsage: number; // percentage
  errorRate: number; // percentage
  databaseResponseTime: number; // milliseconds
}

class MonitoringService extends EventEmitter {
  private alerts: Map<string, Alert> = new Map();
  private metrics: SystemMetrics[] = [];
  private thresholds: AlertThresholds = {
    responseTime: 1000, // 1 second
    memoryUsage: 80, // 80%
    errorRate: 5, // 5%
    databaseResponseTime: 500, // 500ms
  };
  
  private metricsInterval?: NodeJS.Timeout;
  private alertCheckInterval?: NodeJS.Timeout;
  private isRunning = false;

  constructor() {
    super();
    this.setupEventHandlers();
  }

  /**
   * Start monitoring service
   */
  start(): void {
    if (this.isRunning) return;
    
    console.log('🔍 Starting advanced monitoring service...');
    
    // Collect metrics every 30 seconds
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 30000);
    
    // Check for alert conditions every 10 seconds
    this.alertCheckInterval = setInterval(() => {
      this.checkAlertConditions();
    }, 10000);
    
    this.isRunning = true;
    console.log('✅ Monitoring service started');
  }

  /**
   * Stop monitoring service
   */
  stop(): void {
    if (!this.isRunning) return;
    
    console.log('🛑 Stopping monitoring service...');
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }
    
    this.isRunning = false;
    console.log('✅ Monitoring service stopped');
  }

  /**
   * Collect current system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const performanceMetrics = PerformanceService.getMetrics();
      const memoryUsage = PerformanceService.getMemoryUsage();
      const dbHealth = await checkDatabaseHealth();
      
      // Calculate derived metrics
      const memoryPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
      
      const metrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        responseTime: {
          average: performanceMetrics.request_time?.average || 0,
          p95: this.calculatePercentile(95), // Would need request history
          p99: this.calculatePercentile(99),
        },
        memory: {
          usedPercent: memoryPercent,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
        },
        database: {
          healthy: dbHealth.healthy,
          responseTime: dbHealth.responseTime || 0,
        },
        requests: {
          total: performanceMetrics.request_time?.count || 0,
          errorRate: this.calculateErrorRate(),
          rps: this.calculateRequestsPerSecond(),
        },
        business: {
          activeUsers: await this.getActiveUsersCount(),
          ordersToday: await this.getTodayOrdersCount(),
          revenueToday: await this.getTodayRevenue(),
        },
      };
      
      // Store metrics (keep last 100 data points)
      this.metrics.push(metrics);
      if (this.metrics.length > 100) {
        this.metrics.shift();
      }
      
      // Emit metrics event for real-time updates
      this.emit('metrics', metrics);
      
    } catch (error) {
      console.error('Error collecting metrics:', error);
      this.createAlert({
        type: 'error',
        severity: 'warning',
        message: `Failed to collect system metrics: ${error}`,
        metadata: { error: String(error) }
      });
    }
  }

  /**
   * Check for alert conditions
   */
  private checkAlertConditions(): void {
    const latestMetrics = this.getLatestMetrics();
    if (!latestMetrics) return;

    // Response time alerts
    if (latestMetrics.responseTime.average > this.thresholds.responseTime) {
      this.createAlert({
        type: 'performance',
        severity: latestMetrics.responseTime.average > this.thresholds.responseTime * 2 ? 'critical' : 'warning',
        message: `High response time: ${Math.round(latestMetrics.responseTime.average)}ms (threshold: ${this.thresholds.responseTime}ms)`,
        metadata: { responseTime: latestMetrics.responseTime.average }
      });
    }

    // Memory usage alerts
    if (latestMetrics.memory.usedPercent > this.thresholds.memoryUsage) {
      this.createAlert({
        type: 'memory',
        severity: latestMetrics.memory.usedPercent > 90 ? 'critical' : 'warning',
        message: `High memory usage: ${latestMetrics.memory.usedPercent}% (threshold: ${this.thresholds.memoryUsage}%)`,
        metadata: { memoryPercent: latestMetrics.memory.usedPercent }
      });
    }

    // Database health alerts
    if (!latestMetrics.database.healthy) {
      this.createAlert({
        type: 'database',
        severity: 'critical',
        message: 'Database health check failed',
        metadata: { dbResponseTime: latestMetrics.database.responseTime }
      });
    } else if (latestMetrics.database.responseTime > this.thresholds.databaseResponseTime) {
      this.createAlert({
        type: 'database',
        severity: 'warning',
        message: `Slow database response: ${latestMetrics.database.responseTime}ms (threshold: ${this.thresholds.databaseResponseTime}ms)`,
        metadata: { dbResponseTime: latestMetrics.database.responseTime }
      });
    }

    // Error rate alerts
    if (latestMetrics.requests.errorRate > this.thresholds.errorRate) {
      this.createAlert({
        type: 'error',
        severity: latestMetrics.requests.errorRate > 10 ? 'critical' : 'warning',
        message: `High error rate: ${latestMetrics.requests.errorRate}% (threshold: ${this.thresholds.errorRate}%)`,
        metadata: { errorRate: latestMetrics.requests.errorRate }
      });
    }
  }

  /**
   * Create a new alert
   */
  private createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
      ...alertData
    };

    // Check if similar alert already exists (prevent spam)
    const existingSimilar = Array.from(this.alerts.values()).find(
      existing => existing.type === alert.type && 
                 existing.severity === alert.severity && 
                 !existing.resolved &&
                 Date.now() - new Date(existing.timestamp).getTime() < 300000 // 5 minutes
    );

    if (existingSimilar) {
      return; // Don't create duplicate alerts
    }

    this.alerts.set(alert.id, alert);
    
    console.log(`🚨 Alert created: [${alert.severity.toUpperCase()}] ${alert.message}`);
    
    // Emit alert event
    this.emit('alert', alert);
    
    // Auto-resolve alerts after 30 minutes if not manually resolved
    setTimeout(() => {
      this.resolveAlert(alert.id);
    }, 1800000); // 30 minutes
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      this.emit('alertResolved', alert);
    }
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): SystemMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(limit: number = 50): SystemMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Update alert thresholds
   */
  updateThresholds(newThresholds: Partial<AlertThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('📊 Alert thresholds updated:', this.thresholds);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle critical alerts
    this.on('alert', (alert: Alert) => {
      if (alert.severity === 'critical') {
        // Could integrate with Slack, email, or other notification systems
        console.error(`🔥 CRITICAL ALERT: ${alert.message}`);
      }
    });
  }

  // Helper methods for metric calculations
  private calculatePercentile(percentile: number): number {
    // Simplified percentile calculation - would need request history for accuracy
    const metrics = PerformanceService.getMetrics();
    return metrics.request_time?.max || 0;
  }

  private calculateErrorRate(): number {
    // This would need error tracking - simplified for now
    return 0;
  }

  private calculateRequestsPerSecond(): number {
    // This would need time-based request tracking - simplified for now
    const metrics = PerformanceService.getMetrics();
    return Math.round((metrics.request_time?.count || 0) / 60); // Rough estimate
  }

  private async getActiveUsersCount(): Promise<number> {
    // This would query active sessions or recent activity
    return 0;
  }

  private async getTodayOrdersCount(): Promise<number> {
    // This would query orders from today
    return 0;
  }

  private async getTodayRevenue(): Promise<number> {
    // This would calculate today's revenue
    return 0;
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Auto-start monitoring when imported
if (process.env.NODE_ENV !== 'test') {
  monitoringService.start();
}

export default monitoringService;