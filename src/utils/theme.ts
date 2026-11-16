import { ThemeConfig } from '../types/config';

/**
 * Applies theme properties to CSS variables on a specified DOM element (or document.documentElement).
 * This allows dynamic theming purely from config.json without rebuilding CSS.
 */
export function applyTheme(theme: ThemeConfig, targetElement?: HTMLElement | null): void {
  const el = targetElement || document.documentElement;

  el.style.setProperty('--color-primary', theme.primaryColor);
  el.style.setProperty('--color-primary-hover', theme.primaryHoverColor);
  el.style.setProperty('--color-background', theme.backgroundColor);
  el.style.setProperty('--color-surface', theme.surfaceColor);
  el.style.setProperty('--color-text', theme.textColor);
  el.style.setProperty('--color-text-muted', theme.textMutedColor);
  el.style.setProperty('--color-error', theme.errorColor);
  el.style.setProperty('--color-border', theme.borderColor);
  el.style.setProperty('--border-radius', theme.borderRadius);
}

