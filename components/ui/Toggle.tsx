'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      checked = false,
      onCheckedChange,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
        disabled={disabled}
        className={cn(
          'relative h-6 w-11 rounded-full transition-all duration-200 focus:outline-none disabled:cursor-not-allowed',
          checked
            ? 'bg-cyan-500 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
            : 'bg-gray-600',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    );
  }
);

Toggle.displayName = 'Toggle';

export default Toggle;
