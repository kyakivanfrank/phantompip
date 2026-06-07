import React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, icon, helperText, type = 'text', ...props },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-light-primary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'bg-dark-tertiary border border-dark-border rounded-lg px-4 py-2 text-light-primary placeholder-slate-500 transition-colors duration-200 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 w-full',
              icon && 'pl-10',
              error && 'border-accent-red focus:border-accent-red focus:ring-accent-red/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-accent-red mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-light-secondary mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
