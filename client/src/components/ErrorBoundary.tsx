import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, Phone, MessageSquare } from 'lucide-react';
import { handleError } from '@/lib/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log error with detailed context
    console.log('ErrorBoundary Details:', {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    const errorId = handleError(error, {
      context: "React Error Boundary",
      userMessage: "Application Error"
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to external monitoring service if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: errorInfo,
          errorBoundary: {
            errorId: this.state.errorId,
          }
        }
      });
    }
  }

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full"
                data-testid="button-go-home"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = 'tel:+1234567890'}
                  className="flex-1"
                  data-testid="button-call-support"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = 'sms:+1234567890'}
                  className="flex-1"
                  data-testid="button-text-support"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Text Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for programmatic error reporting
export function useErrorHandler() {
  return (error: Error, context?: string) => {
    // Trigger error boundary by throwing
    throw error;
  };
}