import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { oceanBreezeTheme } from '../theme';
import type { Theme, ThemeContextValue } from '../theme/types';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>('ocean-breeze');
  const [theme] = useState<Theme>(oceanBreezeTheme);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('wavesync-theme');
    if (savedTheme) {
      setThemeName(savedTheme);
    }
  }, []);

  // Save theme preference and apply CSS variables when theme changes
  useEffect(() => {
    localStorage.setItem('wavesync-theme', themeName);
    applyThemeVariables(theme);
  }, [themeName, theme]);

  // Apply theme variables to CSS custom properties
  const applyThemeVariables = (themeToApply: Theme) => {
    const root = document.documentElement;

    // Primary colors
    root.style.setProperty('--color-primary', themeToApply.colors.primary);
    root.style.setProperty('--color-primary-hover', themeToApply.colors.primaryHover);
    root.style.setProperty('--color-primary-light', themeToApply.colors.primaryLight);
    root.style.setProperty('--color-primary-dark', themeToApply.colors.primaryDark);

    // Secondary colors
    root.style.setProperty('--color-secondary', themeToApply.colors.secondary);
    root.style.setProperty('--color-secondary-hover', themeToApply.colors.secondaryHover);
    root.style.setProperty('--color-secondary-light', themeToApply.colors.secondaryLight);

    // Accent colors
    root.style.setProperty('--color-accent', themeToApply.colors.accent);
    root.style.setProperty('--color-accent-hover', themeToApply.colors.accentHover);
    root.style.setProperty('--color-accent-light', themeToApply.colors.accentLight);

    // Background colors
    root.style.setProperty('--color-background', themeToApply.colors.background);
    root.style.setProperty('--color-background-alt', themeToApply.colors.backgroundAlt);

    // Surface colors
    root.style.setProperty('--color-surface', themeToApply.colors.surface);
    root.style.setProperty('--color-surface-hover', themeToApply.colors.surfaceHover);
    root.style.setProperty('--color-surface-elevated', themeToApply.colors.surfaceElevated);

    // Border colors
    root.style.setProperty('--color-border', themeToApply.colors.border);
    root.style.setProperty('--color-border-hover', themeToApply.colors.borderHover);
    root.style.setProperty('--color-border-light', themeToApply.colors.borderLight);

    // Text colors
    root.style.setProperty('--color-text-primary', themeToApply.colors.text.primary);
    root.style.setProperty('--color-text-secondary', themeToApply.colors.text.secondary);
    root.style.setProperty('--color-text-muted', themeToApply.colors.text.muted);
    root.style.setProperty('--color-text-disabled', themeToApply.colors.text.disabled);
    root.style.setProperty('--color-text-inverse', themeToApply.colors.text.inverse);

    // Status colors
    root.style.setProperty('--color-success', themeToApply.colors.success);
    root.style.setProperty('--color-success-light', themeToApply.colors.successLight);
    root.style.setProperty('--color-warning', themeToApply.colors.warning);
    root.style.setProperty('--color-warning-light', themeToApply.colors.warningLight);
    root.style.setProperty('--color-error', themeToApply.colors.error);
    root.style.setProperty('--color-error-light', themeToApply.colors.errorLight);
    root.style.setProperty('--color-info', themeToApply.colors.info);
    root.style.setProperty('--color-info-light', themeToApply.colors.infoLight);

    // Shadows
    root.style.setProperty('--shadow-xs', themeToApply.shadows.xs);
    root.style.setProperty('--shadow-sm', themeToApply.shadows.sm);
    root.style.setProperty('--shadow-md', themeToApply.shadows.md);
    root.style.setProperty('--shadow-lg', themeToApply.shadows.lg);
    root.style.setProperty('--shadow-xl', themeToApply.shadows.xl);
    root.style.setProperty('--shadow-2xl', themeToApply.shadows['2xl']);
    root.style.setProperty('--shadow-inner', themeToApply.shadows.inner);

    // Border radius
    root.style.setProperty('--radius-xs', themeToApply.radius.xs);
    root.style.setProperty('--radius-sm', themeToApply.radius.sm);
    root.style.setProperty('--radius-md', themeToApply.radius.md);
    root.style.setProperty('--radius-lg', themeToApply.radius.lg);
    root.style.setProperty('--radius-xl', themeToApply.radius.xl);
    root.style.setProperty('--radius-2xl', themeToApply.radius['2xl']);
    root.style.setProperty('--radius-3xl', themeToApply.radius['3xl']);
    root.style.setProperty('--radius-full', themeToApply.radius.full);

    // Spacing
    root.style.setProperty('--spacing-xs', themeToApply.spacing.xs);
    root.style.setProperty('--spacing-sm', themeToApply.spacing.sm);
    root.style.setProperty('--spacing-md', themeToApply.spacing.md);
    root.style.setProperty('--spacing-lg', themeToApply.spacing.lg);
    root.style.setProperty('--spacing-xl', themeToApply.spacing.xl);
    root.style.setProperty('--spacing-2xl', themeToApply.spacing['2xl']);
    root.style.setProperty('--spacing-3xl', themeToApply.spacing['3xl']);
    root.style.setProperty('--spacing-4xl', themeToApply.spacing['4xl']);

    // Transitions
    root.style.setProperty('--transition-fast', themeToApply.transitions.fast);
    root.style.setProperty('--transition-base', themeToApply.transitions.base);
    root.style.setProperty('--transition-slow', themeToApply.transitions.slow);

    // Typography
    root.style.setProperty('--font-sans', themeToApply.typography.fontFamily.sans);
    root.style.setProperty('--font-mono', themeToApply.typography.fontFamily.mono);
  };

  const value: ThemeContextValue = {
    theme,
    themeName,
    setTheme: setThemeName
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


