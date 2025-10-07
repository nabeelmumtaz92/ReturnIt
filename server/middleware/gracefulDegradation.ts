import { log } from '../vite';
import { createStructuredError, ErrorCategory, ErrorSeverity } from './errorHandler';
import Stripe from 'stripe';

// Service degradation levels
export enum DegradationLevel {
  HEALTHY = 'healthy',           // All services working
  MINOR_DEGRADATION = 'minor',   // Non-critical features affected
  MAJOR_DEGRADATION = 'major',   // Core features affected but functioning
  CRITICAL_DEGRADATION = 'critical' // Only essential features working
}

// Service status tracking
interface ServiceStatus {
  name: string;
  isHealthy: boolean;
  lastChecked: Date;
  failureCount: number;
  degradationLevel: DegradationLevel;
  fallbackEnabled: boolean;
  criticalService: boolean; // Whether this service affects core functionality
}

// Degradation configuration
interface DegradationConfig {
  enableOfflineMode: boolean;
  queueFailedRequests: boolean;
  fallbackResponses: Record<string, any>;
  criticalServices: string[];
  gracefulTimeoutMs: number;
}

// Offline request queue item
interface QueuedRequest {
  id: string;
  service: string;
  endpoint: string;
  method: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  idempotencyKey?: string; // For safe retries (prevents duplicate charges)
}

// Default configuration
const DEFAULT_CONFIG: DegradationConfig = {
  enableOfflineMode: true,
  queueFailedRequests: true,
  fallbackResponses: {
    stripe: {
      payment_intent: { status: 'pending', message: 'Payment will be processed when service is restored' },
      refund: { status: 'queued', message: 'Refund will be processed when service is restored' }
    },
    sms: {
      notification: { status: 'queued', message: 'Notification will be sent when service is restored' }
    },
    webhook: {
      delivery: { status: 'queued', message: 'Webhook will be delivered when service is restored' }
    }
  },
  criticalServices: ['database', 'authentication'],
  gracefulTimeoutMs: 5000
};

class GracefulDegradationService {
  private services = new Map<string, ServiceStatus>();
  private requestQueue: QueuedRequest[] = [];
  private config: DegradationConfig;
  private processingQueue = false;

  constructor(config: Partial<DegradationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize known services
    this.initializeServices();
    
    // Start queue processing
    this.startQueueProcessor();
    
    log('🛡️ Graceful degradation service initialized', 'degradation');
  }

  private initializeServices() {
    const services = [
      { name: 'database', critical: true },
      { name: 'stripe', critical: false },
      { name: 'sms', critical: false },
      { name: 'webhook', critical: false },
      { name: 'analytics', critical: false }
    ];

    for (const service of services) {
      this.services.set(service.name, {
        name: service.name,
        isHealthy: true,
        lastChecked: new Date(),
        failureCount: 0,
        degradationLevel: DegradationLevel.HEALTHY,
        fallbackEnabled: false,
        criticalService: service.critical
      });
    }
  }

  // Mark a service as failed
  markServiceFailed(serviceName: string, error?: any) {
    const service = this.services.get(serviceName);
    if (!service) {
      log(`⚠️ Unknown service marked as failed: ${serviceName}`, 'degradation');
      return;
    }

    service.isHealthy = false;
    service.failureCount++;
    service.lastChecked = new Date();
    service.fallbackEnabled = true;

    // Determine degradation level based on failure count and service criticality
    if (service.criticalService) {
      service.degradationLevel = service.failureCount > 3 ? DegradationLevel.CRITICAL_DEGRADATION : DegradationLevel.MAJOR_DEGRADATION;
    } else {
      service.degradationLevel = service.failureCount > 5 ? DegradationLevel.MAJOR_DEGRADATION : DegradationLevel.MINOR_DEGRADATION;
    }

    log(`🚨 Service ${serviceName} marked as failed (count: ${service.failureCount}, level: ${service.degradationLevel})`, 'degradation');

    // Log structured error
    const error_obj = createStructuredError(
      `Service ${serviceName} failed`,
      503,
      ErrorCategory.EXTERNAL_SERVICE,
      service.criticalService ? ErrorSeverity.CRITICAL : ErrorSeverity.MEDIUM,
      { serviceName, failureCount: service.failureCount, error: error?.message }
    );
  }

  // Mark a service as healthy
  markServiceHealthy(serviceName: string) {
    const service = this.services.get(serviceName);
    if (!service) return;

    const wasUnhealthy = !service.isHealthy;
    
    service.isHealthy = true;
    service.failureCount = 0;
    service.lastChecked = new Date();
    service.degradationLevel = DegradationLevel.HEALTHY;
    service.fallbackEnabled = false;

    if (wasUnhealthy) {
      log(`✅ Service ${serviceName} restored to healthy`, 'degradation');
    }
  }

