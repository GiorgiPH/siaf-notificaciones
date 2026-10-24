import * as React from 'react';
import { cn } from '@/core/lib/utils/cn';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'ds-input flex h-9 w-full rounded-xl border bg-bg-base px-3 py-2 text-sm font-light text-content-high transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-content-low placeholder:font-light',
          'focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
