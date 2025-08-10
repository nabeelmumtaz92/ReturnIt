import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const toastVariants = cva(
  "fixed bottom-4 right-4 max-w-sm rounded-[12px] border p-4 shadow-lg transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-white border-[#D2B48C] text-[#1A1A1A]",
        success: "bg-[#2E7D32] border-[#2E7D32] text-white",
        error: "bg-red-500 border-red-500 text-white", 
        warning: "bg-[#FF8C42] border-[#FF8C42] text-white",
        info: "bg-[#7B5E3B] border-[#7B5E3B] text-white",
      },
      state: {
        entering: "animate-in slide-in-from-right-full",
        exiting: "animate-out slide-out-to-right-full",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
  duration?: number;
  showCloseButton?: boolean;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    className, 
    variant, 
    state,
    title, 
    description, 
    onClose, 
    duration = 5000,
    showCloseButton = true,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onClose) {
            setTimeout(onClose, 300); // Wait for exit animation
          }
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    const getIcon = () => {
      switch(variant) {
        case 'success': return <CheckCircle className="h-5 w-5" />;
        case 'error': return <AlertCircle className="h-5 w-5" />;
        case 'warning': return <AlertCircle className="h-5 w-5" />;
        case 'info': return <Info className="h-5 w-5" />;
        default: return null;
      }
    };

    if (!isVisible && state !== 'exiting') {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          toastVariants({ variant, state: isVisible ? 'entering' : 'exiting', className })
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 space-y-1">
            {title && (
              <p className="text-[16px] leading-[24px] font-semibold">
                {title}
              </p>
            )}
            {description && (
              <p className="text-[13px] leading-[18px] opacity-90">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={() => {
                setIsVisible(false);
                if (onClose) {
                  setTimeout(onClose, 300);
                }
              }}
              className="opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);
Toast.displayName = "Toast";

// Toast Context and Provider
interface ToastContextType {
  addToast: (toast: Omit<ToastProps, 'onClose'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

interface ToastWithId extends ToastProps {
  id: string;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastWithId[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export { Toast, toastVariants };