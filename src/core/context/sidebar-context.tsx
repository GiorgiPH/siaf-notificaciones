'use client';
import { createContext, useContext } from 'react';

interface SidebarCtx {
  /** Sidebar colapsado a íconos (pantallas `md` en adelante). */
  collapsed: boolean;
  /** Desde `md` colapsa o expande; en celular abre el menú como panel lateral. */
  toggle: () => void;
}

export const SidebarContext = createContext<SidebarCtx>({ collapsed: false, toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);
