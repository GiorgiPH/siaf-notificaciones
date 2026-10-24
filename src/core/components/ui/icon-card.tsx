import { type LucideIcon } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

interface IconCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  linkText?: string;
  linkHref?: string;
  className?: string;
}

export function IconCard({
  icon: Icon,
  title,
  description,
  linkText,
  linkHref = '#',
  className,
}: IconCardProps) {
  return (
    <div className={cn(
      'flex items-start gap-4 rounded-2xl border border-border-low bg-bg-base p-5',
      className,
    )}>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-reactive-accent-hover flex-shrink-0">
        <Icon size={20} strokeWidth={1.75} className="text-accent-primary" />
      </div>
      <div className="flex flex-col gap-1 pt-0.5">
        <h3 className="font-sans text-[15px] font-normal text-content-high leading-snug">{title}</h3>
        {description && (
          <p className="font-sans text-[13px] font-light text-content-low leading-snug">{description}</p>
        )}
        {linkText && (
          <a
            href={linkHref}
            className="font-sans text-[13px] font-light text-accent-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {linkText}
          </a>
        )}
      </div>
    </div>
  );
}
