import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/core/lib/utils/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-full',
    'font-sans font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-support-focus focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-accent-primary text-accent-on-primary hover:bg-accent-primary/90 active:bg-accent-primary/80',
        secondary:
          'bg-accent-secondary text-accent-on-secondary hover:bg-accent-secondary/90 active:bg-accent-secondary/80',
        outline:
          'bg-bg-surface-low border border-border-low text-content-high hover:bg-bg-surface-md active:bg-bg-surface-high',
        ghost:
          'bg-transparent text-content-low hover:bg-reactive-surface-hover active:bg-reactive-surface-pressed',
        destructive:
          'bg-support-error text-support-on-error hover:bg-support-error/90 active:bg-support-error/80',
        'destructive-low':
          'bg-support-error-low text-support-on-error-low hover:bg-support-error-low/80 active:bg-support-error-low/70',
        'primary-low':
          'bg-support-error-low text-support-on-error-low hover:bg-support-error-low/80 active:bg-support-error-low/70',
        link: 'bg-transparent text-accent-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 text-[14px] gap-2 [&_svg]:size-4',
        sm: 'h-8 px-4 text-[13px] gap-2 [&_svg]:size-3.5',
        lg: 'h-11 px-6 text-[15px] gap-2 [&_svg]:size-4',
        icon: 'h-9 w-9 [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
