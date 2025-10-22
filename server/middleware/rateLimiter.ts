import { Request, Response, NextFunction } from 'express';
import { log } from '../vite';
import { createStructuredError, ErrorCategory, ErrorSeverity } from './errorHandler';

// Rate limit configuration
export interface RateLimitConfig {
  windowMs: number;           // Time window in milliseconds
  maxRequests: number;        // Maximum requests per window
  message?: string;           // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean;     // Don't count failed requests
  keyGenerator?: (req: Request) => string; // Custom key generator
  onLimitReached?: (req: Request) => void; // Callback when limit reached
}

// Default configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,            // 5 attempts per 15 minutes
    message: "Too many login attempts, please try again later"
  },
  
  // Password reset - very strict
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,            // 3 attempts per hour
    message: "Too many password reset attempts, please try again later"
  },
  
  // Registration - moderate limits
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,            // 3 registrations per hour per IP
    message: "Registration limit reached, please try again later"
  },
  
  // Payment endpoints - strict limits
  payments: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 10,          // 10 payment attempts per minute
    message: "Payment request limit exceeded, please wait before trying again"
  },
  
  // Driver actions - moderate limits
  driverActions: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 30,          // 30 actions per minute
    message: "Driver action limit reached, please slow down"
  },
  
  // API general - generous limits
  general: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,         // 100 requests per minute
    message: "Rate limit exceeded, please slow down"
  },
  
  // Admin endpoints - moderate limits
  admin: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 60,          // 60 requests per minute
    message: "Admin API rate limit exceeded"
  },
  
  // Tracking endpoints - public but protected
  tracking: {
    windowMs: 5 * 60 * 1000,  // 5 minutes
    maxRequests: 30,          // 30 requests per 5 minutes
    message: "Too many tracking requests. Please wait before checking again."
  },
  
  // Sensitive document access (receipts, invoices, etc.)
  sensitiveDocuments: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,          // 20 requests per hour
    message: "Document access limit exceeded. Please try again later."
  }
};

// Request tracking
interface RequestRecord {
  timestamp: number;
  ip: string;
  userAgent?: string;
  userId?: string;
  success?: boolean;
}

// In-memory rate limit store (in production, use Redis)
class RateLimitStore {
  private store = new Map<string, RequestRecord[]>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up old records every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  // Clean up expired records
  private cleanup() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // Keep records for 1 hour max
    
    for (const [key, records] of Array.from(this.store.entries())) {
      const validRecords = records.filter((r: RequestRecord) => now - r.timestamp < maxAge);
      if (validRecords.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, validRecords);
      }
    }
    
    log(`🧹 Rate limiter cleanup: ${this.store.size} active keys`, 'rate-limiter');
  }

  // Get records for a key
  get(key: string): RequestRecord[] {
    return this.store.get(key) || [];
  }

  // Add a record
  add(key: string, record: RequestRecord) {
    const records = this.get(key);
    records.push(record);
    this.store.set(key, records);
  }

  // Get current statistics
  getStats() {
    const now = Date.now();
    const stats = {
      totalKeys: this.store.size,
      totalRecords: 0,
      recentActivity: 0, // Last 5 minutes
      topIPs: new Map<string, number>()
    };

    for (const records of Array.from(this.store.values())) {
      stats.totalRecords += records.length;
      
      for (const record of records) {
        // Count recent activity (last 5 minutes)
        if (now - record.timestamp < 5 * 60 * 1000) {
          stats.recentActivity++;
        }
        
        // Track top IPs
        const currentCount = stats.topIPs.get(record.ip) || 0;
        stats.topIPs.set(record.ip, currentCount + 1);
      }
    }

    return {
      ...stats,
      topIPs: Array.from(stats.topIPs.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) // Top 10 IPs
    };
  }

  // Force clear records for a key (for admin use)
  clear(key: string) {
    this.store.delete(key);
  }

  // Destroy the store
  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limit store
const rateLimitStore = new RateLimitStore();

