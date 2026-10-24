'use client';

// Buscador hero (píldora grande, ícono con brillos) — portadas/landing. Para inputs de filtro pequeños usar SearchInput.
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/core/lib/utils/cn';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = '¿Qué documento buscas?',
  className,
}: SearchBarProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className={cn('w-full max-w-2xl', className)}>
      <div className="flex items-center gap-3 bg-bg-surface-low rounded-full pl-8 pr-2 py-1.5 shadow-sm">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-content-high placeholder:text-content-high placeholder:opacity-100 text-xl leading-none min-w-0 truncate"
          aria-label="Buscar"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-content-low hover:text-content-high transition-colors flex-shrink-0"
            aria-label="Limpiar texto"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          className="rounded-full bg-accent-primary hover:bg-accent-primary/90 text-accent-on-primary flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ width: '52px', height: '52px', minWidth: '52px' }}
          aria-label="Buscar"
        >
          <Image src="/search-test.svg" alt="" width={46} height={46} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
