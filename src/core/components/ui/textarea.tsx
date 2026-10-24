import * as React from 'react';
import { cn } from '@/core/lib/utils/cn';

// STOPGAP: falta Textarea en el DS — no hay área de texto de varias líneas. `bunx shadcn add textarea` agregó al
// package.json una dependencia ajena (`cn`), así que se dejó el componente de shadcn con las clases de `Input` del DS
// (`ds-input`: borde, foco y `aria-invalid`). Cuando el DS publique el suyo, se reemplaza manteniendo la misma API
// (props nativas de `<textarea>`).
/** Área de texto de varias líneas, sin redimensionar, con el mismo tratamiento visual que `Input`. */
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
