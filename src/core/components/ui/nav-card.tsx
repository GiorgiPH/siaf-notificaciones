import { type LucideIcon } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

interface NavCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: 'base' | 'surface';
  className?: string;
}

export function NavCard({ icon: Icon, title, description, variant = 'base', className }: NavCardProps) {
  return (
    <div className={cn(
      'w-full rounded-2xl p-4 flex items-center gap-4',
      variant === 'base'
        ? 'bg-bg-base border border-border-low'
        : 'bg-bg-surface-low',
      className,
    )}>
      <div className={cn(
        'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0',
        variant === 'base' ? 'bg-bg-surface-low' : 'bg-bg-surface-md',
      )}>
        <Icon size={24} strokeWidth={2} className="text-accent-secondary" />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[15px] font-normal text-content-high">{title}</p>
        <p className="text-[13px] font-light text-content-low">{description}</p>
      </div>
    </div>
  );
}
