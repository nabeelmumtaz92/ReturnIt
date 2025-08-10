import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    className, 
    children, 
    columns = { default: 1, sm: 2, md: 2, lg: 3, xl: 3 },
    gap = 'md',
    ...props 
  }, ref) => {
    const getGridCols = () => {
      const gridClasses = [];
      
      if (columns.default) gridClasses.push(`grid-cols-${columns.default}`);
      if (columns.sm) gridClasses.push(`sm:grid-cols-${columns.sm}`);
      if (columns.md) gridClasses.push(`md:grid-cols-${columns.md}`);
      if (columns.lg) gridClasses.push(`lg:grid-cols-${columns.lg}`);
      if (columns.xl) gridClasses.push(`xl:grid-cols-${columns.xl}`);
      
      return gridClasses.join(' ');
    };

    const getGapClass = () => {
      switch(gap) {
        case 'sm': return 'gap-2 sm:gap-3';
        case 'md': return 'gap-3 sm:gap-4 md:gap-6';
        case 'lg': return 'gap-4 sm:gap-6 md:gap-8';
        default: return 'gap-4';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          getGridCols(),
          getGapClass(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResponsiveGrid.displayName = "ResponsiveGrid";

interface FlexStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'column' | 'row' | 'column-reverse' | 'row-reverse';
  responsive?: {
    default?: 'column' | 'row';
    sm?: 'column' | 'row'; 
    md?: 'column' | 'row';
    lg?: 'column' | 'row';
  };
  gap?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const FlexStack = React.forwardRef<HTMLDivElement, FlexStackProps>(
  ({ 
    className, 
    children, 
    direction = 'column',
    responsive,
    gap = 'md',
    align = 'start',
    justify = 'start',
    ...props 
  }, ref) => {
    const getDirectionClasses = () => {
      if (responsive) {
        const classes = [];
        if (responsive.default) classes.push(`flex-${responsive.default}`);
        if (responsive.sm) classes.push(`sm:flex-${responsive.sm}`);
        if (responsive.md) classes.push(`md:flex-${responsive.md}`);
        if (responsive.lg) classes.push(`lg:flex-${responsive.lg}`);
        return classes.join(' ');
      }
      return `flex-${direction}`;
    };

    const getGapClass = () => {
      switch(gap) {
        case 'sm': return 'gap-2 sm:gap-3';
        case 'md': return 'gap-3 sm:gap-4 md:gap-6';
        case 'lg': return 'gap-4 sm:gap-6 md:gap-8';
        default: return 'gap-4';
      }
    };

    const getAlignClass = () => {
      switch(align) {
        case 'start': return 'items-start';
        case 'center': return 'items-center';
        case 'end': return 'items-end';
        case 'stretch': return 'items-stretch';
        default: return 'items-start';
      }
    };

    const getJustifyClass = () => {
      switch(justify) {
        case 'start': return 'justify-start';
        case 'center': return 'justify-center';
        case 'end': return 'justify-end';
        case 'between': return 'justify-between';
        case 'around': return 'justify-around';
        default: return 'justify-start';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          getDirectionClasses(),
          getGapClass(),
          getAlignClass(),
          getJustifyClass(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FlexStack.displayName = "FlexStack";

export { ResponsiveGrid, FlexStack };