import { log } from '../vite';
import { createStructuredError, ErrorCategory, ErrorSeverity } from './errorHandler';

// Crash recovery configuration
export interface CrashRecoveryConfig {
  maxRestarts: number;
  restartWindowMs: number;
  healthCheckIntervalMs: number;
  memoryThresholdMB: number;
  cpuThresholdPercent: number;
  gracefulShutdownTimeoutMs: number;
}

// Default configuration
const DEFAULT_CONFIG: CrashRecoveryConfig = {
  maxRestarts: 5,              // Max restarts in window
  restartWindowMs: 300000,     // 5 minutes
  healthCheckIntervalMs: 30000, // 30 seconds
  memoryThresholdMB: 1024,     // 1GB memory threshold
  cpuThresholdPercent: 90,     // 90% CPU threshold
  gracefulShutdownTimeoutMs: 10000 // 10 seconds
};

// Restart tracking
interface RestartRecord {
  timestamp: Date;
  reason: string;
  success: boolean;
}

class CrashRecoveryService {
  private config: CrashRecoveryConfig;
  private restartHistory: RestartRecord[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isShuttingDown = false;
  private startTime = new Date();

  constructor(config: Partial<CrashRecoveryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupProcessHandlers();
    this.startHealthChecks();
    
    log('🛡️ Crash recovery service initialized', 'crash-recovery');
  }

  // Setup process event handlers
  private setupProcessHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleCriticalError('uncaughtException', error);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.handleCriticalError('unhandledRejection', reason);
    });

    // Handle memory warnings
    process.on('warning', (warning) => {
      if (warning.name === 'MaxListenersExceededWarning' || 
          warning.message.includes('memory')) {
        log(`⚠️ Process warning: ${warning.message}`, 'crash-recovery');
        this.checkMemoryUsage();
      }
    });

    // Handle graceful shutdown signals
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    
    log('✅ Process handlers configured for crash recovery', 'crash-recovery');
  }

  // Handle critical errors
  private async handleCriticalError(type: string, error: any) {
    const errorObj = createStructuredError(
      `Critical ${type}: ${error?.message || error}`,
      500,
      ErrorCategory.SYSTEM,
      ErrorSeverity.CRITICAL,
      { 
        type, 
        error: error?.stack || error,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    );

    log(`🔥 CRITICAL ERROR DETECTED: ${type}`, 'crash-recovery');
    console.error('Critical error details:', {
      type,
      error: error?.message || error,
      stack: error?.stack,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    });

    // Attempt graceful recovery
    if (this.shouldAttemptRestart()) {
      await this.attemptRestart(type);
    } else {
      log('❌ Max restart attempts reached, allowing process to exit', 'crash-recovery');
      process.exit(1);
    }
  }

  // Check if we should attempt restart
  private shouldAttemptRestart(): boolean {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.restartWindowMs);
    
    // Count restarts in the current window
    const recentRestarts = this.restartHistory.filter(r => r.timestamp > windowStart);
    
    return recentRestarts.length < this.config.maxRestarts;
  }

  // Attempt automatic restart
  private async attemptRestart(reason: string) {
    if (this.isShuttingDown) return;
    
    log(`🔄 Attempting automatic restart due to: ${reason}`, 'crash-recovery');
    
    // Record restart attempt
    this.restartHistory.push({
      timestamp: new Date(),
      reason,
      success: false // Will be updated if successful
    });

    try {
      // Cleanup resources
      await this.cleanupResources();
      
      // In a production environment, you would use a process manager like PM2
      // For now, we'll prepare for restart and exit gracefully
      log('🔄 Restart initiated - process manager should restart the service', 'crash-recovery');
      
      // Mark last restart as successful
      if (this.restartHistory.length > 0) {
        this.restartHistory[this.restartHistory.length - 1].success = true;
      }
      
      // Exit with code 1 to trigger restart by process manager
      process.exit(1);
      
    } catch (restartError) {
      log(`❌ Restart attempt failed: ${restartError}`, 'crash-recovery');
      process.exit(1);
    }
  }

  // Cleanup resources before restart
  private async cleanupResources() {
    log('🧹 Cleaning up resources before restart...', 'crash-recovery');
    
    try {
      // Stop health checks
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      // Give active requests time to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      log('✅ Resource cleanup completed', 'crash-recovery');
    } catch (error) {
      log(`⚠️ Resource cleanup error: ${error}`, 'crash-recovery');
    }
  }

  // Start periodic health checks
  private startHealthChecks() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckIntervalMs);
    
    log('💓 Health checks started', 'crash-recovery');
  }

  // Perform system health check
  private performHealthCheck() {
    try {
      const memory = process.memoryUsage();
      const memoryUsageMB = memory.heapUsed / 1024 / 1024;
      
      // Check memory usage
      if (memoryUsageMB > this.config.memoryThresholdMB) {
        log(`⚠️ High memory usage detected: ${memoryUsageMB.toFixed(2)}MB`, 'crash-recovery');
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          log('🧹 Forced garbage collection', 'crash-recovery');
        }
        
        // If still high after GC, consider restart
        const newMemory = process.memoryUsage().heapUsed / 1024 / 1024;
        if (newMemory > this.config.memoryThresholdMB * 0.9) {
          log('🚨 Memory usage still high after GC, flagging for potential restart', 'crash-recovery');
        }
      }
      
      // Check uptime (restart if running too long)
      const uptimeHours = process.uptime() / 3600;
      if (uptimeHours > 168) { // 7 days
        log(`ℹ️ Long uptime detected: ${uptimeHours.toFixed(1)} hours`, 'crash-recovery');
      }
      
    } catch (error) {
      log(`❌ Health check error: ${error}`, 'crash-recovery');
    }
  }

  // Check memory usage
  private checkMemoryUsage() {
    const memory = process.memoryUsage();
    const memoryUsageMB = memory.heapUsed / 1024 / 1024;
    
    log(`🧠 Memory usage: ${memoryUsageMB.toFixed(2)}MB (RSS: ${(memory.rss / 1024 / 1024).toFixed(2)}MB)`, 'crash-recovery');
    
    if (memoryUsageMB > this.config.memoryThresholdMB) {
      log(`⚠️ Memory threshold exceeded: ${memoryUsageMB.toFixed(2)}MB > ${this.config.memoryThresholdMB}MB`, 'crash-recovery');
    }
  }

  // Graceful shutdown
  private async gracefulShutdown(signal: string) {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    log(`🛑 Graceful shutdown initiated by ${signal}`, 'crash-recovery');
    
    try {
      // Stop accepting new requests (would be handled by Express server)
      
      // Stop health checks
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      // Wait for ongoing requests to complete
      await Promise.race([
        new Promise(resolve => setTimeout(resolve, this.config.gracefulShutdownTimeoutMs)),
        this.waitForActiveRequests()
      ]);
      
      log('✅ Graceful shutdown completed', 'crash-recovery');
      process.exit(0);
      
    } catch (error) {
      log(`❌ Graceful shutdown error: ${error}`, 'crash-recovery');
      process.exit(1);
    }
  }

  // Wait for active requests to complete
  private async waitForActiveRequests(): Promise<void> {
    // In a production app, you would track active requests
    // For now, just wait a bit for any ongoing operations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Get crash recovery status
  getStatus() {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.restartWindowMs);
    const recentRestarts = this.restartHistory.filter(r => r.timestamp > windowStart);
    
    return {
      uptime: process.uptime(),
      startTime: this.startTime,
      memoryUsage: process.memoryUsage(),
      restartHistory: this.restartHistory.slice(-10), // Last 10 restarts
      recentRestarts: recentRestarts.length,
      maxRestarts: this.config.maxRestarts,
      healthChecksActive: this.healthCheckInterval !== null,
      config: this.config
    };
  }

  // Force restart (for admin use)
  async forceRestart(reason: string = 'admin_requested') {
    log(`🔄 Force restart requested: ${reason}`, 'crash-recovery');
    await this.attemptRestart(reason);
  }

  // Stop crash recovery service
  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    log('🛑 Crash recovery service stopped', 'crash-recovery');
  }
}

// Global instance
export const crashRecovery = new CrashRecoveryService();

// Get crash recovery status
export const getCrashRecoveryStatus = () => crashRecovery.getStatus();