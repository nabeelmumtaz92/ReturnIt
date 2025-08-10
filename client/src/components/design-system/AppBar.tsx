import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';

const appBarVariants = cva(
  "flex items-center justify-between w-full h-14 px-4 bg-[#F8F7F4] border-b border-[#D2B48C]",
  {
    variants: {
      variant: {
        default: "",
        back: "",
        action: "", 
        both: "",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AppBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof appBarVariants> {
  title: string;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  showBack?: boolean;
  showAction?: boolean;
}

const AppBar = React.forwardRef<HTMLDivElement, AppBarProps>(
  ({ 
    className, 
    variant, 
    title, 
    onBack, 
    onAction, 
    actionIcon = <MoreHorizontal className="h-5 w-5" />,
    showBack = false,
    showAction = false,
    ...props 
  }, ref) => {
    // Determine variant based on props
    let finalVariant = variant;
    if (!finalVariant) {
      if (showBack && showAction) finalVariant = "both";
      else if (showBack) finalVariant = "back";
      else if (showAction) finalVariant = "action";
      else finalVariant = "default";
    }

    return (
      <div
        ref={ref}
        className={cn(appBarVariants({ variant: finalVariant, className }))}
        {...props}
      >
        {/* Left Side */}
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-[#1A1A1A] hover:bg-[#D2B48C]/20 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {!showBack && <div className="w-9" />} {/* Spacer for centering */}
        </div>

        {/* Center - Title */}
        <h1 className="text-[22px] leading-[28px] font-bold text-[#1A1A1A] text-center flex-1">
          {title}
        </h1>

        {/* Right Side */}
        <div className="flex items-center">
          {showAction && (
            <button
              onClick={onAction}
              className="p-2 -mr-2 text-[#1A1A1A] hover:bg-[#D2B48C]/20 rounded-lg transition-colors"
              aria-label="More actions"
            >
              {actionIcon}
            </button>
          )}
          {!showAction && <div className="w-9" />} {/* Spacer for centering */}
        </div>
      </div>
    );
  }
);
AppBar.displayName = "AppBar";

export { AppBar, appBarVariants };