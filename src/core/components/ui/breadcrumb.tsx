import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

function Breadcrumb({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="breadcrumb" className={cn('flex', className)} {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      className={cn('flex flex-wrap items-center gap-1.5 font-sans text-[14px] font-light leading-[140%]', className)}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

function BreadcrumbLink({
  className,
  href,
  ...props
}: React.ComponentProps<'a'>) {
  return (
    <a
      href={href}
      className={cn(
        'text-accent-primary underline underline-offset-2 hover:opacity-80 transition-opacity',
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-current="page"
      className={cn('text-content-low', className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn('text-content-low', className)}
      {...props}
    >
      <ChevronRight size={14} strokeWidth={1.5} />
    </li>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
