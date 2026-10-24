import { ArrowRight } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

interface LinkCardProps {
  title: string;
  href?: string;
  className?: string;
}

export function LinkCard({ title, href = '#', className }: LinkCardProps) {
  return (
    <a
      href={href}
      className={cn(
        'group flex items-center justify-between gap-4 rounded-2xl bg-bg-surface-low px-6 py-4',
        'hover:bg-bg-base hover:shadow-md active:bg-bg-surface-high transition-all',
        className,
      )}
    >
      <span className="font-sans text-[16px] font-normal text-content-high">{title}</span>
      <ArrowRight
        size={18}
        strokeWidth={1.75}
        className="flex-shrink-0 text-accent-primary transition-transform group-hover:translate-x-0.5"
      />
    </a>
  );
}
