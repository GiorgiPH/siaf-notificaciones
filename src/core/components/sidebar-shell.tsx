'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarContext } from '@/core/context/sidebar-context';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/core/components/ui/sheet';
import { TooltipProvider } from '@/core/components/ui/tooltip';

/** Breakpoint `md` de Tailwind: desde aquí el sidebar va fijo; abajo es un panel lateral (celular en campo). */
const ESCRITORIO = '(min-width: 768px)';
/** El panel móvil siempre muestra el menú completo, nunca colapsado. */
const MENU_MOVIL = { collapsed: false } as const;

interface SidebarShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Marco de pantalla con sidebar + contenido. Desde `md` el sidebar es fijo y colapsable; en celular se oculta y el
 * botón de menú del encabezado lo abre como `Sheet` lateral, que se cierra solo al navegar.
 */
export function SidebarShell({ sidebar, children }: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const pathname = usePathname();

  const toggle = useCallback(() => {
    if (window.matchMedia(ESCRITORIO).matches) {
      setCollapsed((c) => !c);
    } else {
      setMovilAbierto((abierto) => !abierto);
    }
  }, []);
  const value = useMemo(() => ({ collapsed, toggle }), [collapsed, toggle]);
  const valueMovil = useMemo(() => ({ ...MENU_MOVIL, toggle }), [toggle]);

  useEffect(() => setMovilAbierto(false), [pathname]);

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider>
        <div className="flex h-dvh gap-0 overflow-hidden bg-bg-surface-low md:gap-2 md:p-2">
          <div className="hidden md:flex">{sidebar}</div>
          <main className="flex-1 overflow-auto bg-bg-base md:rounded-xl">{children}</main>
        </div>
        <Sheet open={movilAbierto} onOpenChange={setMovilAbierto}>
          <SheetContent side="left" className="w-[296px] border-border-low bg-bg-surface-low p-2 md:hidden">
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <SheetDescription className="sr-only">Módulos disponibles para tu usuario</SheetDescription>
            <SidebarContext.Provider value={valueMovil}>{sidebar}</SidebarContext.Provider>
          </SheetContent>
        </Sheet>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}
