import { ClipboardList, LayoutDashboard, LayoutGrid, MapPinned, Package, type LucideIcon } from 'lucide-react';

/**
 * Ícono por `url` de módulo. El menú lo define el backend (`DBA_C_MODULOS`,
 * vía `/auth/perfil`), que no manda ícono: al agregar un módulo, registra
 * aquí su ícono; si no, se usa `DEFAULT_MENU_ICON`.
 */
export const MENU_ICONS: Readonly<Record<string, LucideIcon>> = {
  '/inicio': LayoutDashboard,
  '/notificaciones-campo': ClipboardList,
  '/paquetes': Package,
  '/mis-paquetes': MapPinned,
};

export const DEFAULT_MENU_ICON: LucideIcon = LayoutGrid;

export function menuIcon(url: string): LucideIcon {
  return MENU_ICONS[url] ?? DEFAULT_MENU_ICON;
}
