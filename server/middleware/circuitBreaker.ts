import { log } from '../vite';
import { createStructuredError, ErrorCategory, ErrorSeverity } from './errorHandler';

// Circuit breaker states
export enum CircuitState {
  CLOSED = 'closed',      // Normal operation
  OPEN = 'open',          // Circuit is open, rejecting requests
  HALF_OPEN = 'half_open' // Testing if service is back up
}

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  failureThreshold: number;     // Number of failures before opening circuit
  timeoutMs: number;           // Timeout for individual requests
  resetTimeoutMs: number;      // Time to wait before trying half-open
  monitoringWindowMs: number;  // Time window for tracking failures
  successThreshold: number;    // Successful calls needed to close circuit in half-open state
}

// Default configurations for different services
export const DEFAULT_CONFIGS = {
  stripe: {
    failureThreshold: 5,
    timeoutMs: 30000,
    resetTimeoutMs: 60000,
    monitoringWindowMs: 120000,
    successThreshold: 3
  },
  database: {
    failureThreshold: 3,
    timeoutMs: 10000,
    resetTimeoutMs: 30000,
    monitoringWindowMs: 60000,
    successThreshold: 2
  },
  sms: {
    failureThreshold: 5,
    timeoutMs: 15000,
    resetTimeoutMs: 45000,
    monitoringWindowMs: 90000,
    successThreshold: 2
  },
  webhook: {
    failureThreshold: 10,
    timeoutMs: 20000,
    resetTimeoutMs: 120000,
    monitoringWindowMs: 300000,
    successThreshold: 5
  }
};

// Call result tracking
interface CallResult {
  timestamp: Date;
  success: boolean;
  duration: number;
  error?: any;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: CallResult[] = [];
  private successes: CallResult[] = [];
  private lastFailureTime: Date | null = null;
  private consecutiveSuccesses = 0;
  private stateChangeListeners: Array<(state: CircuitState, serviceName: string) => void> = [];

  constructor(
    private serviceName: string,
    private config: CircuitBreakerConfig
  ) {}

  // Register listener for state changes
  onStateChange(listener: (state: CircuitState, serviceName: string) => void) {
    this.stateChangeListeners.push(listener);
  }

  // Notify listeners of state change
  private notifyStateChange(newState: CircuitState) {
    if (newState !== this.state) {
      log(`🔄 Circuit breaker for ${this.serviceName} changed from ${this.state} to ${newState}`, 'circuit-breaker');
      this.state = newState;
      this.stateChangeListeners.forEach(listener => listener(newState, this.serviceName));
    }
  }

  // Clean old call results outside monitoring window
  private cleanOldResults() {
    const cutoff = new Date(Date.now() - this.config.monitoringWindowMs);
    this.failures = this.failures.filter(f => f.timestamp > cutoff);
    this.successes = this.successes.filter(s => s.timestamp > cutoff);
  }

  // Check if circuit should open
  private shouldOpen(): boolean {
    this.cleanOldResults();
    return this.failures.length >= this.config.failureThreshold;
  }

  // Check if circuit should close (from half-open)
  private shouldClose(): boolean {
    return this.consecutiveSuccesses >= this.config.successThreshold;
  }

  // Check if circuit should try half-open (from open)
  private shouldTryHalfOpen(): boolean {
    if (!this.lastFailureTime) return false;
    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.config.resetTimeoutMs;
  }

