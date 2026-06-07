import React from 'react';
import { cn } from '@/lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variantStyles = {
      success: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
      danger: 'bg-accent-red/20 text-accent-red border border-accent-red/30',
      warning: 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30',
      info: 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30',
      default: 'bg-slate-700/20 text-light-primary border border-slate-600/30',
    };

    const sizeStyles = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-semibold',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
