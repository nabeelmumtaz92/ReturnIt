import { Request, Response, NextFunction } from 'express';
import { log } from '../vite';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for tracking
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit'
}

// Structured error interface
export interface StructuredError extends Error {
  statusCode?: number;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  context?: Record<string, any>;
  errorId?: string;
  userId?: string;
  requestId?: string;
}

// Error tracking service
class ErrorTracker {
  private errorCounts = new Map<string, number>();
  private errorHistory: Array<{ timestamp: Date; error: StructuredError }> = [];
  private maxHistorySize = 1000;

  track(error: StructuredError) {
    const key = `${error.category}_${error.message}`;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);

    // Add to history (keep limited size)
    this.errorHistory.push({ timestamp: new Date(), error });
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Alert on high frequency errors
    if (count > 10 && count % 5 === 0) {
      log(`🚨 HIGH FREQUENCY ERROR: ${key} occurred ${count} times`, 'error-tracker');
    }
  }

  getErrorStats() {
    return {
      totalErrors: this.errorHistory.length,
      errorCounts: Object.fromEntries(this.errorCounts),
      recentErrors: this.errorHistory.slice(-10)
    };
  }

  getErrorsByCategory(category: ErrorCategory) {
    return this.errorHistory.filter(e => e.error.category === category);
  }
}

const errorTracker = new ErrorTracker();

// Enhanced error creation utility
export function createStructuredError(
  message: string,
  statusCode: number = 500,
  category: ErrorCategory = ErrorCategory.SYSTEM,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: Record<string, any>
): StructuredError {
  const error = new Error(message) as StructuredError;
  error.statusCode = statusCode;
  error.category = category;
  error.severity = severity;
  error.context = context;
  error.errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return error;
}

// Sanitize sensitive data from logs
function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard', 'ssn'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Log structured error
function logStructuredError(error: StructuredError, req: Request) {
  const logData = {
    errorId: error.errorId,
    message: error.message,
    statusCode: error.statusCode,
    category: error.category,
    severity: error.severity,
    stack: error.stack,
    context: sanitizeForLogging(error.context),
    request: {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: error.userId || req.body?.userId,
    },
    timestamp: new Date().toISOString()
  };

  // Log with appropriate level based on severity
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      console.error('🔥 CRITICAL ERROR:', JSON.stringify(logData, null, 2));
      break;
    case ErrorSeverity.HIGH:
      console.error('❌ HIGH SEVERITY ERROR:', JSON.stringify(logData, null, 2));
      break;
    case ErrorSeverity.MEDIUM:
      console.warn('⚠️ MEDIUM SEVERITY ERROR:', JSON.stringify(logData, null, 2));
      break;
    case ErrorSeverity.LOW:
      log(`ℹ️ LOW SEVERITY ERROR: ${error.message}`, 'error-handler');
      break;
    default:
      console.error('❓ UNKNOWN SEVERITY ERROR:', JSON.stringify(logData, null, 2));
  }

  // Track the error
  errorTracker.track(error);
}

// Health check for error monitoring
export function getErrorHealthStatus() {
  const stats = errorTracker.getErrorStats();
  const criticalErrors = errorTracker.getErrorsByCategory(ErrorCategory.SYSTEM).length;
  const paymentErrors = errorTracker.getErrorsByCategory(ErrorCategory.PAYMENT).length;
  
  return {
    status: criticalErrors > 5 ? 'unhealthy' : 'healthy',
    stats,
    alerts: {
      criticalErrors: criticalErrors > 5,
      paymentErrors: paymentErrors > 3,
      highErrorRate: stats.totalErrors > 100
    }
  };
}

// Main error handling middleware
export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Convert to structured error if not already
  let structuredError: StructuredError;
  
  if (err.statusCode || err.category) {
    structuredError = err as StructuredError;
  } else {
    // Determine category and severity based on error
    let category = ErrorCategory.SYSTEM;
    let severity = ErrorSeverity.MEDIUM;
    let statusCode = 500;

    if (err.message?.includes('auth') || err.message?.includes('login')) {
      category = ErrorCategory.AUTHENTICATION;
      statusCode = 401;
      severity = ErrorSeverity.LOW;
    } else if (err.message?.includes('permission') || err.message?.includes('access')) {
      category = ErrorCategory.AUTHORIZATION;
      statusCode = 403;
      severity = ErrorSeverity.MEDIUM;
    } else if (err.message?.includes('validation') || err.message?.includes('invalid')) {
      category = ErrorCategory.VALIDATION;
      statusCode = 400;
      severity = ErrorSeverity.LOW;
    } else if (err.message?.includes('database') || err.code?.includes('DB')) {
      category = ErrorCategory.DATABASE;
      statusCode = 500;
      severity = ErrorSeverity.HIGH;
    } else if (err.message?.includes('stripe') || err.message?.includes('payment')) {
      category = ErrorCategory.PAYMENT;
      statusCode = 500;
      severity = ErrorSeverity.HIGH;
    }

    structuredError = createStructuredError(
      err.message || 'Internal Server Error',
      statusCode,
      category,
      severity,
      { originalError: err.name || 'Unknown' }
    );
  }

  // Add request ID if available
  structuredError.requestId = req.headers['x-request-id'] as string;

  // Log the error
  logStructuredError(structuredError, req);

  // Send appropriate response based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const response: any = {
    error: true,
    message: isProduction ? 'An error occurred' : structuredError.message,
    errorId: structuredError.errorId
  };

  // Add debug info in development
  if (!isProduction) {
    response.stack = structuredError.stack;
    response.context = structuredError.context;
  }

  res.status(structuredError.statusCode || 500).json(response);
}

// Unhandled promise rejection handler
export function setupUnhandledRejectionHandler() {
  process.on('unhandledRejection', (reason: any, promise) => {
    const error = createStructuredError(
      `Unhandled Promise Rejection: ${reason?.message || reason}`,
      500,
      ErrorCategory.SYSTEM,
      ErrorSeverity.CRITICAL,
      { reason, promise: promise.toString() }
    );

    console.error('🔥 UNHANDLED PROMISE REJECTION:', {
      errorId: error.errorId,
      reason,
      stack: reason?.stack
    });

    errorTracker.track(error);
  });
}

// Uncaught exception handler
export function setupUncaughtExceptionHandler() {
  process.on('uncaughtException', (error) => {
    const structuredError = createStructuredError(
      `Uncaught Exception: ${error.message}`,
      500,
      ErrorCategory.SYSTEM,
      ErrorSeverity.CRITICAL,
      { originalError: error.name }
    );

    console.error('💥 UNCAUGHT EXCEPTION:', {
      errorId: structuredError.errorId,
      message: error.message,
      stack: error.stack
    });

    errorTracker.track(structuredError);

    // In production, exit gracefully
    if (process.env.NODE_ENV === 'production') {
      console.error('🛑 Exiting due to uncaught exception...');
      process.exit(1);
    }
  });
}

// Request timeout handler
export function requestTimeoutHandler(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      const error = createStructuredError(
        'Request timeout',
        408,
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM,
        { 
          url: req.url,
          method: req.method,
          timeout: timeoutMs 
        }
      );

      next(error);
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
}

export { errorTracker };