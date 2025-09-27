/**
 * Error handling utility that logs detailed errors to console
 * while returning user-friendly generic messages
 */

export interface ErrorHandlerOptions {
  userMessage?: string;
  context?: string;
  showToast?: boolean;
}

/**
 * Handles errors by logging details to console and returning user-friendly message
 */
export function handleError(
  error: unknown, 
  options: ErrorHandlerOptions = {}
): string {
  const {
    userMessage = "Error",
    context = "Operation",
    showToast = false
  } = options;

  // Log detailed error to console for debugging
  console.group(`🚨 ${context} Error`);
  console.error('Error details:', error);
  
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
  
  if (typeof error === 'string') {
    console.error('Error string:', error);
  }
  
  if (typeof error === 'object' && error !== null) {
    console.error('Error object:', JSON.stringify(error, null, 2));
  }
  
  console.groupEnd();

  // Return generic user message
  return userMessage;
}

/**
 * Extracts error message for logging while returning generic message
 */
export function getErrorMessage(error: unknown): { userMessage: string; logMessage: string } {
  let logMessage = 'Unknown error';
  
  if (error instanceof Error) {
    logMessage = error.message;
  } else if (typeof error === 'string') {
    logMessage = error;
  } else if (typeof error === 'object' && error !== null) {
    logMessage = JSON.stringify(error);
  }

  return {
    userMessage: "Error",
    logMessage
  };
}

/**
 * Mutation error handler for React Query
 */
export function createMutationErrorHandler(context: string, userMessage?: string) {
  return (error: unknown) => {
    handleError(error, {
      context,
      userMessage: userMessage || "Error"
    });
  };
}

/**
 * API error handler for fetch requests
 */
export function handleApiError(error: unknown, operation: string): string {
  return handleError(error, {
    context: `API ${operation}`,
    userMessage: "Error"
  });
}