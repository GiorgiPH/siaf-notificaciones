'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils/cn';
import { Label } from './label';
import { FieldError } from './field-error';

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, error, description, children, className }: FieldProps) {
  // ponytail: cloneElement injects aria-invalid into the input so red border lights up
  const withInvalid = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ 'aria-invalid'?: boolean }>, {
        'aria-invalid': !!error,
      })
    : children;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {withInvalid}
      {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}
      <FieldError message={error} />
    </div>
  );
}
