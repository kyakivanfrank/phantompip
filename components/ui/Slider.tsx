'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  showValue?: boolean;
  suffix?: string;
  label?: string;
  description?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      min = 1,
      max = 100,
      step = 0.1,
      value = 50,
      onValueChange,
      showValue = true,
      suffix = '%',
      label,
      description,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const numValue = typeof value === 'number' ? value : 0;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={numValue}
            onChange={(e) => onValueChange?.(parseFloat(e.target.value))}
            disabled={disabled}
            className={cn(
              'h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-600 accent-cyan-500 disabled:cursor-not-allowed disabled:opacity-50',
              'range-slider',
              className
            )}
            {...props}
          />
          {showValue && (
            <span className="min-w-fit rounded-md bg-dark-tertiary/50 px-3 py-1.5 text-xs font-semibold text-cyan-400 font-mono whitespace-nowrap">
              {numValue.toFixed(1)}
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';


export default Slider;
