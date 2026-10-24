'use client';
import * as React from 'react';

export type HorizontalBarDatum = { key: string; label: string; sublabel?: string; value: number };

export interface HorizontalBarChartProps {
  data: HorizontalBarDatum[];
  baseColor?: string;
  hoverColor?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function HorizontalBarChart({
  data,
  baseColor = 'var(--color-core-mora-60)',
  hoverColor = 'var(--sem-accent-primary)',
  title,
  description,
  className,
}: HorizontalBarChartProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const max = data.length > 0 ? data[0].value : 1;

  return (
    <div className={`bg-bg-base rounded-2xl border border-border-low p-4 flex flex-col shadow-sm ${className ?? ''}`}>
      {(title || description) && (
        <div className="mb-3">
          {title && <h2 className="text-base font-light text-content-high">{title}</h2>}
          {description && <p className="text-xs font-light text-content-low mt-0.5">{description}</p>}
        </div>
      )}

      <ul className="flex flex-col gap-2" onMouseLeave={() => setHover(null)}>
        {data.map((row, i) => {
          const pct = (row.value / max) * 100;
          const isHover = hover === i;
          const dimmed = hover !== null && !isHover;
          return (
            <li
              key={row.key}
              onMouseEnter={() => setHover(i)}
              className="relative flex items-center gap-3 transition-opacity"
              style={{ opacity: dimmed ? 0.35 : 1 }}
            >
              <span className="w-5 text-xs font-light text-content-low tabular-nums text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span className="text-xs font-light text-content-high truncate" title={row.sublabel ?? row.label}>
                    {row.label}
                  </span>
                  <span className="text-xs font-light text-content-high tabular-nums flex-shrink-0">{row.value}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-bg-surface-low overflow-visible relative">
                  <div
                    className="h-full rounded-full transition-all relative"
                    style={{ width: `${pct}%`, backgroundColor: isHover ? hoverColor : baseColor }}
                  >
                    {isHover && (
                      <div
                        className="absolute right-0 -top-6 pointer-events-none z-10 rounded px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                        style={{ backgroundColor: 'var(--sem-bg-base)', border: `1px solid ${hoverColor}`, color: hoverColor, transform: 'translateX(50%)' }}
                      >
                        {row.value}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
