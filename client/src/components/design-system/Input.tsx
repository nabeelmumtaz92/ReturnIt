import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  "flex w-full rounded-[10px] border bg-white px-4 py-3 text-base text-[#1A1A1A] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#7B5E3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8C42] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-[#D2B48C]",
        focused: "border-[#FF8C42] ring-2 ring-[#FF8C42]",
        error: "border-red-500 ring-2 ring-red-500",
      },
      inputType: {
        single: "",
        multiline: "min-h-[80px] resize-y",
      }
    },
    defaultVariants: {
      variant: "default",
      inputType: "single",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputType, label, helper, error, leftIcon, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const currentVariant = error ? "error" : focused ? "focused" : "default";

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-[13px] leading-[18px] font-medium text-[#1A1A1A]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B5E3B]">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              inputVariants({ variant: currentVariant, inputType, className }),
              leftIcon && "pl-10"
            )}
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
        </div>
        {helper && !error && (
          <p className="text-[13px] leading-[18px] text-[#7B5E3B]">{helper}</p>
        )}
        {error && (
          <p className="text-[13px] leading-[18px] text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, helper, error, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const borderColor = error ? "border-red-500" : focused ? "border-[#FF8C42]" : "border-[#D2B48C]";
    const ringColor = error ? "ring-red-500" : "ring-[#FF8C42]";

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-[13px] leading-[18px] font-medium text-[#1A1A1A]">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex w-full rounded-[10px] border bg-white px-4 py-3 text-base text-[#1A1A1A] transition-colors placeholder:text-[#7B5E3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-y",
            borderColor,
            focused && `ring-2 ${ringColor}`,
            className
          )}
          ref={ref}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {helper && !error && (
          <p className="text-[13px] leading-[18px] text-[#7B5E3B]">{helper}</p>
        )}
        {error && (
          <p className="text-[13px] leading-[18px] text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

export { Input, TextArea, inputVariants };