  // Get overall system degradation level
  getSystemDegradationLevel(): DegradationLevel {
    let maxDegradation = DegradationLevel.HEALTHY;

    for (const service of Array.from(this.services.values())) {
      if (service.degradationLevel === DegradationLevel.CRITICAL_DEGRADATION) {
        return DegradationLevel.CRITICAL_DEGRADATION;
      }
      if (service.degradationLevel === DegradationLevel.MAJOR_DEGRADATION) {
        maxDegradation = DegradationLevel.MAJOR_DEGRADATION;
      } else if (service.degradationLevel === DegradationLevel.MINOR_DEGRADATION && maxDegradation === DegradationLevel.HEALTHY) {
        maxDegradation = DegradationLevel.MINOR_DEGRADATION;
      }
    }

    return maxDegradation;
  }

  // Execute function with graceful degradation
  async executeWithFallback<T>(
    serviceName: string,
    primaryFunction: () => Promise<T>,
    fallbackFunction?: () => Promise<T>
  ): Promise<T> {
    const service = this.services.get(serviceName);
    
    // If service is known to be unhealthy and we have a fallback, use it immediately
    if (service && !service.isHealthy && fallbackFunction) {
      log(`🔄 Using fallback for ${serviceName} (service marked unhealthy)`, 'degradation');
      return await fallbackFunction();
    }

    try {
      const result = await Promise.race([
        primaryFunction(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Service timeout')), this.config.gracefulTimeoutMs)
        )
      ]);

      // Mark service as healthy on success
      this.markServiceHealthy(serviceName);
      return result;

    } catch (error) {
      log(`⚠️ Primary function failed for ${serviceName}: ${error}`, 'degradation');
      
      // Mark service as failed
      this.markServiceFailed(serviceName, error);

      // Try fallback if available
      if (fallbackFunction) {
        log(`🔄 Using fallback for ${serviceName}`, 'degradation');
        try {
          return await fallbackFunction();
        } catch (fallbackError) {
          log(`❌ Fallback also failed for ${serviceName}: ${fallbackError}`, 'degradation');
          throw fallbackError;
        }
      }

      // No fallback available, throw original error
      throw error;
    }
  }

