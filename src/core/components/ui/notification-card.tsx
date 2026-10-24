'use client';

import { useState } from 'react';
import { ArrowRight, ArrowDown, Bell, type LucideIcon } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';
import { Badge } from './badge';
import { Button } from './button';

interface NotificationCardProps {
  title: string;
  subtitle: string;
  tag: string;
  tagIcon?: LucideIcon;
  date: string;
  folio: string;
  unread?: boolean;
  detailTitle?: string;
  detailDescription?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  defaultExpanded?: boolean;
  className?: string;
}

export function NotificationCard({
  title,
  subtitle,
  tag,
  tagIcon: TagIcon = Bell,
  date,
  folio,
  unread = false,
  detailTitle = 'Detalle de notificación',
  detailDescription,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  defaultExpanded = false,
  className,
}: NotificationCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={cn(
      'flex flex-col rounded-2xl border border-border-low overflow-hidden',
      unread ? 'bg-bg-surface-high' : 'bg-bg-base',
      className,
    )}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-5">
        <div className="flex flex-col gap-2 min-w-0">
          <h3 className="font-sans text-[15px] font-normal text-content-high leading-snug">{title}</h3>
          <p className="font-sans text-[13px] font-extralight text-content-low leading-snug">{subtitle}</p>
        </div>
        {unread && (
          <span className="flex items-center gap-1.5 flex-shrink-0 font-sans text-[12px] font-extralight text-accent-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
            No Leído
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className={cn(
          'flex items-center justify-between gap-3 px-5 pb-4 text-left',
          expanded ? 'pt-0' : cn('pt-3 border-t', unread ? 'border-border-md' : 'border-border-low'),
        )}
      >
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <Badge variant="rose" className="gap-1 px-2 py-0 text-[11px] leading-[16px]">
            <TagIcon size={11} strokeWidth={1.75} />
            {tag}
          </Badge>
          <span className="font-sans text-[12px] font-extralight text-content-low">{date}</span>
          <span className="font-sans text-[12px] font-extralight text-content-low">Folio: {folio}</span>
        </div>
        {expanded ? (
          <ArrowDown size={16} strokeWidth={1.75} className="flex-shrink-0 text-accent-primary" />
        ) : (
          <ArrowRight size={16} strokeWidth={1.75} className="flex-shrink-0 text-accent-primary" />
        )}
      </button>

      {expanded && (
        <div className={cn('flex flex-col gap-3 px-5 pt-4 pb-5 border-t', unread ? 'border-border-md' : 'border-border-low')}>
          <h4 className="font-sans text-[14px] font-normal text-content-high">{detailTitle}</h4>
          {detailDescription && (
            <p className="font-sans text-[13px] font-extralight text-content-low leading-relaxed">{detailDescription}</p>
          )}
          {(primaryActionLabel || secondaryActionLabel) && (
            <div className="flex items-center gap-5 mt-1">
              {primaryActionLabel && (
                <Button size="sm" onClick={onPrimaryAction}>{primaryActionLabel}</Button>
              )}
              {secondaryActionLabel && (
                <Button variant="link" size="sm" onClick={onSecondaryAction}>{secondaryActionLabel}</Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
