'use client';

import { useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'generic';

interface AlertBannerProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantClasses: Record<AlertVariant, { bg: string; text: string }> = {
  info: { bg: 'bg-support-info-low', text: 'text-support-on-info-low' },
  success: { bg: 'bg-support-success-low', text: 'text-support-on-success-low' },
  warning: { bg: 'bg-support-warning-low', text: 'text-support-on-warning-low' },
  error: { bg: 'bg-support-error-low', text: 'text-support-on-error-low' },
  generic: { bg: 'bg-bg-surface-high', text: 'text-content-high' },
};

function InfoGlyph({ maskId, className }: { maskId: string; className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className={cn('flex-shrink-0', className)} aria-hidden="true">
      <mask id={maskId}>
        <rect width="24" height="24" fill="black" />
        <circle cx="12" cy="12" r="10" fill="white" />
        <rect x="11.2" y="7.1" width="1.6" height="1.6" fill="black" />
        <rect x="11.2" y="10.9" width="1.6" height="6" fill="black" />
      </mask>
      <rect width="24" height="24" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}

export function AlertBanner({ variant = 'info', children, onClose, className }: AlertBannerProps) {
  const v = variantClasses[variant];
  const id = useId();

  return (
    <div className={cn('@container rounded-2xl px-5 py-3.5', v.bg, className)}>
      {/* Angosto — icono y texto alineados a la izquierda */}
      <div className={cn('flex items-start gap-3 @md:hidden', v.text)}>
        <InfoGlyph maskId={`${id}-sm`} className="mt-0.5" />
        <p className="flex-1 text-left font-sans text-[14px] font-extralight leading-snug [&_a]:underline [&_a]:underline-offset-2">
          {children}
        </p>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex-shrink-0">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Ancho — icono y texto centrados como grupo */}
      <div className="hidden @md:grid @md:grid-cols-[1fr_auto_1fr] @md:items-center @md:gap-3">
        <span aria-hidden="true" />
        <p className={cn(
          'flex items-start justify-center gap-2 text-center font-sans text-[14px] font-extralight leading-snug',
          v.text,
        )}>
          <InfoGlyph maskId={`${id}-lg`} />
          <span className="[&_a]:underline [&_a]:underline-offset-2">{children}</span>
        </p>
        <div className="flex justify-end">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className={cn('flex-shrink-0', v.text)}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
