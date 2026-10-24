'use client';
import { createContext, useContext } from 'react';
interface SidebarCtx { collapsed: boolean; toggle: () => void }
export const SidebarContext = createContext<SidebarCtx>({ collapsed: false, toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);
