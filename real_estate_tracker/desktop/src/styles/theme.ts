// Modern Design System for Real Estate Tracker
// This file contains all design tokens for a cohesive, modern UI

export const theme = {
  // Color Palette
  colors: {
    // Primary colors - Modern blue palette
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93bbfd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },

    // Accent colors - Vibrant accents
    accent: {
      blue: "#0ea5e9",
      purple: "#8b5cf6",
      pink: "#ec4899",
      emerald: "#10b981",
      amber: "#f59e0b",
      rose: "#f43f5e",
    },

    // Neutral colors - Warm grays
    gray: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      950: "#09090b",
    },

    // Semantic colors
    semantic: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },

    // Background colors
    background: {
      primary: "#ffffff",
      secondary: "#fafafa",
      tertiary: "#f4f4f5",
      inverse: "#18181b",
    },

    // Dark mode colors
    dark: {
      background: {
        primary: "#09090b",
        secondary: "#18181b",
        tertiary: "#27272a",
        elevated: "#3f3f46",
      },
      border: "#3f3f46",
    },
  },

  // Typography
  typography: {
    fonts: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
    },

    sizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
    },

    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },

    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // Spacing system (based on 4px unit)
  spacing: {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
    32: "128px",
  },

  // Border radius
  radius: {
    none: "0px",
    sm: "4px",
    base: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    full: "9999px",
  },

  // Shadows (modern elevation system)
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",

    // Colored shadows for depth
    primary: "0 10px 40px -10px rgba(59, 130, 246, 0.25)",
    success: "0 10px 40px -10px rgba(16, 185, 129, 0.25)",
    error: "0 10px 40px -10px rgba(239, 68, 68, 0.25)",
  },

  // Animation
  animation: {
    durations: {
      fast: "150ms",
      base: "250ms",
      slow: "400ms",
      slower: "700ms",
    },

    easings: {
      linear: "linear",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },

  // Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    notification: 80,
  },

  // Glass morphism effects
  glass: {
    light: {
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.18)",
    },
    dark: {
      background: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.18)",
    },
  },
};

// CSS variables for runtime theming
export const cssVariables = `
  :root {
    /* Colors */
    --color-primary: ${theme.colors.primary[500]};
    --color-primary-hover: ${theme.colors.primary[600]};
    --color-background: ${theme.colors.background.primary};
    --color-text: ${theme.colors.gray[900]};
    --color-text-muted: ${theme.colors.gray[600]};
    --color-border: ${theme.colors.gray[200]};
    
    /* Spacing */
    --spacing-1: ${theme.spacing[1]};
    --spacing-2: ${theme.spacing[2]};
    --spacing-3: ${theme.spacing[3]};
    --spacing-4: ${theme.spacing[4]};
    --spacing-5: ${theme.spacing[5]};
    --spacing-6: ${theme.spacing[6]};
    
    /* Typography */
    --font-sans: ${theme.typography.fonts.sans};
    --font-mono: ${theme.typography.fonts.mono};
    
    /* Shadows */
    --shadow-sm: ${theme.shadows.sm};
    --shadow-base: ${theme.shadows.base};
    --shadow-lg: ${theme.shadows.lg};
    
    /* Animation */
    --duration-fast: ${theme.animation.durations.fast};
    --duration-base: ${theme.animation.durations.base};
    --easing-out: ${theme.animation.easings.out};
  }
  
  .dark {
    --color-background: ${theme.colors.dark.background.primary};
    --color-text: ${theme.colors.gray[100]};
    --color-text-muted: ${theme.colors.gray[400]};
    --color-border: ${theme.colors.dark.border};
  }
`;

// Utility functions
export const getColor = (path: string) => {
  const keys = path.split(".");
  let value: any = theme.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const getSpacing = (size: keyof typeof theme.spacing) =>
  theme.spacing[size];
export const getRadius = (size: keyof typeof theme.radius) =>
  theme.radius[size];
export const getShadow = (size: keyof typeof theme.shadows) =>
  theme.shadows[size];

export default theme;
