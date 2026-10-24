// Config de temas compartida entre Server (layout) y Client (provider).
// SIN 'use client': se puede importar desde Server Components.

export type Theme = 'light' | 'dark' | 'hc' | 'mono';

export const THEMES: Theme[] = ['light', 'dark', 'hc', 'mono'];
export const THEME_COOKIE = 'theme';
export const DEFAULT_THEME: Theme = 'light';

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as string[]).includes(value);
}
