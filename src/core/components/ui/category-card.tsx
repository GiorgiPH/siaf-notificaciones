import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  count: number;
  countLabel?: string;
  href?: string;
  className?: string;
}

export function CategoryCard({
  icon: Icon,
  title,
  count,
  countLabel = 'trámites',
  href = '#',
  className,
}: CategoryCardProps) {
  return (
    <a
      href={href}
      className={cn(
        'group flex flex-col gap-4 rounded-3xl border border-border-low bg-bg-base p-6',
        'hover:border-border-high hover:shadow-md transition-all',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-surface-md flex-shrink-0">
        <Icon size={24} strokeWidth={1.75} className="text-content-high" />
      </div>
      <h3 className="font-sans text-[17px] font-normal text-content-high leading-snug">
        {title}
      </h3>
      <span className="inline-flex items-center gap-1.5 font-sans text-[14px] font-light text-accent-primary group-hover:underline">
        {count} {countLabel}
        <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}
