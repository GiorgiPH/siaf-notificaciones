import * as React from 'react';
import { cn } from '@/core/lib/utils/cn';

/**
 * Área de texto del DS (shadcn `textarea` ajustado a tokens). Mismo tratamiento visual que `Input`
 * (`ds-input`: borde, foco y `aria-invalid`), en varias líneas y sin redimensionar.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'ds-input flex min-h-16 w-full resize-none rounded-xl border bg-bg-base px-3 py-2 text-sm font-light text-content-high transition-colors',
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
Textarea.displayName = 'Textarea';
