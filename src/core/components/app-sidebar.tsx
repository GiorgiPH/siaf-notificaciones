'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { logoutAction } from '@/core/auth/actions';
import type { AuthUser, ModuloMenu } from '@/core/auth/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/core/components/ui/tooltip';
import { useSidebar } from '@/core/context/sidebar-context';
import { cn } from '@/core/lib/utils/cn';
import { menuIcon } from './menu-icons';

interface AppSidebarProps {
  /** Menú ya filtrado por permisos por el backend. */
  menu: readonly ModuloMenu[];
  user: AuthUser;
}

const itemClass =
  'flex items-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-support-focus focus-visible:ring-offset-2';

/** Sidebar de la aplicación con el menú que autoriza el backend. */
export function AppSidebar({ menu, user }: AppSidebarProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  return (
    <aside
      className={cn(
        'flex h-full flex-shrink-0 flex-col rounded-xl bg-bg-surface-low transition-all duration-300 ease-in-out',
        collapsed ? 'w-[93px]' : 'w-[280px]',
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className={cn('flex flex-col items-center gap-2 p-3 pb-4', collapsed && 'px-0 py-3')}>
          {collapsed ? (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-bg-surface-high">
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden">
                <Image src="/FINANZAS COLOR 1.webp" alt="Escudo" fill className="object-cover object-left" priority />
              </div>
            </div>
          ) : (
            <Image
              src="/FINANZAS COLOR 1.webp"
              alt="Finanzas — Secretaría de Administración y Finanzas"
              width={200}
              height={64}
              className="h-auto w-full max-w-[200px] object-contain"
              priority
            />
          )}
        </div>

        <div className={cn('mb-2', collapsed ? 'flex justify-center' : 'border-t border-border-low')}>
          {collapsed && <div className="w-12 border-t border-border-low" />}
        </div>

        <nav aria-label="Menú principal" className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pt-1 pb-2">
          {menu.map((item) => {
            const href = item.url.startsWith('/') ? item.url : `/${item.url}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const Icon = menuIcon(href);
            const link = (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  itemClass,
                  'w-full',
                  collapsed ? 'mx-auto h-9 w-9 justify-center' : 'gap-6 px-3 py-2.5',
                  active ? 'bg-bg-base text-content-high shadow-sm' : 'text-content-low hover:bg-reactive-surface-hover',
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="ds-label-md flex-1 truncate">{item.nombre}</span>}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.nombre}</TooltipContent>
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-5 pb-1">
            <p className="ds-label-md truncate text-content-high">{user.displayName}</p>
            <p className="ds-label-sm truncate text-content-low">{user.username}</p>
          </div>
        )}

        <form action={logoutAction} className={cn('p-2 pt-0', collapsed && 'flex justify-center')}>
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className={cn(
              itemClass,
              'text-content-low hover:bg-reactive-surface-hover',
              collapsed ? 'h-9 w-9 justify-center' : 'w-full gap-6 px-3 py-2.5',
            )}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span className="ds-label-md">Cerrar sesión</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
