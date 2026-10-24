'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/core/lib/utils/cn';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

function renderWithRedAsterisk(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string') {
    const trimmed = children.trimEnd();
    if (trimmed.endsWith('*')) {
      const base = trimmed.slice(0, -1);
      return <>{base}<span className="text-destructive">*</span></>;
    }
  }
  return children;
}

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, children, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props}>
    {renderWithRedAsterisk(children)}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;
