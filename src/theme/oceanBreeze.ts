export const oceanBreezeTheme = {
  id: 'ocean-breeze',
  name: 'Ocean Breeze',
  description: 'Clean, minimal light theme perfect for maritime crew management',
  type: 'light' as const,
  
  colors: {
    // Primary colors
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryLight: '#7dd3fc',
    primaryDark: '#0369a1',
    
    // Secondary colors
    secondary: '#0284c7',
    secondaryHover: '#075985',
    secondaryLight: '#38bdf8',
    
    // Accent colors
    accent: '#6366f1',
    accentHover: '#4f46e5',
    accentLight: '#818cf8',
    
    // Background colors
    background: '#f8fafc',
    backgroundAlt: '#f1f5f9',
    
    // Surface colors
    surface: '#ffffff',
    surfaceHover: '#f8fafc',
    surfaceElevated: '#fafbfc',
    
    // Border colors
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    borderLight: '#f1f5f9',
    
    // Text colors
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#64748b',
      disabled: '#94a3b8',
      inverse: '#ffffff'
    },
    
    // Status colors
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#0ea5e9',
    infoLight: '#e0f2fe'
  },
  
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 2px 8px rgba(14, 165, 233, 0.08)',
    md: '0 4px 12px rgba(14, 165, 233, 0.12)',
    lg: '0 8px 24px rgba(14, 165, 233, 0.15)',
    xl: '0 12px 36px rgba(14, 165, 233, 0.18)',
    '2xl': '0 20px 60px rgba(14, 165, 233, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
  },
  
  effects: {
    glass: 'backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.8);',
    glassDark: 'backdrop-filter: blur(10px); background: rgba(248, 250, 252, 0.6);',
    glow: '0 0 20px rgba(14, 165, 233, 0.3)',
    glowStrong: '0 0 30px rgba(14, 165, 233, 0.5)',
    gradientPrimary: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    gradientAccent: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(14, 165, 233, 0.02) 100%)'
  },
  
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px'
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px'
  },
  
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
      mono: '"SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace'
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  }
};

export type OceanBreezeTheme = typeof oceanBreezeTheme;


