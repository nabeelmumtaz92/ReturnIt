import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  "inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold transition-all border",
  {
    variants: {
      variant: {
        selected: "bg-[#FF8C42] text-white border-[#FF8C42]",
        unselected: "bg-[#D2B48C] text-[#1A1A1A] border-[#7B5E3B] hover:bg-[#c4a67a]",
        status: "text-white font-medium",
      },
      shape: {
        default: "rounded-[10px]",
        pill: "rounded-full",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-xs", 
        lg: "px-4 py-2 text-sm",
      },
      status: {
        created: "bg-[#D2B48C] text-[#1A1A1A] border-[#D2B48C]",
        assigned: "bg-[#FF8C42] text-white border-[#FF8C42]",
        picked_up: "bg-[#7B5E3B] text-white border-[#7B5E3B]",
        dropped_off: "bg-[#2E7D32] text-white border-[#2E7D32]",
        completed: "bg-[#2E7D32] text-white border-[#2E7D32]",
      }
    },
    defaultVariants: {
      variant: "unselected",
      shape: "default", 
      size: "default",
    },
  }
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  label: string;
  selected?: boolean;
  status?: 'created' | 'assigned' | 'picked_up' | 'dropped_off' | 'completed';
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, shape, size, status, label, selected, ...props }, ref) => {
    // Determine variant based on props
    let finalVariant = variant;
    if (status) {
      finalVariant = 'status';
    } else if (selected !== undefined) {
      finalVariant = selected ? 'selected' : 'unselected';
    }

    return (
      <button
        className={cn(chipVariants({ 
          variant: finalVariant, 
          shape, 
          size, 
          status,
          className 
        }))}
        ref={ref}
        {...props}
      >
        {label}
      </button>
    );
  }
);
Chip.displayName = "Chip";

// Status Stepper Component
interface StepperProps {
  currentStatus: 'created' | 'assigned' | 'picked_up' | 'dropped_off' | 'completed';
  className?: string;
}

const statusOrder: Array<'created' | 'assigned' | 'picked_up' | 'dropped_off' | 'completed'> = [
  'created', 'assigned', 'picked_up', 'dropped_off', 'completed'
];

const statusLabels = {
  created: 'Created',
  assigned: 'Assigned', 
  picked_up: 'Picked Up',
  dropped_off: 'Dropped Off',
  completed: 'Completed'
};

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ currentStatus, className }, ref) => {
    const currentIndex = statusOrder.indexOf(currentStatus);

    return (
      <div ref={ref} className={cn("flex flex-wrap gap-2", className)}>
        {statusOrder.map((status, index) => {
          const isActive = index <= currentIndex;
          return (
            <Chip
              key={status}
              label={statusLabels[status]}
              status={isActive ? status : 'created'}
              variant="status"
              shape="pill"
              size="sm"
              disabled
            />
          );
        })}
      </div>
    );
  }
);
Stepper.displayName = "Stepper";

export { Chip, Stepper, chipVariants };