  // Queue a failed request for later retry
  queueRequest(
    service: string,
    endpoint: string,
    method: string,
    data: any,
    maxRetries: number = 3
  ): string {
    if (!this.config.queueFailedRequests) {
      throw new Error('Request queueing is disabled');
    }

    const requestId = `${service}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedRequest: QueuedRequest = {
      id: requestId,
      service,
      endpoint,
      method,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries
    };

    this.requestQueue.push(queuedRequest);
    
    log(`📥 Queued request ${requestId} for ${service}${endpoint}`, 'degradation');
    
    return requestId;
  }

  // Get fallback response for a service
  getFallbackResponse(serviceName: string, operation: string): any {
    const fallbacks = this.config.fallbackResponses[serviceName];
    return fallbacks?.[operation] || {
      status: 'degraded',
      message: 'Service temporarily unavailable - operating in degraded mode'
    };
  }

  // Start processing queued requests
  private startQueueProcessor() {
    setInterval(async () => {
      if (this.processingQueue || this.requestQueue.length === 0) return;
      
      this.processingQueue = true;
      await this.processQueue();
      this.processingQueue = false;
    }, 30000); // Process queue every 30 seconds
  }

  // Process queued requests with service-specific retry logic
  private async processQueue() {
    const retryRequests = [...this.requestQueue];
    this.requestQueue = [];

    for (const request of retryRequests) {
      const service = this.services.get(request.service);
      
      // Only retry if service is healthy or max retries not reached
      if (service?.isHealthy || request.retryCount < request.maxRetries) {
        try {
          log(`🔄 Retrying queued request ${request.id} for ${request.service}`, 'degradation');
          
          // Service-specific retry logic
          await this.executeServiceRequest(request);
          
          log(`✅ Successfully processed queued request ${request.id}`, 'degradation');
          
        } catch (error) {
          request.retryCount++;
          
          if (request.retryCount < request.maxRetries) {
            // Re-queue with exponential backoff
            this.requestQueue.push(request);
            log(`🔄 Re-queued request ${request.id} (retry ${request.retryCount}/${request.maxRetries})`, 'degradation');
          } else {
            log(`❌ Failed to process request ${request.id} after ${request.maxRetries} retries`, 'degradation');
          }
        }
      }
    }
  }

  // Execute service-specific request retry logic
  private async executeServiceRequest(request: QueuedRequest): Promise<void> {
    switch (request.service) {
      case 'stripe':
        // Retry Stripe payment operations with actual Stripe client + idempotency key
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
          log(`⚠️ Stripe key not configured, cannot retry payment`, 'degradation');
          throw new Error('Stripe not configured');
        }
        
        const stripe = new Stripe(stripeKey, { apiVersion: '2025-07-30.basil' });
        
        // Use idempotency key to prevent duplicate charges - must be same key on every retry
        const idempotencyKey = request.idempotencyKey || `retry_${request.id}`;
        
        if (request.endpoint.includes('payment_intent')) {
          log(`💳 Retrying Stripe payment intent for ${request.id} (idempotency: ${idempotencyKey})`, 'degradation');
          await stripe.paymentIntents.create(request.data, {
            idempotencyKey
          });
        } else if (request.endpoint.includes('refund')) {
          log(`💰 Retrying Stripe refund for ${request.id} (idempotency: ${idempotencyKey})`, 'degradation');
          await stripe.refunds.create(request.data, {
            idempotencyKey
          });
        } else if (request.endpoint.includes('transfer')) {
          log(`💸 Retrying Stripe transfer for ${request.id} (idempotency: ${idempotencyKey})`, 'degradation');
          await stripe.transfers.create(request.data, {
            idempotencyKey
          });
        }
        break;

      case 'sms':
        // Retry SMS notifications - using a generic HTTP approach
        // Note: Actual SMS provider integration would go here
        log(`📱 Retrying SMS notification for ${request.id}`, 'degradation');
        if (request.endpoint) {
          const smsResponse = await fetch(request.endpoint, {
            method: request.method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.data)
          });
          if (!smsResponse.ok) {
            throw new Error(`SMS delivery failed: ${smsResponse.status}`);
          }
        }
        break;

      case 'webhook':
        // Retry webhook deliveries
        log(`🔗 Retrying webhook delivery for ${request.id}`, 'degradation');
        const webhookResponse = await fetch(request.endpoint, {
          method: request.method,
          headers: { 
            'Content-Type': 'application/json',
            ...(request.data.headers || {})
          },
          body: JSON.stringify(request.data.payload || request.data)
        });
        if (!webhookResponse.ok) {
          throw new Error(`Webhook delivery failed: ${webhookResponse.status}`);
        }
        break;

      case 'analytics':
        // Retry analytics events via HTTP
        log(`📊 Retrying analytics event for ${request.id}`, 'degradation');
        if (request.endpoint) {
          const analyticsResponse = await fetch(request.endpoint, {
            method: request.method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.data)
          });
          if (!analyticsResponse.ok) {
            throw new Error(`Analytics tracking failed: ${analyticsResponse.status}`);
          }
        }
        break;

      default:
        log(`⚠️ Unknown service type for retry: ${request.service}`, 'degradation');
    }
  }

  // Get system status
  getSystemStatus() {
    const systemLevel = this.getSystemDegradationLevel();
    const services = Array.from(this.services.values());
    
    return {
      overall: systemLevel,
      services: services.map(s => ({
        name: s.name,
        healthy: s.isHealthy,
        level: s.degradationLevel,
        failureCount: s.failureCount,
        fallbackEnabled: s.fallbackEnabled,
        critical: s.criticalService
      })),
      queuedRequests: this.requestQueue.length,
      offlineModeEnabled: this.config.enableOfflineMode
    };
  }

  // Enable/disable features based on degradation level
  isFeatureEnabled(feature: string): boolean {
    const level = this.getSystemDegradationLevel();
    
    switch (level) {
      case DegradationLevel.HEALTHY:
        return true;
      
      case DegradationLevel.MINOR_DEGRADATION:
        // Disable non-essential features
        return !['analytics', 'recommendations', 'notifications'].includes(feature);
      
      case DegradationLevel.MAJOR_DEGRADATION:
        // Only allow core features
        return ['orders', 'tracking', 'payments', 'auth'].includes(feature);
      
      case DegradationLevel.CRITICAL_DEGRADATION:
        // Only essential features
        return ['auth', 'emergency_contact'].includes(feature);
      
      default:
        return false;
    }
  }
}

// Global instance
export const gracefulDegradation = new GracefulDegradationService();

// Convenience functions
export const withFallback = <T>(
  serviceName: string,
  primaryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>
) => gracefulDegradation.executeWithFallback(serviceName, primaryFn, fallbackFn);

export const queueFailedRequest = (
  service: string,
  endpoint: string,
  method: string,
  data: any,
  maxRetries?: number
) => gracefulDegradation.queueRequest(service, endpoint, method, data, maxRetries);

export const getFallbackResponse = (service: string, operation: string) =>
  gracefulDegradation.getFallbackResponse(service, operation);

export const isFeatureEnabled = (feature: string) =>
  gracefulDegradation.isFeatureEnabled(feature);

export const getSystemStatus = () => gracefulDegradation.getSystemStatus();