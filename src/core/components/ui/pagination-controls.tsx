'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function buildPages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [];
  if (current <= 3) {
    pages.push(1, 2, 3, 'ellipsis', total);
  } else if (current >= total - 2) {
    pages.push(1, 'ellipsis', total - 2, total - 1, total);
  } else {
    pages.push(1, 'ellipsis', current, 'ellipsis', total);
  }
  return pages;
}

export function PaginationControls({
  page,
  total,
  limit,
  onPageChange,
}: PaginationControlsProps) {
  const [jumpValue, setJumpValue] = React.useState('');

  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pages = buildPages(page, totalPages);

  function handleJump(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(jumpValue);
    if (Number.isFinite(n) && n >= 1 && n <= totalPages) {
      onPageChange(n);
      setJumpValue('');
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface-low text-content-high transition-colors hover:bg-bg-surface-md focus:outline-none focus-visible:ring-2 focus-visible:ring-support-focus disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e-${idx}`} className="px-2 text-sm text-content-low">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              data-selected={p === page ? 'true' : undefined}
              className={cn(
                'pagination-page-btn flex h-9 w-9 items-center justify-center rounded-md text-sm font-light text-content-high transition-colors',
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface-low text-content-high transition-colors hover:bg-bg-surface-md focus:outline-none focus-visible:ring-2 focus-visible:ring-support-focus disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleJump} className="flex items-center gap-3 text-sm text-content-high">
        <label htmlFor="pagination-jump" className="font-light">Ir a página</label>
        <input
          id="pagination-jump"
          type="number"
          min={1}
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          className="h-9 w-11 rounded-md border border-border-md bg-bg-base px-2 text-center text-sm font-light text-content-high focus:outline-none focus:ring-2 focus:ring-support-focus"
        />
      </form>
    </div>
  );
}
