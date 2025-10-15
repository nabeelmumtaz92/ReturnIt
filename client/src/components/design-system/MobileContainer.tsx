import React from 'react';
import { cn } from '@/lib/utils';

interface MobileContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  fullHeight?: boolean;
  safeArea?: boolean;
}

// Mobile-first container that adapts to different screen sizes
const MobileContainer = React.forwardRef<HTMLDivElement, MobileContainerProps>(
  ({ className, children, fullHeight = false, safeArea = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base mobile styles
          "w-full mx-auto bg-gradient-to-br from-blue-50 via-white to-amber-50",
          // Mobile-first responsive widths
          "max-w-sm", // Mobile: ~375px
          "sm:max-w-md", // Small tablets: ~448px  
          "md:max-w-lg", // Medium tablets: ~512px
          "lg:max-w-xl", // Small desktop: ~576px
          "xl:max-w-2xl", // Desktop: ~672px
          // Height options
          fullHeight && "min-h-screen",
          // Safe area for mobile devices
          safeArea && "px-4 py-2 sm:px-6 md:px-8",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MobileContainer.displayName = "MobileContainer";

interface AppScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

// Full mobile app screen layout
const AppScreen = React.forwardRef<HTMLDivElement, AppScreenProps>(
  ({ className, children, header, footer, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex flex-col",
          // Responsive layout
          "w-full max-w-sm mx-auto", // Mobile-first
          "sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl", // Scale up
          className
        )}
        {...props}
      >
        {/* Header */}
        {header}
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        {footer}
      </div>
    );
  }
);
AppScreen.displayName = "AppScreen";

export { MobileContainer, AppScreen };