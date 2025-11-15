import * as React from 'react';
import { cn } from '../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, size = 'md', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };

    return (
      <div className="w-full">
        <div
          ref={ref}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-gray-200',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 flex justify-between text-xs text-gray-600">
            <span>{Math.round(percentage)}% complete</span>
            <span>
              {value}/{max}
            </span>
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
