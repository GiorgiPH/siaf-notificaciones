'use client';

import { PanelLeft } from 'lucide-react';
import { ThemeSwitcher } from '@/core/components/ui/theme-switcher';
import { useSidebar } from '@/core/context/sidebar-context';

interface AppPageHeaderProps {
  title: string;
  subtitle?: string;
  /** Acciones propias de la página, a la izquierda del selector de tema. */
  actions?: React.ReactNode;
}

/**
 * Encabezado estándar de las pantallas de la app: alternar sidebar (en celular abre el menú), título, acciones y tema.
 */
export function AppPageHeader({ title, subtitle, actions }: AppPageHeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="border-b border-border-low bg-bg-base">
      <div className="flex items-center gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <button
          type="button"
          onClick={toggle}
          aria-label="Alternar menú"
          className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl text-content-low transition-colors hover:text-content-high md:size-auto"
        >
          <PanelLeft size={20} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h1 className="ds-heading-sm truncate text-content-high">{title}</h1>
          {subtitle && <p className="ds-body-sm text-content-low">{subtitle}</p>}
        </div>
        {actions}
        <ThemeSwitcher />
      </div>
    </header>
  );
}
