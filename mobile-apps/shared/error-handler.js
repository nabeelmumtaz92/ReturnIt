/**
 * Centralized Error Handling for ReturnIt Mobile Apps
 * Provides consistent error handling, user-friendly messages, and logging
 */

/**
 * Error Types
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION', 
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
};

/**
 * HTTP Status Code Mappings
 */
const STATUS_CODE_MESSAGES = {
  400: 'Invalid request. Please check your input.',
  401: 'Authentication required. Please log in.',
  403: 'Access denied. You don\'t have permission for this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data.',
  422: 'Invalid data provided. Please check your input.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service maintenance in progress. Please try again later.',
};

/**
 * User-friendly error messages for common scenarios
 */
const FRIENDLY_MESSAGES = {
  // Network errors
  'Network request failed': 'Please check your internet connection and try again.',
  'Request timeout': 'The request took too long. Please try again.',
  
  // Authentication errors
  'Invalid credentials': 'The email or password you entered is incorrect.',
  'No account found': 'No account found with this email. Please sign up first.',
  'Account locked': 'Your account has been temporarily locked for security.',
  'Session expired': 'Your session has expired. Please log in again.',
  
  // Validation errors
  'Validation failed': 'Please check the information you entered.',
  'Email already exists': 'An account with this email already exists.',
  'Invalid email': 'Please enter a valid email address.',
  'Password too weak': 'Please choose a stronger password.',
  
  // Order/Driver errors
  'Order not found': 'This order could not be found.',
  'Job already taken': 'This job has already been accepted by another driver.',
  'No available drivers': 'No drivers are currently available in your area.',
  'Payment failed': 'Payment could not be processed. Please try again.',
  
  // Location errors
  'Location permission denied': 'Location access is required for this feature.',
  'Location unavailable': 'Unable to get your current location.',
};

/**
 * Enhanced Error Class
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, status = null, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.status = status;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    this.userFriendly = this.getUserFriendlyMessage();
  }

  getUserFriendlyMessage() {
    // Check for specific friendly messages
    for (const [key, message] of Object.entries(FRIENDLY_MESSAGES)) {
      if (this.message.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }

    // Check status code messages
    if (this.status && STATUS_CODE_MESSAGES[this.status]) {
      return STATUS_CODE_MESSAGES[this.status];
    }

    // Return original message or generic fallback
    return this.message || 'Something went wrong. Please try again.';
  }
}

/**
 * Error Handler Class
 */
class ErrorHandler {
  /**
   * Process API errors and return standardized AppError
   */
  static handleAPIError(error) {
    console.error('API Error:', error);

    // Network errors
    if (!error.status && (error.message.includes('Network') || error.message.includes('fetch'))) {
      return new AppError(
        'Network error occurred',
        ERROR_TYPES.NETWORK,
        null,
        error
      );
    }

    // Authentication errors
    if (error.status === 401) {
      return new AppError(
        error.data?.message || 'Authentication required',
        ERROR_TYPES.AUTHENTICATION,
        401,
        error
      );
    }

    // Validation errors
    if (error.status === 400 || error.status === 422) {
      return new AppError(
        error.data?.message || 'Validation failed',
        ERROR_TYPES.VALIDATION,
        error.status,
        error
      );
    }

    // Server errors
    if (error.status >= 500) {
      return new AppError(
        'Server error occurred',
        ERROR_TYPES.SERVER,
        error.status,
        error
      );
    }

    // Other HTTP errors
    if (error.status) {
      return new AppError(
        error.data?.message || `HTTP Error: ${error.status}`,
        ERROR_TYPES.SERVER,
        error.status,
        error
      );
    }

    // Unknown errors
    return new AppError(
      error.message || 'An unexpected error occurred',
      ERROR_TYPES.UNKNOWN,
      null,
      error
    );
  }

  /**
   * Handle location/permission errors
   */
  static handleLocationError(error) {
    console.error('Location Error:', error);

    if (error.code === 1) { // PERMISSION_DENIED
      return new AppError(
        'Location permission denied',
        ERROR_TYPES.VALIDATION,
        null,
        error
      );
    }

    if (error.code === 2) { // POSITION_UNAVAILABLE
      return new AppError(
        'Location unavailable',
        ERROR_TYPES.NETWORK,
        null,
        error
      );
    }

    if (error.code === 3) { // TIMEOUT
      return new AppError(
        'Location request timeout',
        ERROR_TYPES.NETWORK,
        null,
        error
      );
    }

    return new AppError(
      'Unable to get location',
      ERROR_TYPES.UNKNOWN,
      null,
      error
    );
  }

  /**
   * Log error for debugging/analytics
   */
  static logError(error, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      type: error.type || ERROR_TYPES.UNKNOWN,
      status: error.status,
      context,
      stack: error.stack,
    };

    console.error('Error Log:', errorLog);

    // In production, you might want to send this to a logging service
    // like Sentry, LogRocket, or custom analytics
    if (__DEV__) {
      console.table(errorLog);
    }
  }

  /**
   * Show user-friendly error message
   * This should be implemented per platform (React Native Alert, Toast, etc.)
   */
  static showError(error, showErrorFunc) {
    const appError = error instanceof AppError ? error : this.handleAPIError(error);
    
    if (showErrorFunc) {
      showErrorFunc(appError.userFriendly, appError);
    }

    this.logError(appError);
    return appError;
  }

  /**
   * Retry wrapper for operations that might fail
   */
  static async retry(operation, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry authentication or validation errors
        const appError = this.handleAPIError(error);
        if (appError.type === ERROR_TYPES.AUTHENTICATION || 
            appError.type === ERROR_TYPES.VALIDATION) {
          throw appError;
        }

        // Don't retry on final attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw this.handleAPIError(lastError);
  }
}

export default ErrorHandler;