'use client';

import * as React from 'react';
import { useTheme, type Theme } from '@/core/components/providers/theme-provider';
import { Sun, Moon, Contrast, Circle, Check } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu';

type ThemeOption = {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const THEMES: ThemeOption[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'hc', label: 'Alto contraste', icon: Contrast },
  { value: 'mono', label: 'Monocromático', icon: Circle },
];

export function ThemeSwitcher({ triggerClassName }: { triggerClassName?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? theme ?? 'light' : 'light';
  const active = THEMES.find((t) => t.value === activeTheme) ?? THEMES[0];
  const ActiveIcon = active.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Cambiar tema"
        className={triggerClassName ?? "flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface-low hover:bg-bg-surface-high text-content-low hover:text-content-high transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-support-focus"}
      >
        <ActiveIcon size={22} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>Tema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((option) => {
          const Icon = option.icon;
          const isActive = mounted && activeTheme === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="gap-2"
            >
              <Icon size={16} />
              <span className="flex-1">{option.label}</span>
              {isActive ? <Check className="size-4" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeSwitcher;