// Create rate limiting middleware
export function createRateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Generate key for tracking (default: IP + endpoint)
    const key = config.keyGenerator 
      ? config.keyGenerator(req)
      : `${req.ip}:${req.route?.path || req.path}`;
    
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get existing records
    const records = rateLimitStore.get(key);
    
    // Filter records within the time window
    const windowRecords = records.filter(r => r.timestamp > windowStart);
    
    // Filter based on success/failure if configured
    let countableRecords = windowRecords;
    if (config.skipSuccessfulRequests) {
      countableRecords = countableRecords.filter(r => r.success !== true);
    }
    if (config.skipFailedRequests) {
      countableRecords = countableRecords.filter(r => r.success !== false);
    }
    
    // Check if limit exceeded
    if (countableRecords.length >= config.maxRequests) {
      // Call limit reached callback
      config.onLimitReached?.(req);
      
      // Log rate limit hit
      log(`🚫 Rate limit exceeded for ${req.ip} on ${req.path}`, 'rate-limiter');
      
      // Create structured error
      const error = createStructuredError(
        config.message || 'Rate limit exceeded',
        429,
        ErrorCategory.RATE_LIMIT,
        ErrorSeverity.LOW,
        {
          ip: req.ip,
          path: req.path,
          userAgent: req.headers['user-agent'],
          requestCount: countableRecords.length,
          windowMs: config.windowMs,
          limit: config.maxRequests
        }
      );
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil((windowStart + config.windowMs) / 1000).toString(),
        'Retry-After': Math.ceil(config.windowMs / 1000).toString()
      });
      
      return res.status(429).json({
        error: true,
        message: config.message || 'Rate limit exceeded',
        retryAfter: Math.ceil(config.windowMs / 1000)
      });
    }
    
    // Add current request to records
    const requestRecord: RequestRecord = {
      timestamp: now,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'],
      userId: (req as any).session?.user?.id
    };
    
    rateLimitStore.add(key, requestRecord);
    
    // Set rate limit headers
    const remaining = Math.max(0, config.maxRequests - countableRecords.length - 1);
    res.set({
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.ceil((now + config.windowMs) / 1000).toString()
    });
    
    // Track success/failure after response
    const originalSend = res.send;
    res.send = function(body) {
      requestRecord.success = res.statusCode < 400;
      return originalSend.call(this, body);
    };
    
    next();
  };
}

// Predefined rate limiters for common use cases
export const authRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.auth);
export const passwordResetRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.passwordReset);
export const registrationRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.registration);
export const paymentRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.payments);
export const driverActionRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.driverActions);
export const generalRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.general);
export const adminRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.admin);
export const trackingRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.tracking);
export const sensitiveDocRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.sensitiveDocuments);

// Custom rate limiter for user-specific limits
export function createUserRateLimit(config: RateLimitConfig) {
  return createRateLimit({
    ...config,
    keyGenerator: (req: Request) => {
      const userId = (req as any).session?.user?.id;
      return userId ? `user:${userId}:${req.path}` : `ip:${req.ip}:${req.path}`;
    }
  });
}

// Rate limit status and management
export function getRateLimitStats() {
  return rateLimitStore.getStats();
}

// Admin function to clear rate limits for specific key
export function clearRateLimit(key: string) {
  rateLimitStore.clear(key);
  log(`🧹 Cleared rate limit for key: ${key}`, 'rate-limiter');
}

// Admin function to clear all rate limits
export function clearAllRateLimits() {
  rateLimitStore.destroy();
  log(`🧹 Cleared all rate limits`, 'rate-limiter');
}

// Health check for rate limiting
export function getRateLimitHealth() {
  const stats = getRateLimitStats();
  const isHealthy = stats.recentActivity < 1000; // Consider unhealthy if >1000 requests in last 5 minutes
  
  return {
    status: isHealthy ? 'healthy' : 'high_load',
    stats,
    alerts: {
      highLoad: stats.recentActivity > 1000,
      manyActiveKeys: stats.totalKeys > 500
    }
  };
}

/**
 * IP-based throttling for failed authentication attempts
 * Blocks IPs after repeated failed login attempts
 */
