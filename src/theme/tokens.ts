// Semantic theme tokens per docs/specs/05-theme-design-system.md
// All color, spacing, typography, and radius tokens centralized here.

export type ThemeTokens = {
  bg: {
    app: string;
    surface: string;
    surfaceElevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    inverse: string;
  };
  border: {
    default: string;
    subtle: string;
  };
  icon: {
    primary: string;
    secondary: string;
  };
  action: {
    primaryBg: string;
    primaryText: string;
    secondaryBg: string;
    secondaryText: string;
    dangerBg: string;
    dangerText: string;
  };
  state: {
    success: string;
    warning: string;
    error: string;
  };
  accent: {
    softSky: string;
  };
  font: {
    size: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    weight: {
      regular: 400 | 500 | 600 | 700;
      medium: 400 | 500 | 600 | 700;
      semibold: 400 | 500 | 600 | 700;
      bold: 400 | 500 | 600 | 700;
    };
  };
  space: {
    0: number;
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    8: number;
    10: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
};

export const sharedTokens = {
  font: {
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 28,
    },
    weight: {
      regular: 400 as const,
      medium: 500 as const,
      semibold: 600 as const,
      bold: 700 as const,
    },
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
};
