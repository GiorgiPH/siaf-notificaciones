'use client';
import * as React from 'react';

export interface BarChartProps {
  data: number[];
  labels: string[];
  baseColor?: string;
  hoverColor?: string;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
  className?: string;
}

function niceMax(value: number) {
  if (value <= 0) return 4;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const n = value / base;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : 10;
  return nice * base;
}

export function BarChart({
  data,
  labels,
  baseColor = 'var(--color-core-mora-60)',
  hoverColor = 'var(--sem-accent-primary)',
  width = 600,
  height = 170,
  title,
  description,
  className,
}: BarChartProps) {
  const [hoverBar, setHoverBar] = React.useState<number | null>(null);
  const max = niceMax(Math.max(1, ...data));
  const yTicks = 4;
  const pdg = { t: 28, r: 12, b: 26, l: 36 };
  const innerW = width - pdg.l - pdg.r;
  const innerH = height - pdg.t - pdg.b;
  const groupW = innerW / labels.length;
  const barW = Math.min(16, groupW - 8);

  return (
    <div className={`bg-bg-base rounded-2xl border border-border-low p-4 flex flex-col shadow-sm ${className ?? ''}`}>
      {(title || description) && (
        <div className="mb-3">
          {title && <h2 className="text-base font-light text-content-high">{title}</h2>}
          {description && <p className="text-xs font-light text-content-low mt-0.5">{description}</p>}
        </div>
      )}

      <div className="min-h-[140px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full block" preserveAspectRatio="none" onMouseLeave={() => setHoverBar(null)}>
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const y = pdg.t + (i / yTicks) * innerH;
            const val = Math.round(max - (i / yTicks) * max);
            return (
              <g key={i}>
                <line x1={pdg.l} y1={y} x2={pdg.l + innerW} y2={y} style={{ stroke: 'var(--sem-border-low)' }} strokeWidth={1} />
                <text x={pdg.l - 8} y={y + 4} textAnchor="end" fontSize={11} style={{ fill: 'var(--sem-content-low)' }} fontWeight={300}>
                  {val}
                </text>
              </g>
            );
          })}

          {labels.map((label, i) => {
            const gx = pdg.l + i * groupW + groupW / 2;
            const val = data[i];
            const barH = (val / max) * innerH;
            const barY = pdg.t + innerH - barH;
            const isHover = hoverBar === i;
            return (
              <g key={label} onMouseEnter={() => setHoverBar(i)}>
                <rect
                  x={gx - barW / 2} y={barY} width={barW} height={barH} rx={3}
                  style={{ fill: isHover ? hoverColor : baseColor, opacity: hoverBar !== null && !isHover ? 0.6 : 1 }}
                  className="transition-opacity cursor-pointer"
                />
                <text x={gx} y={height - 12} textAnchor="middle" fontSize={11} style={{ fill: 'var(--sem-content-low)' }} fontWeight={300}>
                  {label}
                </text>
                {isHover && val > 0 && (
                  <g transform={`translate(${gx}, ${barY - 6})`} pointerEvents="none">
                    <rect x={-24} y={-14} width={48} height={18} rx={4} style={{ fill: 'var(--sem-bg-base)', stroke: hoverColor }} strokeWidth={1} />
                    <text x={0} y={-1} textAnchor="middle" fontSize={11} fontWeight={600} style={{ fill: hoverColor }} className="tabular-nums">
                      {val}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
