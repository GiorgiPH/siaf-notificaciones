'use client';
import * as React from 'react';

export type DonutDatum = { label: string; value: number };

export interface DonutChartProps {
  data: DonutDatum[];
  palette?: string[];
  size?: number;
  radius?: number;
  innerRadius?: number;
  title?: string;
  description?: string;
  totalLabel?: string;
  className?: string;
}

const DEFAULT_PALETTE = [
  'var(--color-core-mora-20)',
  'var(--color-core-mora-40)',
  'var(--color-core-mora-50)',
  'var(--color-core-mora-60)',
];

export function DonutChart({
  data,
  palette = DEFAULT_PALETTE,
  size = 260,
  radius = 110,
  innerRadius = 72,
  title,
  description,
  totalLabel = 'Total',
  className,
}: DonutChartProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const cx = size / 2;
  const cy = size / 2;

  const total = data.reduce((s, d) => s + d.value, 0);

  const segments = React.useMemo(() => {
    let acc = -Math.PI / 2;
    return data.map((d, i) => {
      const frac = total > 0 ? d.value / total : 0;
      const start = acc;
      const end = acc + frac * Math.PI * 2;
      acc = end;
      return { ...d, start, end, color: palette[i % palette.length], frac };
    });
  }, [data, palette, total]);

  const hovered = hover !== null ? segments[hover] : null;

  const polar = (angle: number, r: number) => {
    const round = (n: number) => Math.round(n * 1e8) / 1e8;
    return { x: round(cx + r * Math.cos(angle)), y: round(cy + r * Math.sin(angle)) };
  };

  const arcPath = (start: number, end: number) => {
    const s1 = polar(start, radius);
    const e1 = polar(end, radius);
    const s2 = polar(end, innerRadius);
    const e2 = polar(start, innerRadius);
    const large = end - start > Math.PI ? 1 : 0;
    return [
      `M ${s1.x} ${s1.y}`,
      `A ${radius} ${radius} 0 ${large} 1 ${e1.x} ${e1.y}`,
      `L ${s2.x} ${s2.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${large} 0 ${e2.x} ${e2.y}`,
      'Z',
    ].join(' ');
  };

  return (
    <div className={`bg-bg-base rounded-2xl border border-border-low p-4 flex flex-col shadow-sm ${className ?? ''}`}>
      {(title || description) && (
        <div className="mb-3">
          {title && <h2 className="text-base font-light text-content-high">{title}</h2>}
          {description && <p className="text-xs font-light text-content-low mt-0.5">{description}</p>}
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            onMouseLeave={() => setHover(null)}
          >
            {segments.map((seg, i) => {
              const isHover = hover === i;
              const dimmed = hover !== null && !isHover;
              return (
                <path
                  key={i}
                  d={arcPath(seg.start, seg.end)}
                  onMouseEnter={() => setHover(i)}
                  className="transition-opacity cursor-pointer"
                  style={{ fill: seg.color, opacity: dimmed ? 0.25 : 1 }}
                />
              );
            })}
            {hovered && (() => {
              const midAngle = (hovered.start + hovered.end) / 2;
              const r = (radius + innerRadius) / 2;
              const x = cx + r * Math.cos(midAngle);
              const y = cy + r * Math.sin(midAngle);
              return (
                <g transform={`translate(${x}, ${y})`} pointerEvents="none">
                  <rect x={-24} y={-11} width={48} height={22} rx={4} style={{ fill: 'var(--sem-bg-base)', stroke: hovered.color }} strokeWidth={1} />
                  <text x={0} y={4} textAnchor="middle" fontSize={11} fontWeight={600} style={{ fill: hovered.color }} className="tabular-nums">
                    {`${(hovered.frac * 100).toFixed(1)}%`}
                  </text>
                </g>
              );
            })()}
          </svg>
          {!hovered && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-lg font-bold text-content-high tabular-nums leading-none">{total}</p>
              <p className="text-[10px] font-light text-content-low mt-0.5">{totalLabel}</p>
            </div>
          )}
        </div>

        <ul className="w-full flex flex-col gap-1.5">
          {segments.map((seg, i) => {
            const isHover = hover === i;
            const dimmed = hover !== null && !isHover;
            return (
              <li
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="flex items-center gap-2 transition-opacity cursor-pointer"
                style={{ opacity: dimmed ? 0.4 : 1 }}
              >
                <span className="inline-block h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <span className={`text-xs truncate flex-1 text-content-high ${isHover ? 'font-bold' : 'font-light'}`}>
                  {seg.label}
                </span>
                <span className={`text-xs tabular-nums flex-shrink-0 text-content-high ${isHover ? 'font-bold' : 'font-light'}`}>
                  {seg.value}
                </span>
                <span
                  className="text-[10px] font-light text-content-low tabular-nums flex-shrink-0 w-8 text-right"
                  style={{ visibility: isHover ? 'visible' : 'hidden' }}
                >
                  {Math.round(seg.frac * 100)}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
