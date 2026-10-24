'use client';

import { useCallback, useMemo, useState } from 'react';
import { SidebarContext } from '@/core/context/sidebar-context';
import { TooltipProvider } from '@/core/components/ui/tooltip';

interface SidebarShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/** Marco de pantalla con sidebar colapsable + contenido. Lo comparten la app y el catálogo. */
export function SidebarShell({ sidebar, children }: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useCallback(() => setCollapsed((c) => !c), []);
  const value = useMemo(() => ({ collapsed, toggle }), [collapsed, toggle]);

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider>
        <div className="flex h-screen gap-2 overflow-hidden bg-bg-surface-low p-2">
          {sidebar}
          <main className="flex-1 overflow-auto rounded-xl bg-bg-base">{children}</main>
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}