interface IpThrottleRecord {
  failedAttempts: number;
  blockedUntil: number | null;
  lastAttempt: number;
}

const ipThrottleStore = new Map<string, IpThrottleRecord>();

// Clean up IP throttle records every 10 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // Keep records for 24 hours
  
  for (const [ip, record] of ipThrottleStore.entries()) {
    // Remove if not blocked and last attempt was > 24 hours ago
    if (!record.blockedUntil && now - record.lastAttempt > maxAge) {
      ipThrottleStore.delete(ip);
    }
    // Remove if block has expired > 24 hours ago
    else if (record.blockedUntil && now - record.blockedUntil > maxAge) {
      ipThrottleStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export function ipThrottleMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  let record = ipThrottleStore.get(ip);
  
  // Initialize if not exists
  if (!record) {
    record = { failedAttempts: 0, blockedUntil: null, lastAttempt: now };
    ipThrottleStore.set(ip, record);
  }
  
  // Check if IP is currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    log(`🚫 Blocked IP ${ip} attempted access - ${record.failedAttempts} failed attempts`, 'ip-throttle');
    
    return res.status(429).json({
      error: true,
      message: 'Too many failed attempts. Your IP has been temporarily blocked.',
      retryAfter,
      blockedUntil: new Date(record.blockedUntil).toISOString()
    });
  }
  
  // Reset block if expired
  if (record.blockedUntil && record.blockedUntil <= now) {
    record.failedAttempts = 0;
    record.blockedUntil = null;
    log(`✅ IP ${ip} block expired - resetting`, 'ip-throttle');
  }
  
  // Track response to increment failed attempts
  res.on('finish', () => {
    record!.lastAttempt = now;
    
    // Failed authentication (401) or forbidden (403)
    if (res.statusCode === 401 || res.statusCode === 403) {
      record!.failedAttempts++;
      
      // Block IP after 10 failed attempts for 1 hour
      if (record!.failedAttempts >= 10) {
        record!.blockedUntil = now + (60 * 60 * 1000); // 1 hour
        log(`⚠️  IP ${ip} BLOCKED for 1 hour - ${record!.failedAttempts} failed attempts`, 'ip-throttle');
      }
      // Warning after 5 attempts - shorter block (5 minutes)
      else if (record!.failedAttempts >= 5) {
        record!.blockedUntil = now + (5 * 60 * 1000); // 5 minutes
        log(`⚠️  IP ${ip} blocked for 5 minutes - ${record!.failedAttempts} failed attempts`, 'ip-throttle');
      }
      else {
        log(`⚠️  Failed auth from IP ${ip} - attempt ${record!.failedAttempts}/10`, 'ip-throttle');
      }
    }
    // Reset on successful authentication (200)
    else if (res.statusCode === 200) {
      if (record!.failedAttempts > 0) {
        log(`✅ Successful auth from IP ${ip} - resetting failed attempts`, 'ip-throttle');
      }
      record!.failedAttempts = 0;
      record!.blockedUntil = null;
    }
  });
  
  next();
}

/**
 * Get IP throttle info (admin function)
 */
export function getIpThrottleInfo(ip: string): IpThrottleRecord | null {
  return ipThrottleStore.get(ip) || null;
}

/**
 * Clear IP throttle block (admin function)
 */
export function clearIpThrottle(ip: string): boolean {
  const existed = ipThrottleStore.has(ip);
  ipThrottleStore.delete(ip);
  if (existed) {
    log(`🧹 Cleared IP throttle for ${ip}`, 'ip-throttle');
  }
  return existed;
}

/**
 * Get all blocked IPs (admin function)
 */
export function getBlockedIps(): Array<{ ip: string; record: IpThrottleRecord }> {
  const now = Date.now();
  const blocked = [];
  
  for (const [ip, record] of ipThrottleStore.entries()) {
    if (record.blockedUntil && record.blockedUntil > now) {
      blocked.push({ ip, record });
    }
  }
  
  return blocked;
}