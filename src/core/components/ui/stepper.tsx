import { Check } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

export type StepStatus = 'pending' | 'active' | 'completed' | 'warning' | 'error';

export interface StepperStep {
  label: string;
  status: StepStatus;
}

export type StepperVariant = 'default' | 'plum';

interface StepperProps {
  steps: StepperStep[];
  className?: string;
  variant?: StepperVariant;
}

function StepCircle({ status, number, variant = 'default' }: { status: StepStatus; number: number; variant?: StepperVariant }) {
  if (status === 'completed') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-support-success text-support-on-success flex-shrink-0">
        <Check size={15} strokeWidth={2.5} />
      </div>
    );
  }
  if (status === 'warning') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-support-warning text-support-on-warning flex-shrink-0">
        <span className="text-sm font-bold leading-none">!</span>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-support-error text-support-on-error flex-shrink-0">
        <span className="text-sm font-bold leading-none">!</span>
      </div>
    );
  }
  if (status === 'active') {
    const activeClass = variant === 'plum'
      ? 'bg-accent-primary text-accent-on-primary'
      : 'bg-support-info text-support-on-info';
    return (
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0', activeClass)}>
        <span className="text-sm font-semibold leading-none">{number}</span>
      </div>
    );
  }
  // pending
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border-md text-content-low flex-shrink-0">
      <span className="text-sm font-semibold leading-none">{number}</span>
    </div>
  );
}

export function Stepper({ steps, className, variant = 'default' }: StepperProps) {
  return (
    <div className={cn('flex items-start w-full', className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const nextStatus = !isLast ? steps[i + 1].status : null;

        const connectorClass =
          nextStatus === 'error' ? 'bg-support-error' :
          (nextStatus === 'active' && variant === 'plum') ? 'bg-accent-primary' :
          step.status === 'completed' ? 'bg-support-success' :
          'bg-border-md';

        return (
          <div key={i} className="flex flex-1 items-start min-w-0">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <StepCircle status={step.status} number={i + 1} variant={variant} />
              <span className="ds-label-sm text-content-low text-center whitespace-nowrap">{step.label}</span>
            </div>
            {!isLast && (
              <div className={cn('flex-1 h-0.5 mt-4 mx-1', connectorClass)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