  // Record successful call
  private recordSuccess(duration: number) {
    const result: CallResult = {
      timestamp: new Date(),
      success: true,
      duration
    };
    
    this.successes.push(result);
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.consecutiveSuccesses++;
      if (this.shouldClose()) {
        this.notifyStateChange(CircuitState.CLOSED);
        this.consecutiveSuccesses = 0;
      }
    }
  }

  // Record failed call
  private recordFailure(duration: number, error: any) {
    const result: CallResult = {
      timestamp: new Date(),
      success: false,
      duration,
      error
    };
    
    this.failures.push(result);
    this.lastFailureTime = new Date();
    this.consecutiveSuccesses = 0;
    
    if (this.state === CircuitState.CLOSED && this.shouldOpen()) {
      this.notifyStateChange(CircuitState.OPEN);
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.notifyStateChange(CircuitState.OPEN);
    }
  }

  // Execute function with circuit breaker protection
  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    // Check if we should transition to half-open
    if (this.state === CircuitState.OPEN && this.shouldTryHalfOpen()) {
      this.notifyStateChange(CircuitState.HALF_OPEN);
    }

    // If circuit is open, reject immediately or use fallback
    if (this.state === CircuitState.OPEN) {
      const error = createStructuredError(
        `Circuit breaker for ${this.serviceName} is OPEN - service unavailable`,
        503,
        ErrorCategory.EXTERNAL_SERVICE,
        ErrorSeverity.HIGH,
        { 
          serviceName: this.serviceName,
          circuitState: this.state,
          failureCount: this.failures.length
        }
      );

      if (fallback) {
        log(`⚡ Circuit OPEN for ${this.serviceName}, using fallback`, 'circuit-breaker');
        return await fallback();
      }

      throw error;
    }

    // Execute the function with timeout
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Circuit breaker timeout')), this.config.timeoutMs)
        )
      ]);
      
      const duration = Date.now() - startTime;
      this.recordSuccess(duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordFailure(duration, error);
      
      // If we have a fallback and this is a failure, try fallback
      if (fallback && this.state !== CircuitState.HALF_OPEN) {
        log(`⚡ ${this.serviceName} failed, using fallback`, 'circuit-breaker');
        return await fallback();
      }
      
      throw error;
    }
  }

  // Get current circuit breaker status
  getStatus() {
    this.cleanOldResults();
    
    return {
      serviceName: this.serviceName,
      state: this.state,
      failureCount: this.failures.length,
      successCount: this.successes.length,
      consecutiveSuccesses: this.consecutiveSuccesses,
      lastFailureTime: this.lastFailureTime,
      config: this.config,
      recentFailures: this.failures.slice(-3), // Last 3 failures
      healthScore: this.calculateHealthScore()
    };
  }

  // Calculate health score (0-100)
  private calculateHealthScore(): number {
    if (this.state === CircuitState.OPEN) return 0;
    
    const totalCalls = this.failures.length + this.successes.length;
    if (totalCalls === 0) return 100;
    
    const successRate = this.successes.length / totalCalls;
    return Math.round(successRate * 100);
  }

  // Force circuit to a specific state (for testing/admin)
  forceState(state: CircuitState) {
    this.notifyStateChange(state);
    if (state === CircuitState.CLOSED) {
      this.consecutiveSuccesses = 0;
      this.failures = [];
    }
  }
}

// Circuit breaker registry
class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  // Get or create circuit breaker for service
  get(serviceName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      const defaultConfig = DEFAULT_CONFIGS[serviceName as keyof typeof DEFAULT_CONFIGS] || DEFAULT_CONFIGS.stripe;
      const finalConfig = { ...defaultConfig, ...config };
      
      const breaker = new CircuitBreaker(serviceName, finalConfig);
      
      // Set up state change logging
      breaker.onStateChange((state, service) => {
        if (state === CircuitState.OPEN) {
          log(`🚨 Circuit breaker OPENED for ${service} - blocking requests`, 'circuit-breaker');
        } else if (state === CircuitState.CLOSED) {
          log(`✅ Circuit breaker CLOSED for ${service} - service restored`, 'circuit-breaker');
        } else if (state === CircuitState.HALF_OPEN) {
          log(`⚡ Circuit breaker HALF-OPEN for ${service} - testing service`, 'circuit-breaker');
        }
      });
      
      this.breakers.set(serviceName, breaker);
    }
    
    return this.breakers.get(serviceName)!;
  }

  // Get status of all circuit breakers
  getAllStatus() {
    const status: Record<string, any> = {};
    this.breakers.forEach((breaker, name) => {
      status[name] = breaker.getStatus();
    });
    return status;
  }

  // Get health summary
  getHealthSummary() {
    const statuses = this.getAllStatus();
    const serviceCount = Object.keys(statuses).length;
    
    if (serviceCount === 0) {
      return { status: 'healthy', openCircuits: 0, totalCircuits: 0 };
    }
    
    const openCircuits = Object.values(statuses).filter(s => s.state === CircuitState.OPEN).length;
    const halfOpenCircuits = Object.values(statuses).filter(s => s.state === CircuitState.HALF_OPEN).length;
    
    return {
      status: openCircuits > 0 ? 'degraded' : halfOpenCircuits > 0 ? 'recovering' : 'healthy',
      openCircuits,
      halfOpenCircuits,
      totalCircuits: serviceCount,
      services: statuses
    };
  }
}

// Global circuit breaker registry
export const circuitBreakers = new CircuitBreakerRegistry();

// Convenience functions for common services
export const stripeCircuitBreaker = () => circuitBreakers.get('stripe');
export const databaseCircuitBreaker = () => circuitBreakers.get('database');
export const smsCircuitBreaker = () => circuitBreakers.get('sms');
export const webhookCircuitBreaker = () => circuitBreakers.get('webhook');