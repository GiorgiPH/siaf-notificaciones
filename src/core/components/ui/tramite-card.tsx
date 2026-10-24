import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

interface TramiteCardProps {
  tag: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  href?: string;
  className?: string;
}

export function TramiteCard({
  tag,
  title,
  description,
  icon: Icon,
  category,
  href = '#',
  className,
}: TramiteCardProps) {
  return (
    <a
      href={href}
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border border-border-low bg-bg-base p-5',
        'hover:border-border-high hover:shadow-md transition-all',
        className,
      )}
    >
      <span className="inline-flex w-fit items-center rounded-md border border-border-low bg-bg-surface-low px-3 py-1 text-[12px] font-light text-content-low">
        {tag}
      </span>

      <div className="flex items-start justify-between gap-4">
        <h3 className="font-sans text-[16px] font-normal text-content-high leading-snug">{title}</h3>
        <ChevronRight
          size={18}
          className="flex-shrink-0 mt-0.5 text-content-low transition-transform group-hover:translate-x-0.5"
        />
      </div>

      <p className="font-sans text-[14px] font-light text-content-low leading-snug">{description}</p>

      <div className="flex items-center gap-1.5">
        <Icon size={14} strokeWidth={1.75} className="flex-shrink-0 text-content-low" />
        <span className="font-sans text-[13px] font-light text-content-low">{category}</span>
      </div>
    </a>
  );
}
