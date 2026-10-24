import { Heart, ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';
import { Badge } from './badge';

interface TramiteResultCardProps {
  title: string;
  description?: string;
  tags?: string[];
  icon: LucideIcon;
  category: string;
  layout?: 'list' | 'grid';
  compact?: boolean;
  favorite?: boolean;
  onFavoriteToggle?: () => void;
  href?: string;
  className?: string;
}

export function TramiteResultCard({
  title,
  description,
  tags,
  icon: Icon,
  category,
  layout = 'list',
  compact = false,
  favorite = false,
  onFavoriteToggle,
  href = '#',
  className,
}: TramiteResultCardProps) {
  const tagsRow = tags && tags.length > 0 && (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tags.map((t) => (
        <Badge key={t} variant="info" className="px-2 py-0.5 text-[11px]">{t}</Badge>
      ))}
    </div>
  );

  const favoriteBtn = onFavoriteToggle && (
    <button
      type="button"
      onClick={onFavoriteToggle}
      aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={cn(
        'flex-shrink-0 transition-colors',
        favorite ? 'text-accent-primary' : 'text-content-low hover:text-accent-primary',
      )}
    >
      <Heart size={18} strokeWidth={1.75} fill={favorite ? 'currentColor' : 'none'} />
    </button>
  );

  const categoryRow = (
    <span className="flex items-start gap-1.5 font-sans text-[13px] font-light text-content-low min-w-0">
      <Icon size={14} strokeWidth={1.75} className="flex-shrink-0 mt-0.5" />
      <span>{category}</span>
    </span>
  );

  if (compact) {
    return (
      <div className={cn('flex flex-col gap-1.5 rounded-2xl border border-border-low bg-bg-base p-4', className)}>
        <div className="flex items-center justify-between gap-3">
          <a href={href} className="font-sans text-[15px] font-light text-content-high leading-snug hover:underline">
            {title}
          </a>
          <a href={href} aria-label={title} className="flex-shrink-0 text-accent-primary">
            <ArrowRight size={16} strokeWidth={1.75} />
          </a>
        </div>
        {categoryRow}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col rounded-2xl border border-border-low bg-bg-base overflow-hidden', className)}>
      {layout === 'list' ? (
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="flex flex-col gap-1 min-w-0">
            <a href={href} className="font-sans text-[16px] font-light text-content-high leading-snug hover:underline">
              {title}
            </a>
            {description && (
              <p className="font-sans text-[13px] font-light text-content-low leading-snug">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {tagsRow}
            {favoriteBtn}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            {tagsRow}
            {favoriteBtn}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <a href={href} className="font-sans text-[16px] font-light text-content-high leading-snug hover:underline">
              {title}
            </a>
            {description && (
              <p className="font-sans text-[13px] font-light text-content-low leading-snug">{description}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border-low">
        {categoryRow}
        <a href={href} aria-label={title} className="flex-shrink-0 text-accent-primary">
          <ArrowRight size={16} strokeWidth={1.75} />
        </a>
      </div>
    </div>
  );
}
