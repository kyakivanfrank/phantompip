import React from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  elevated?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, elevated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-dark-secondary border border-dark-border rounded-lg p-4',
        hover &&
          'transition-all duration-300 hover:border-accent-blue hover:shadow-lg hover:shadow-accent-blue/10',
        elevated && 'shadow-xl',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';

export default Card;
