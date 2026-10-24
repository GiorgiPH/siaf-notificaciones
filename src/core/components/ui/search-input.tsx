'use client';

// Input compacto (barras de filtro, toolbars, tablas) — para el buscador hero de portada usar SearchBar.
import { Search } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({ placeholder = 'Buscar...', value, onChange, className }: SearchInputProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 bg-bg-base rounded-xl px-3 h-9 border border-border-low',
      'hover:bg-bg-surface-low focus-within:bg-bg-base transition-colors',
      className,
    )}>
      <Search className="h-4 w-4 text-content-low flex-shrink-0" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.trimStart())}
        className="flex-1 bg-transparent border-none outline-none text-sm text-content-high placeholder:text-content-low min-w-0"
      />
    </div>
  );
}
