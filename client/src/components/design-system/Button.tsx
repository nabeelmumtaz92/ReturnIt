import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Button variants using CVA (Class Variance Authority)
const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#FF8C42] text-white hover:bg-[#e07530] active:bg-[#d16620]",
        secondary: "bg-[#D2B48C] text-[#1A1A1A] border border-[#7B5E3B] hover:bg-[#c4a67a] active:bg-[#b69968]",
        outline: "border-2 border-[#FF8C42] bg-transparent text-[#FF8C42] hover:bg-[#FF8C42] hover:text-white active:bg-[#e07530]",
        ghost: "text-[#1A1A1A] hover:bg-[#D2B48C]/20 active:bg-[#D2B48C]/40",
      },
      size: {
        sm: "h-11 px-3 text-xs",
        default: "h-11 px-4 py-2",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
      state: {
        default: "",
        loading: "cursor-wait",
        disabled: "opacity-50 cursor-not-allowed",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      state: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  label?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, state, label, icon, loading, children, ...props }, ref) => {
    const currentState = loading ? "loading" : props.disabled ? "disabled" : "default";
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, state: currentState, className }))}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
        {label || children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };